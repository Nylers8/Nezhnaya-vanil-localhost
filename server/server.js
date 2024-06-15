const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'NezhnayaVanill'
});

db.connect((err) => {
    if (err) {
        return console.error('Ошибка подключения: ' + err.message);
    }
    console.log('Подключено к базе данных MySQL');
});



// Маршрут для входа в систему
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email и пароль обязательны!' });
    }

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при проверке учетных данных', error: err });
        }

        if (results.length > 0) {
            const user = results[0];
            req.session.user = user;
            if (user.is_admin) {
                res.json({ redirectUrl: 'admin.html' });
            } else {
                res.json({ message: 'Вход успешен', user });
            }
        } else {
            res.status(401).json({ message: 'Неверный email или пароль' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Ошибка при выходе из системы');
        }
        res.redirect('/');
    });
});

// Маршрут для добавления продукта
app.post('/add-product', upload.single('photo'), (req, res) => {
    console.log('Данные формы:', req.body);
    console.log('Файл:', req.file);

    const { name, price, description, quantity, categories } = req.body;
    let photo = req.file ? `server/uploads/${req.file.filename}` : null;

    if (!name) {
        console.error('Имя продукта не может быть пустым');
        return res.status(400).send({ message: "Имя продукта не может быть пустым" });
    }

    const query = `INSERT INTO products (name, price, description, quantity, categories, photo_url) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [name, price, description, quantity, JSON.stringify(categories), photo], (err, result) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).send({ message: 'Ошибка при добавлении продукта', error: err.toString() });
        }
        console.log('Результат добавления продукта:', result);
        res.send({ message: 'Продукт успешно добавлен', productId: result.insertId });
    });
});

app.get('/api/products', (req, res) => {
    const category = req.query.category;
    let sqlQuery = 'SELECT * FROM products';
    let params = [];

    if (category) {
        sqlQuery += ' WHERE categories LIKE ?';
        params.push(`%${category}%`);
    }

    console.log('SQL Query:', sqlQuery);
    console.log('Params:', params);

    db.query(sqlQuery, params, (err, results) => {
        if (err) {
            console.log('Ошибка при запросе к БД:', err);
            return res.status(500).send({ message: 'Ошибка при получении продуктов', error: err });
        }
        console.log('Продукты отправлены:', results);
        res.json(results);
    });
});

// Маршрут для регистрации пользователя
app.post('/register', (req, res) => {
    const { email, password, firstName, lastName, phone, city, address, postalCode } = req.body;
    if (!email || !password || !firstName || !lastName || !phone || !city || !address || !postalCode) {
        return res.status(400).send({ message: 'Все поля должны быть заполнены!' });
    }

    const query = `INSERT INTO users (email, password, first_name, last_name, phone, city, address, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [email, password, firstName, lastName, phone, city, address, postalCode], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Ошибка при регистрации пользователя', error: err });
        }
        // Перенаправление на главную страницу после успешной регистрации
        res.redirect('/index.html');
    });
});

// Добавление категории
app.post('/add-category', (req, res) => {
    const { name } = req.body;
    console.log("Полученное название категории:", name);

    if (!name) {
        return res.status(400).send({ message: 'Необходимо указать название категории!' });
    }

    const query = 'INSERT INTO catalog (name) VALUES (?)';
    db.query(query, [name], (err, result) => {
        if (err) {
            console.error('Ошибка SQL:', err.message);
            return res.status(500).send({ message: 'Ошибка при добавлении категории', error: err });
        }
        res.send({ message: 'Категория успешно добавлена', catalogId: result.insertId });
    });
});

// Получение списка категорий
app.get('/get-categories', (req, res) => {
    db.query('SELECT * FROM catalog', (err, results) => {
        if (err) {
            console.log('Ошибка при запросе к БД:', err);
            return res.status(500).send({ message: 'Ошибка при получении категорий', error: err });
        }
        console.log('Категории отправлены:', results);
        res.json({ categories: results });
    });
});


// Получение списка продуктов
app.get('/api/products', (req, res) => {
    const category = req.query.category;
    let sqlQuery = 'SELECT * FROM products';
    let params = [];

    if (category) {
        sqlQuery += ' WHERE categories LIKE ?';
        params.push(`%"${category}"%`);
    }

    db.query(sqlQuery, params, (err, results) => {
        if (err) {
            console.log('Ошибка при запросе к БД:', err);
            return res.status(500).send({ message: 'Ошибка при получении продуктов', error: err });
        }
        console.log('Продукты отправлены:', results);
        res.json(results);
    });
});

// Обновление продукта
app.put('/api/products/:id', (req, res) => {
    const { field, value } = req.body;
    const query = `UPDATE products SET ${field} = ? WHERE product_id = ?`;
    db.query(query, [value, req.params.id], (err, result) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).send({ message: 'Ошибка при обновлении продукта', error: err.toString() });
        }
        res.send({ message: 'Продукт успешно обновлен' });
    });
});

// Удаление продукта
app.delete('/api/products/:id', (req, res) => {
    const query = 'DELETE FROM products WHERE product_id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).send({ message: 'Ошибка при удалении продукта', error: err.toString() });
        }
        res.send({ message: 'Продукт успешно удален' });
    });
});

// Получение списка пользователей
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.log('Ошибка при запросе к БД:', err);
            return res.status(500).send({ message: 'Ошибка при получении пользователей', error: err });
        }
        console.log('Пользователи отправлены:', results);
        res.json(results);
    });
});

