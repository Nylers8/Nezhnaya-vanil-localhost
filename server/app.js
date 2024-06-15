const mysql = require('mysql');

// Создание соединения с базой данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Твой MySQL пользователь
    password: '',  // Пароль пользователя, если есть
    database: 'NezhnayaVanill'  // Имя твоей базы данных
});

// Подключение к базе данных
db.connect((err) => {
    if (err) {
        return console.error('Ошибка подключения: ' + err.message);
    }
    console.log('Подключено к базе данных MySQL');

    // Здесь можно выполнить запросы к базе данных...

    // Закрыть соединение
    db.end((err) => {
        if (err) {
            return console.log('Ошибка: ' + err.message);
        }
        console.log('Соединение закрыто');
    });
});
