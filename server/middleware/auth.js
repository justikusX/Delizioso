import { pool } from '../db.js';
import { readAuthToken } from '../services/tokens.js';

export async function loadUser(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const data = header.startsWith('Bearer ') ? readAuthToken(header.slice(7)) : null;
        req.user = null;
        if (data) {
            const { rows } = await pool.query('SELECT * FROM users WHERE id = $1 AND security_stamp = $2', [data.id, data.stamp]);
            req.user = rows[0] || null;
        }
        next();
    } catch (error) {
        next(error);
    }
}

export function requireUser(req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Please log in' });
    next();
}

export function publicUser(user) {
    return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        google: Boolean(user.google_id),
        hasPassword: user.password_hash !== '',
        createdAt: user.created_at,
    };
}
