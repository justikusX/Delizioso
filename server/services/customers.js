import { pool } from '../db.js';

export async function claimGuestRecords(user) {
    if (!user.email_confirmed) return;
    await pool.query('UPDATE orders SET user_id = $1 WHERE user_id IS NULL AND LOWER(email) = $2', [user.id, user.email]);
    await pool.query('UPDATE reservations SET user_id = $1 WHERE user_id IS NULL AND LOWER(email) = $2', [user.id, user.email]);
}

export async function rememberContact(db, user, phone, address, latitude, longitude) {
    if (user.phone === '') await db.query('UPDATE users SET phone = $1 WHERE id = $2', [phone, user.id]);
    const text = (address || '').trim();
    if (!text) return;
    await db.query(
        `INSERT INTO addresses (user_id, text, latitude, longitude, last_used_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id, text)
         DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, last_used_at = NOW()`,
        [user.id, text, latitude ?? null, longitude ?? null],
    );
}
