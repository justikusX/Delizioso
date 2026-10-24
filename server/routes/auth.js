import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { pool } from '../db.js';
import { handle } from '../handle.js';
import { text, checkEmail, hasErrors, sendErrors, normalizeEmail } from '../validation.js';
import { authToken, linkToken, readLinkToken, newStamp } from '../services/tokens.js';
import { claimGuestRecords } from '../services/customers.js';
import { sendMail, devLink } from '../services/mail.js';
import { confirmEmail, resetPassword } from '../services/templates.js';
import { publicUser, requireUser } from '../middleware/auth.js';

const router = Router();
const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';
const googleId = () => process.env.GOOGLE_CLIENT_ID || '';
const googleSecret = () => process.env.GOOGLE_CLIENT_SECRET || '';

const findByEmail = async (email) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [normalizeEmail(email)]);
    return rows[0] || null;
};

async function signIn(res, user, remember) {
    const { rows } = await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1 RETURNING *', [user.id]);
    res.json({ token: authToken(rows[0], remember), user: publicUser(rows[0]), remember: Boolean(remember) });
}

async function sendConfirmation(user, returnUrl) {
    const token = linkToken(user, 'confirm-email', '3d');
    const url = `${clientUrl()}/account/confirm-email?token=${encodeURIComponent(token)}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
    const mail = confirmEmail(user.full_name, url);
    const sent = await sendMail(user.email, mail.subject, mail.html);
    return { devLink: devLink(url), mailFailed: !sent };
}

function checkPassword(errors, password, field = 'password') {
    if (!password) errors[field] = 'Enter a password';
    else if (String(password).length < 6) errors[field] = 'Password must be at least 6 characters';
}

router.get('/config', (req, res) => {
    res.json({ googleClientId: googleId() && googleSecret() ? googleId() : null });
});

router.get('/me', requireUser, (req, res) => {
    res.json({ user: publicUser(req.user) });
});

router.post('/register', handle(async (req, res) => {
    const body = req.body || {};
    const errors = {};
    if (!text(body.fullName)) errors.fullName = 'Enter your full name';
    else if (text(body.fullName).length > 100) errors.fullName = 'Use at most 100 characters';
    checkEmail(errors, body.email);
    checkPassword(errors, body.password);
    const existing = errors.email ? null : await findByEmail(body.email);
    if (existing && existing.email_confirmed) errors.email = 'An account with this email already exists. Log in or reset your password.';
    if (hasErrors(errors)) return sendErrors(res, errors);

    const hash = await bcrypt.hash(body.password, 10);
    const { rows } = existing
        ? await pool.query('UPDATE users SET full_name = $1, password_hash = $2, security_stamp = $3 WHERE id = $4 RETURNING *',
            [text(body.fullName), hash, newStamp(), existing.id])
        : await pool.query('INSERT INTO users (full_name, email, password_hash, security_stamp) VALUES ($1, $2, $3, $4) RETURNING *',
            [text(body.fullName), normalizeEmail(body.email), hash, newStamp()]);
    const result = await sendConfirmation(rows[0], body.returnUrl);
    res.status(201).json({ email: rows[0].email, ...result });
}));

router.post('/resend', handle(async (req, res) => {
    const user = await findByEmail(req.body?.email);
    let result = {};
    if (user && !user.email_confirmed) result = await sendConfirmation(user);
    res.json({ email: normalizeEmail(req.body?.email), ...result });
}));

router.post('/confirm', handle(async (req, res) => {
    const data = readLinkToken(req.body?.token, 'confirm-email');
    const { rows } = data ? await pool.query('SELECT * FROM users WHERE id = $1', [data.id]) : { rows: [] };
    const user = rows[0];
    if (!user || user.security_stamp !== data.stamp) {
        return res.status(400).json({ message: 'This confirmation link is invalid or has expired. Log in to get a new one.' });
    }
    if (!user.email_confirmed) {
        await pool.query('UPDATE users SET email_confirmed = TRUE WHERE id = $1', [user.id]);
        user.email_confirmed = true;
        await claimGuestRecords(user);
    }
    await signIn(res, user, true);
}));

router.post('/login', handle(async (req, res) => {
    const body = req.body || {};
    const errors = {};
    checkEmail(errors, body.email);
    if (!body.password) errors.password = 'Enter your password';
    if (hasErrors(errors)) return sendErrors(res, errors);

    const user = await findByEmail(body.email);
    if (user && user.password_hash === '' && user.google_id) {
        return sendErrors(res, {}, 'This account uses Google sign-in. Use “Log in with google” or reset the password to add one.');
    }
    if (!user || !(await bcrypt.compare(String(body.password), user.password_hash))) {
        return sendErrors(res, {}, 'Wrong email or password');
    }
    if (!user.email_confirmed) {
        return res.status(400).json({ errors: {}, message: 'Please confirm your email first. We sent you a link when you signed up.', unconfirmed: user.email });
    }
    await signIn(res, user, body.remember);
}));

router.post('/forgot', handle(async (req, res) => {
    const errors = {};
    checkEmail(errors, req.body?.email);
    if (hasErrors(errors)) return sendErrors(res, errors);
    const user = await findByEmail(req.body.email);
    let result = {};
    if (user) {
        const url = `${clientUrl()}/account/reset-password?token=${encodeURIComponent(linkToken(user, 'reset-password', '2h'))}`;
        const mail = resetPassword(user.full_name, url);
        const sent = await sendMail(user.email, mail.subject, mail.html);
        result = { devLink: devLink(url), mailFailed: !sent };
    }
    res.json({ email: normalizeEmail(req.body.email), ...result });
}));

router.get('/reset/:token', handle(async (req, res) => {
    const data = readLinkToken(req.params.token, 'reset-password');
    const { rows } = data ? await pool.query('SELECT id FROM users WHERE id = $1 AND security_stamp = $2', [data.id, data.stamp]) : { rows: [] };
    res.json({ valid: rows.length > 0 });
}));

router.post('/reset', handle(async (req, res) => {
    const body = req.body || {};
    const data = readLinkToken(body.token, 'reset-password');
    const { rows } = data ? await pool.query('SELECT * FROM users WHERE id = $1', [data.id]) : { rows: [] };
    if (!rows[0] || rows[0].security_stamp !== data.stamp) {
        return res.status(400).json({ errors: {}, message: 'This reset link is invalid or has expired. Please request a new one.', expired: true });
    }
    const errors = {};
    if (!body.password) errors.password = 'Enter a new password';
    else if (String(body.password).length < 6) errors.password = 'Password must be at least 6 characters';
    if (body.password !== body.confirmPassword) errors.confirmPassword = "Passwords don't match";
    if (hasErrors(errors)) return sendErrors(res, errors);

    const hash = await bcrypt.hash(body.password, 10);
    const updated = await pool.query(
        'UPDATE users SET password_hash = $1, security_stamp = $2, email_confirmed = TRUE WHERE id = $3 RETURNING *',
        [hash, newStamp(), rows[0].id],
    );
    await claimGuestRecords(updated.rows[0]);
    await signIn(res, updated.rows[0], false);
}));

router.post('/google', handle(async (req, res) => {
    if (!googleId() || !googleSecret()) {
        return res.status(400).json({ message: "Sign in with Google isn't set up yet. Please use your email and password." });
    }
    let payload;
    try {
        const client = new OAuth2Client(googleId(), googleSecret(), 'postmessage');
        const { tokens } = await client.getToken(String(req.body?.code || ''));
        const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: googleId() });
        payload = ticket.getPayload();
    } catch {
        return res.status(400).json({ message: 'Google sign-in was cancelled or failed. Please try again.' });
    }
    if (!payload?.sub || !payload.email) {
        return res.status(400).json({ message: 'Google sign-in was cancelled or failed. Please try again.' });
    }

    const byGoogle = await pool.query('SELECT * FROM users WHERE google_id = $1', [payload.sub]);
    let user = byGoogle.rows[0] || (await findByEmail(payload.email));
    if (user) {
        const { rows } = await pool.query('UPDATE users SET google_id = $1, email_confirmed = TRUE WHERE id = $2 RETURNING *', [payload.sub, user.id]);
        user = rows[0];
    } else {
        const { rows } = await pool.query(
            'INSERT INTO users (full_name, email, google_id, email_confirmed, security_stamp) VALUES ($1, $2, $3, TRUE, $4) RETURNING *',
            [payload.name || payload.email, normalizeEmail(payload.email), payload.sub, newStamp()],
        );
        user = rows[0];
    }
    await claimGuestRecords(user);
    await signIn(res, user, true);
}));

export default router;
