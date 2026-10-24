CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    rating INT NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
    image_url VARCHAR(200) NOT NULL DEFAULT '',
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    dish_group VARCHAR(30) NOT NULL DEFAULT '',
    category_id INT NOT NULL REFERENCES categories (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chefs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL DEFAULT '',
    photo_url VARCHAR(200) NOT NULL DEFAULT '',
    card_color VARCHAR(50) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    author_position VARCHAR(100) NOT NULL DEFAULT '',
    text VARCHAR(1000) NOT NULL DEFAULT '',
    photo_url VARCHAR(200) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL DEFAULT '',
    phone VARCHAR(30) NOT NULL DEFAULT '',
    email_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    google_id VARCHAR(100) UNIQUE,
    security_stamp VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    text VARCHAR(300) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    last_used_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, text)
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(12) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    reserved_for TIMESTAMP NOT NULL,
    guests INT NOT NULL CHECK (guests BETWEEN 1 AND 10),
    occasion VARCHAR(50) NOT NULL DEFAULT '',
    special_request VARCHAR(1000) NOT NULL DEFAULT '',
    newsletter BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'Confirmed',
    user_id INT REFERENCES users (id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    code VARCHAR(12) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    method VARCHAR(20) NOT NULL DEFAULT 'Delivery',
    payment VARCHAR(30) NOT NULL DEFAULT 'Cash',
    address VARCHAR(300) NOT NULL DEFAULT '',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    scheduled_for TIMESTAMP,
    note VARCHAR(1000) NOT NULL DEFAULT '',
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    voucher_code VARCHAR(30) NOT NULL DEFAULT '',
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'New',
    user_id INT REFERENCES users (id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    dish_id INT NOT NULL REFERENCES dishes (id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity BETWEEN 1 AND 20),
    unit_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL DEFAULT '',
    message VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_dishes_category ON dishes (category_id);
CREATE INDEX IF NOT EXISTS ix_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS ix_orders_email ON orders (LOWER(email));
CREATE INDEX IF NOT EXISTS ix_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS ix_reservations_user ON reservations (user_id);
CREATE INDEX IF NOT EXISTS ix_reservations_email ON reservations (LOWER(email));

CREATE OR REPLACE VIEW vw_order_details AS
SELECT
    o.code AS order_code, o.created_at, o.status,
    o.customer_name, o.email, o.phone,
    CASE WHEN o.user_id IS NULL THEN 'Guest' ELSE 'Account' END AS customer,
    o.method, o.address, o.latitude, o.longitude, o.scheduled_for, o.note,
    d.name AS dish, i.quantity, i.unit_price, i.quantity * i.unit_price AS line_total,
    o.subtotal, o.tax, o.discount, o.voucher_code, o.total AS order_total, o.payment
FROM orders o
JOIN order_items i ON i.order_id = o.id
JOIN dishes d ON d.id = i.dish_id;

CREATE OR REPLACE VIEW vw_reservation_details AS
SELECT
    r.code AS booking_code, r.reserved_for, r.guests, r.status,
    r.customer_name, r.email, r.phone,
    CASE WHEN r.user_id IS NULL THEN 'Guest' ELSE 'Account' END AS customer,
    r.occasion, r.special_request, r.newsletter, r.created_at
FROM reservations r;

CREATE OR REPLACE VIEW vw_customers AS
WITH people AS (
    SELECT LOWER(email) AS email, full_name AS name, phone, created_at FROM users
    UNION ALL SELECT LOWER(email), customer_name, phone, created_at FROM orders
    UNION ALL SELECT LOWER(email), customer_name, phone, created_at FROM reservations
)
SELECT
    p.email,
    COALESCE(u.full_name, MAX(p.name)) AS name,
    COALESCE(NULLIF(u.phone, ''), MAX(NULLIF(p.phone, ''))) AS phone,
    CASE WHEN u.id IS NULL THEN 'Guest' WHEN u.google_id IS NOT NULL THEN 'Google' ELSE 'Email' END AS account_type,
    u.email_confirmed,
    (SELECT COUNT(*) FROM orders o WHERE LOWER(o.email) = p.email) AS orders,
    (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE LOWER(o.email) = p.email) AS total_spent,
    (SELECT o.address FROM orders o WHERE LOWER(o.email) = p.email AND o.address <> '' ORDER BY o.created_at DESC LIMIT 1) AS last_address,
    (SELECT COUNT(*) FROM reservations r WHERE LOWER(r.email) = p.email) AS reservations,
    MIN(p.created_at) AS first_seen,
    MAX(p.created_at) AS last_seen
FROM people p
LEFT JOIN users u ON LOWER(u.email) = p.email
WHERE p.email <> ''
GROUP BY p.email, u.id, u.full_name, u.phone, u.google_id, u.email_confirmed;
