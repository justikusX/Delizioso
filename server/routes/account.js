import { Router } from 'express';
import { pool } from '../db.js';
import { handle } from '../handle.js';
import { requireUser, publicUser } from '../middleware/auth.js';
import { text, checkPhone, joinPhone, hasErrors, sendErrors } from '../validation.js';

const router = Router();

router.use(requireUser);

router.get('/', handle(async (req, res) => {
    const id = req.user.id;
    const [orders, items, reservations, addresses] = await Promise.all([
        pool.query(`SELECT id, code, method, address, total, status, created_at AS "createdAt"
                    FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, [id]),
        pool.query(`SELECT i.order_id AS "orderId", d.name, i.quantity
                    FROM order_items i JOIN orders o ON o.id = i.order_id JOIN dishes d ON d.id = i.dish_id
                    WHERE o.user_id = $1 ORDER BY i.id`, [id]),
        pool.query(`SELECT code, reserved_for AS "reservedFor", guests, occasion, status
                    FROM reservations WHERE user_id = $1 ORDER BY reserved_for DESC`, [id]),
        pool.query('SELECT id, text, latitude, longitude FROM addresses WHERE user_id = $1 ORDER BY last_used_at DESC', [id]),
    ]);
    res.json({
        user: publicUser(req.user),
        orders: orders.rows.map(({ id: orderId, ...order }) => ({
            ...order,
            items: items.rows.filter((i) => i.orderId === orderId).map(({ name, quantity }) => ({ name, quantity })),
        })),
        reservations: reservations.rows,
        addresses: addresses.rows,
    });
}));

router.get('/addresses', handle(async (req, res) => {
    const { rows } = await pool.query(
        'SELECT id, text, latitude, longitude FROM addresses WHERE user_id = $1 ORDER BY last_used_at DESC LIMIT 5',
        [req.user.id],
    );
    res.json(rows);
}));

router.put('/profile', handle(async (req, res) => {
    const body = req.body || {};
    const errors = {};
    if (!text(body.fullName)) errors.fullName = 'Enter your full name';
    else if (text(body.fullName).length > 100) errors.fullName = 'Use at most 100 characters';
    checkPhone(errors, body.phoneCode, body.phone, false);
    if (hasErrors(errors)) return sendErrors(res, errors);

    const phone = text(body.phone) ? joinPhone(body.phoneCode, body.phone) : '';
    const { rows } = await pool.query('UPDATE users SET full_name = $1, phone = $2 WHERE id = $3 RETURNING *',
        [text(body.fullName), phone, req.user.id]);
    res.json({ user: publicUser(rows[0]) });
}));

router.delete('/addresses/:id', handle(async (req, res) => {
    await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [Number(req.params.id), req.user.id]);
    res.status(204).end();
}));

export default router;
