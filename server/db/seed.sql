INSERT INTO categories (id, name, sort_order) VALUES
    (1, 'Dinner', 1),
    (2, 'Lunch', 2),
    (3, 'Dessert', 3),
    (4, 'Drink', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO dishes (id, name, description, price, rating, image_url, is_popular, dish_group, category_id) VALUES
    (1, 'Spaghetti', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas consequat mi eget auctor aliquam, diam.', 12.05, 4, '/img/dish-spaghetti.png', TRUE, 'Pasta', 1),
    (2, 'Gnocchi', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas consequat mi eget auctor aliquam, diam.', 12.05, 4, '/img/dish-gnocchi.png', TRUE, 'Pasta', 2),
    (3, 'Rovioli', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas consequat mi eget auctor aliquam, diam.', 12.05, 4, '/img/dish-ravioli.png', TRUE, 'Pasta', 1),
    (4, 'Penne Alla Vodak', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas consequat mi eget auctor aliquam, diam.', 12.05, 4, '/img/dish-penne.png', TRUE, 'Pasta', 2),
    (5, 'Risoto', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas consequat mi eget auctor aliquam, diam.', 12.05, 4, '/img/dish-risotto.png', TRUE, 'Mains', 1),
    (6, 'Splitza Signature', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas consequat mi eget auctor aliquam, diam.', 12.05, 4, '/img/dish-pizza.png', TRUE, 'Pizza', 2),
    (7, 'Penne al Pesto', 'Penne with basil pesto, roasted cherry tomatoes and shaved parmesan.', 11.50, 5, '/img/dish-penne-pesto.webp', FALSE, 'Pasta', 2),
    (8, 'Lasagna Bolognese', 'Layers of fresh pasta, slow-cooked beef ragù, béchamel and mozzarella.', 14.90, 5, '/img/dish-lasagna.webp', FALSE, 'Pasta', 1),
    (9, 'Pizza Margherita', 'Neapolitan dough, San Marzano tomatoes, fior di latte and fresh basil.', 10.90, 5, '/img/dish-margherita.webp', FALSE, 'Pizza', 2),
    (10, 'Mushroom Risotto', 'Creamy arborio rice with roasted mushrooms, parsley and parmesan.', 13.40, 4, '/img/dish-mushroom-risotto.webp', FALSE, 'Mains', 1),
    (11, 'Grilled Salmon', 'Salmon fillet with grilled asparagus, baby potatoes and lemon.', 18.50, 5, '/img/dish-salmon.webp', FALSE, 'Mains', 1),
    (12, 'Tagliata di Manzo', 'Sliced grilled beef steak with roasted potatoes, cherry tomatoes and rosemary.', 21.00, 5, '/img/dish-steak.webp', FALSE, 'Mains', 1),
    (13, 'Caesar Salad', 'Romaine, grilled chicken, garlic croutons, parmesan and Caesar dressing.', 9.80, 4, '/img/dish-caesar.webp', FALSE, 'Salads', 2),
    (14, 'Fettuccine Alfredo', 'Fettuccine in a rich parmesan cream sauce with grilled chicken breast.', 13.90, 4, '/img/dish-alfredo.webp', FALSE, 'Pasta', 1),
    (15, 'Spaghetti Carbonara', 'Spaghetti with crispy guanciale, egg yolk, pecorino and black pepper.', 12.90, 5, '/img/dish-carbonara.webp', FALSE, 'Pasta', 1),
    (16, 'Spaghetti Pomodoro', 'Spaghetti in a light tomato sauce with feta cubes and fresh basil.', 10.50, 4, '/img/dish-spaghetti-pomodoro.webp', FALSE, 'Pasta', 2),
    (17, 'Pelmeni', 'Hand-made meat dumplings with melted butter, dill and sour cream.', 9.50, 4, '/img/dish-pelmeni.webp', FALSE, 'Pasta', 2),
    (18, 'Syrniki', 'Golden cottage cheese pancakes with fresh berries, mint and sour cream.', 7.90, 5, '/img/dish-syrniki.webp', FALSE, 'Desserts', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO chefs (id, name, position, photo_url, card_color, sort_order) VALUES
    (1, 'Betran Komar', 'Head chef', '/img/chef-1.png', 'rgba(27,22,29,.2)', 1),
    (2, 'Ferry Sauwi', 'Chef', '/img/chef-2.png', 'rgba(255,138,0,.2)', 2),
    (3, 'Iswan Dracho', 'Chef', '/img/chef-3.png', 'rgba(157,101,66,.2)', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO testimonials (id, author_name, author_position, text, photo_url, sort_order) VALUES
    (1, 'Starla Virgoun', 'Financial advisor', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam', '/img/customer-main.png', 4),
    (2, 'Amira Hassan', 'Designer', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam', '/img/customer-5.png', 1),
    (3, 'Naomi Brooks', 'Photographer', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam', '/img/customer-2.png', 2),
    (4, 'Lena Morales', 'Teacher', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam', '/img/customer-1.png', 3),
    (5, 'Jake Turner', 'Developer', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam', '/img/customer-6.png', 5),
    (6, 'Zoe Adebayo', 'Musician', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam', '/img/customer-3.png', 6),
    (7, 'Maya Collins', 'Marketing manager', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Facilisis ultricies at eleifend proin. Congue nibh nulla malesuada ultricies nec quam', '/img/customer-4.png', 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vouchers (id, code, amount, is_active) VALUES
    (1, 'FREETOEAT', 5.00, TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT MAX(id) FROM categories));
SELECT setval(pg_get_serial_sequence('dishes', 'id'), (SELECT MAX(id) FROM dishes));
SELECT setval(pg_get_serial_sequence('chefs', 'id'), (SELECT MAX(id) FROM chefs));
SELECT setval(pg_get_serial_sequence('testimonials', 'id'), (SELECT MAX(id) FROM testimonials));
SELECT setval(pg_get_serial_sequence('vouchers', 'id'), (SELECT MAX(id) FROM vouchers));
