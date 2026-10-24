import { Router } from 'express';
import { pool } from '../db.js';
import { handle } from '../handle.js';
import { OCCASIONS, validateSlot } from '../rules.js';
import { text, checkEmail, checkPhone, checkLength, fullName, joinPhone, hasErrors, sendErrors } from '../validation.js';
import { newCode } from '../services/tokens.js';
import { rememberContact } from '../services/customers.js';
import { sendMail } from '../services/mail.js';
import { reservationConfirmed, reservationCancelled } from '../services/templates.js';

const router = Router();
const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const columns = `code, customer_name AS "customerName", phone, email, reserved_for AS "reservedFor", guests, occasion,
                 special_request AS "specialRequest", newsletter, status, created_at AS "createdAt"`;

const findActive = async (code) => {
    const { rows } = await pool.query("SELECT * FROM reservations WHERE code = $1 AND status <> 'Cancelled'", [String(code || '').toUpperCase()]);
    return rows[0] || null;
};

const occasion = (value) => (OCCASIONS.includes(value) ? value : '');

router.post('/check', (req, res) => {
    const { date, time, guests } = req.body || {};
    const error = validateSlot(date, time, guests);
    if (error) return res.status(400).json({ message: error });
    res.json({ ok: true });
});

router.post('/', handle(async (req, res) => {
    const body = req.body || {};
    const errors = {};
    const slotError = validateSlot(body.date, body.time, body.guests);
    if (!text(body.firstName)) errors.firstName = 'Enter your first name';
    checkLength(errors, 'firstName', body.firstName, 50);
    checkLength(errors, 'lastName', body.lastName, 50);
    checkPhone(errors, body.phoneCode, body.phone);
    checkEmail(errors, body.email);
    checkLength(errors, 'specialRequest', body.specialRequest, 1000);
    if (slotError || hasErrors(errors)) return sendErrors(res, errors, slotError || '');

    const values = {
        customer_name: fullName(body.firstName, body.lastName),
        phone: joinPhone(body.phoneCode, body.phone),
        email: text(body.email),
        reserved_for: `${body.date}T${body.time}`,
        guests: Number(body.guests),
        occasion: occasion(body.occasion),
        special_request: text(body.specialRequest),
        newsletter: Boolean(body.newsletter),
    };

    const existing = body.modify ? await findActive(body.modify) : null;
    let saved;
    if (existing) {
        const { rows } = await pool.query(
            `UPDATE reservations SET customer_name = $1, phone = $2, email = $3, reserved_for = $4, guests = $5,
                    occasion = $6, special_request = $7, newsletter = $8
             WHERE id = $9 RETURNING *`,
            [values.customer_name, values.phone, values.email, values.reserved_for, values.guests,
             values.occasion, values.special_request, values.newsletter, existing.id],
        );
        saved = rows[0];
    } else {
        const { rows } = await pool.query(
            `INSERT INTO reservations (code, customer_name, phone, email, reserved_for, guests, occasion, special_request, newsletter, status, user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Confirmed', $10) RETURNING *`,
            [newCode(), values.customer_name, values.phone, values.email, values.reserved_for, values.guests,
             values.occasion, values.special_request, values.newsletter, req.user ? req.user.id : null],
        );
        saved = rows[0];
    }
    if (req.user) await rememberContact(pool, req.user, values.phone, null);

    const mail = reservationConfirmed(saved, `${clientUrl()}/reservation/${saved.code}`, Boolean(existing));
    await sendMail(saved.email, mail.subject, mail.html);

    res.status(existing ? 200 : 201).json({ code: saved.code });
}));

router.get('/:code', handle(async (req, res) => {
    const { rows } = await pool.query(`SELECT ${columns} FROM reservations WHERE code = $1`, [String(req.params.code).toUpperCase()]);
    if (rows.length === 0) return res.status(404).json({ message: 'Reservation not found' });
    res.json(rows[0]);
}));

router.patch('/:code/notes', handle(async (req, res) => {
    const reservation = await findActive(req.params.code);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    const body = req.body || {};
    const errors = {};
    checkLength(errors, 'specialRequest', body.specialRequest, 1000);
    if (hasErrors(errors)) return sendErrors(res, errors);
    await pool.query('UPDATE reservations SET occasion = $1, special_request = $2 WHERE id = $3',
        [occasion(body.occasion), text(body.specialRequest), reservation.id]);
    res.status(204).end();
}));

router.post('/:code/cancel', handle(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM reservations WHERE code = $1', [String(req.params.code).toUpperCase()]);
    const reservation = rows[0];
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (reservation.status !== 'Cancelled') {
        await pool.query("UPDATE reservations SET status = 'Cancelled' WHERE id = $1", [reservation.id]);
        const mail = reservationCancelled(reservation, `${clientUrl()}/reservation`);
        await sendMail(reservation.email, mail.subject, mail.html);
    }
    res.json({ code: reservation.code, status: 'Cancelled' });
}));

export default router;
