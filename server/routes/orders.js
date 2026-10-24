import { Router } from 'express';
import { pool, transaction } from '../db.js';
import { handle } from '../handle.js';
import { MAX_QUANTITY, METHODS, PAYMENTS, laterSlots, tax, round } from '../rules.js';
import { text, checkEmail, checkPhone, checkLength, fullName, joinPhone, hasErrors, sendErrors } from '../validation.js';
import { newCode } from '../services/tokens.js';
import { rememberContact } from '../services/customers.js';
import { sendMail } from '../services/mail.js';
import { orderPlaced } from '../services/templates.js';

const router = Router();
const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

async function readCart(cart) {
    const wanted = {};
    for (const [id, quantity] of Object.entries(cart && typeof cart === 'object' ? cart : {})) {
        const dishId = Number(id);
        const count = Number(quantity);
        if (Number.isInteger(dishId) && Number.isInteger(count) && count > 0 && count <= MAX_QUANTITY) wanted[dishId] = count;
    }
    const ids = Object.keys(wanted).map(Number);
    if (ids.length === 0) return [];
    const { rows } = await pool.query('SELECT id, name, price, image_url FROM dishes WHERE id = ANY($1::int[])', [ids]);
    return rows.map((dish) => ({ dish, quantity: wanted[dish.id] }));
}

async function findVoucher(code) {
    const value = text(code).toUpperCase();
    if (!value) return null;
    const { rows } = await pool.query('SELECT code, amount FROM vouchers WHERE code = $1 AND is_active', [value]);
    return rows[0] || null;
}

router.post('/', handle(async (req, res) => {
    const body = req.body || {};
    const errors = {};
    const lines = await readCart(body.cart);

    if (!text(body.firstName)) errors.firstName = 'Enter your first name';
    checkLength(errors, 'firstName', body.firstName, 50);
    checkLength(errors, 'lastName', body.lastName, 50);
    checkPhone(errors, body.phoneCode, body.phone);
    checkEmail(errors, body.email);
    checkLength(errors, 'note', body.note, 1000);
    if (!body.acceptTerms) errors.acceptTerms = 'Please accept the Terms of use & Privacy Policy';
    if (!METHODS.includes(body.method)) errors.method = 'Choose an order method';
    if (!PAYMENTS.includes(body.payment)) errors.payment = 'Choose a payment method';
    if (body.method === 'Delivery' && !text(body.address)) errors.address = 'Choose your shipping address';
    checkLength(errors, 'address', body.address, 300);

    let scheduled = null;
    if (body.orderTime === 'later') {
        if (!laterSlots().includes(body.laterAt)) errors.laterAt = 'Choose a time for your order';
        else scheduled = body.laterAt;
    }

    if (lines.length === 0) return sendErrors(res, errors, 'Your order list is empty. Add some dishes first.');
    if (hasErrors(errors)) return sendErrors(res, errors);

    const voucher = await findVoucher(body.voucherCode);
    const subtotal = round(lines.reduce((sum, l) => sum + l.dish.price * l.quantity, 0));
    const taxFee = tax(subtotal);
    const discount = Math.min(voucher ? voucher.amount : 0, round(subtotal + taxFee));
    const delivery = body.method === 'Delivery';
    const coordinate = (value) => (delivery && typeof value === 'number' && Number.isFinite(value) ? value : null);

    const order = {
        code: newCode(),
        customer_name: fullName(body.firstName, body.lastName),
        phone: joinPhone(body.phoneCode, body.phone),
        email: text(body.email),
        method: body.method,
        payment: body.payment,
        address: delivery ? text(body.address) : '',
        latitude: coordinate(body.latitude),
        longitude: coordinate(body.longitude),
        scheduled_for: scheduled,
        note: text(body.note),
        subtotal,
        tax: taxFee,
        discount,
        voucher_code: voucher ? voucher.code : '',
        total: round(subtotal + taxFee - discount),
        status: body.payment === 'Cash' ? 'New' : 'Awaiting payment',
        user_id: req.user ? req.user.id : null,
    };

    await transaction(async (db) => {
        const saved = await db.query(
            `INSERT INTO orders (code, customer_name, phone, email, method, payment, address, latitude, longitude,
                                 scheduled_for, note, subtotal, tax, discount, voucher_code, total, status, user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
             RETURNING id`,
            [order.code, order.customer_name, order.phone, order.email, order.method, order.payment, order.address,
             order.latitude, order.longitude, order.scheduled_for, order.note, order.subtotal, order.tax,
             order.discount, order.voucher_code, order.total, order.status, order.user_id],
        );
        for (const line of lines) {
            await db.query('INSERT INTO order_items (order_id, dish_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
                [saved.rows[0].id, line.dish.id, line.quantity, line.dish.price]);
        }
        if (req.user) await rememberContact(db, req.user, order.phone, order.address, order.latitude, order.longitude);
    });

    const items = lines.map((l) => ({ name: l.dish.name, quantity: l.quantity, unit_price: l.dish.price }));
    const mail = orderPlaced(order, items, `${clientUrl()}/order/${order.code}`);
    await sendMail(order.email, mail.subject, mail.html);

    res.status(201).json({ code: order.code });
}));

router.get('/:code', handle(async (req, res) => {
    const { rows } = await pool.query(
        `SELECT code, customer_name AS "customerName", phone, email, method, payment, address, scheduled_for AS "scheduledFor",
                note, subtotal, tax, discount, voucher_code AS "voucherCode", total, status, created_at AS "createdAt", id
         FROM orders WHERE code = $1`,
        [String(req.params.code).toUpperCase()],
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    const order = rows[0];
    const items = await pool.query(
        `SELECT d.name, d.image_url AS "imageUrl", i.quantity, i.unit_price AS "unitPrice"
         FROM order_items i JOIN dishes d ON d.id = i.dish_id WHERE i.order_id = $1 ORDER BY i.id`,
        [order.id],
    );
    delete order.id;
    res.json({ ...order, items: items.rows });
}));

export default router;
