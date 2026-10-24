import { Router } from 'express';
import { pool } from '../db.js';
import { handle } from '../handle.js';
import { text, checkEmail, checkLength, fullName, hasErrors, sendErrors } from '../validation.js';

const router = Router();

router.post('/', handle(async (req, res) => {
    const body = req.body || {};
    const errors = {};
    if (!text(body.firstName)) errors.firstName = 'Enter your first name';
    checkLength(errors, 'firstName', body.firstName, 50);
    checkLength(errors, 'lastName', body.lastName, 50);
    checkEmail(errors, body.email);
    checkLength(errors, 'subject', body.subject, 200);
    if (!text(body.message)) errors.message = 'Write your message';
    checkLength(errors, 'message', body.message, 2000);
    if (hasErrors(errors)) return sendErrors(res, errors);

    await pool.query('INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)',
        [fullName(body.firstName, body.lastName), text(body.email), text(body.subject), text(body.message)]);
    res.status(201).json({ name: text(body.firstName) });
}));

export default router;
