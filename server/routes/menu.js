import { Router } from 'express';
import { pool } from '../db.js';
import { handle } from '../handle.js';

const router = Router();

const dishColumns = `id, name, description, price, rating, image_url AS "imageUrl", is_popular AS "isPopular",
                     dish_group AS "group", category_id AS "categoryId"`;

router.get('/home', handle(async (req, res) => {
    const [categories, popular, chefs, testimonials] = await Promise.all([
        pool.query('SELECT id, name FROM categories ORDER BY sort_order'),
        pool.query(`SELECT ${dishColumns} FROM dishes WHERE is_popular ORDER BY id`),
        pool.query('SELECT id, name, position, photo_url AS "photoUrl", card_color AS "cardColor" FROM chefs ORDER BY sort_order'),
        pool.query(`SELECT id, author_name AS "authorName", author_position AS "authorPosition", text, photo_url AS "photoUrl"
                    FROM testimonials ORDER BY sort_order`),
    ]);
    res.json({
        categories: categories.rows,
        dishes: popular.rows,
        chefs: chefs.rows,
        testimonials: testimonials.rows,
    });
}));

router.get('/menu', handle(async (req, res) => {
    const [categories, dishes] = await Promise.all([
        pool.query('SELECT id, name FROM categories ORDER BY sort_order'),
        pool.query(`SELECT ${dishColumns} FROM dishes ORDER BY id`),
    ]);
    res.json({ categories: categories.rows, dishes: dishes.rows });
}));

router.get('/vouchers/:code', handle(async (req, res) => {
    const code = String(req.params.code).trim().toUpperCase();
    const { rows } = await pool.query('SELECT code, amount FROM vouchers WHERE code = $1 AND is_active', [code]);
    if (rows.length === 0) return res.status(404).json({ message: 'This voucher code is not valid' });
    res.json(rows[0]);
}));

export default router;