// Получение информации о товаре
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM products WHERE product_id = ?';
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Ошибка при получении продукта:', err);
            return res.status(500).json({ message: 'Ошибка при получении продукта', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Товар не найден' });
        }
        res.json(results[0]);
    });
});

// Добавление товара в корзину
app.post('/api/cart', (req, res) => {
    const { user_id, product_id, quantity } = req.body;
    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ message: 'Все поля должны быть заполнены!' });
    }

    const checkCartQuery = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';
    db.query(checkCartQuery, [user_id, product_id], (err, results) => {
        if (err) {
            console.error('Ошибка при проверке корзины:', err);
            return res.status(500).json({ message: 'Ошибка при проверке корзины', error: err });
        }

        if (results.length > 0) {
            const updateCartQuery = 'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
            db.query(updateCartQuery, [quantity, user_id, product_id], (err, result) => {
                if (err) {
                    console.error('Ошибка при обновлении количества товара в корзине:', err);
                    return res.status(500).json({ message: 'Ошибка при обновлении количества товара в корзине', error: err });
                }
                res.json({ message: 'Количество товара обновлено' });
            });
        } else {
            const insertCartQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
            db.query(insertCartQuery, [user_id, product_id, quantity], (err, result) => {
                if (err) {
                    console.error('Ошибка при добавлении товара в корзину:', err);
                    return res.status(500).json({ message: 'Ошибка при добавлении товара в корзину', error: err });
                }
                res.json({ message: 'Товар добавлен в корзину' });
            });
        }
    });
});

// Получение товаров в корзине
app.get('/api/cart', (req, res) => {
    const userId = req.query.user_id;
    const query = `
        SELECT c.cart_id, p.product_id, p.name, p.price, p.photo_url, c.quantity
        FROM cart c
        JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = ?
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Ошибка при получении товаров в корзине:', err);
            return res.status(500).json({ message: 'Ошибка при получении товаров в корзине', error: err });
        }
        res.json(results);
    });
});

// Обновление количества товара в корзине
app.put('/api/cart/:id', (req, res) => {
    const cartId = req.params.id;
    const { quantity } = req.body;
    const query = 'UPDATE cart SET quantity = ? WHERE cart_id = ?';
    db.query(query, [quantity, cartId], (err, result) => {
        if (err) {
            console.error('Ошибка при обновлении количества товара в корзине:', err);
            return res.status(500).json({ message: 'Ошибка при обновлении количества товара в корзине', error: err });
        }
        res.json({ message: 'Количество товара обновлено' });
    });
});

// Удаление товара из корзины
app.delete('/api/cart/:id', (req, res) => {
    const cartId = req.params.id;
    const query = 'DELETE FROM cart WHERE cart_id = ?';
    db.query(query, [cartId], (err, result) => {
        if (err) {
            console.error('Ошибка при удалении товара из корзины:', err);
            return res.status(500).json({ message: 'Ошибка при удалении товара из корзины', error: err });
        }
        res.json({ message: 'Товар удален из корзины' });
    });
});

// Обновление пользователя
app.put('/api/users/:id', (req, res) => {
    const { field, value } = req.body;
    const query = `UPDATE users SET ${field} = ? WHERE user_id = ?`;
    db.query(query, [value, req.params.id], (err, result) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).send({ message: 'Ошибка при обновлении пользователя', error: err.toString() });
        }
        res.send({ message: 'Пользователь успешно обновлен' });
    });
});

// Удаление пользователя
app.delete('/api/users/:id', (req, res) => {
    const query = 'DELETE FROM users WHERE user_id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).send({ message: 'Ошибка при удалении пользователя', error: err.toString() });
        }
        res.send({ message: 'Пользователь успешно удален' });
    });
});

// Получение списка категорий (для управления)
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM catalog', (err, results) => {
        if (err) {
            console.log('Ошибка при запросе к БД:', err);
            return res.status(500).send({ message: 'Ошибка при получении категорий', error: err });
        }
        console.log('Категории отправлены:', results);
        res.json(results);
    });
});

// Обновление категории
app.put('/api/categories/:id', (req, res) => {
    const { field, value } = req.body;
    const query = `UPDATE catalog SET ${field} = ? WHERE catalog_id = ?`;
    db.query(query, [value, req.params.id], (err, result) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).send({ message: 'Ошибка при обновлении категории', error: err.toString() });
        }
        res.send({ message: 'Категория успешно обновлена' });
    });
});

// Удаление категории
app.delete('/api/categories/:id', (req, res) => {
    const query = 'DELETE FROM catalog WHERE catalog_id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).send({ message: 'Ошибка при удалении категории', error: err.toString() });
        }
        res.send({ message: 'Категория успешно удалена' });
    });
});


// Поиск пользователей
app.get('/api/users/search', (req, res) => {
    const query = `SELECT * FROM users WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`;
    db.query(query, [`%${req.query.query}%`, `%${req.query.query}%`, `%${req.query.query}%`], (err, results) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).send({ message: 'Ошибка при поиске пользователей', error: err.toString() });
        }
        res.json(results);
    });
});

// Поиск категорий
app.get('/api/categories/search', (req, res) => {
    console.log("Поиск товаров");
    const query = `SELECT * FROM catalog WHERE name LIKE ?`;
    db.query(query, [`%${req.query.query}%`], (err, results) => {
        if (err) {
            console.error('Ошибка SQL:', err);
            return res.status(500).send({ message: 'Ошибка при поиске категорий', error: err.toString() });
        }
        res.json(results);
    });
});

// Явное обслуживание index.html
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
