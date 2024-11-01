const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const multer = require('multer');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const User = require('./models/User'); // Модель пользователя

// Инициализация приложения
const app = express();

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/Shop')
    .then(() => console.log('Подключение к MongoDB установлено'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public')); // Для сервинга статических файлов
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Secure: false для разработки (не HTTPS)
}));
app.use(flash()); // Для отображения сообщений об ошибках
app.use(passport.initialize());
app.use(passport.session());

// Настройка хранилища для загрузки аватарок
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/avatars'); // Папка для аватарок
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Настройка Passport.js для аутентификации
passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    try {
        const query = username.includes('@') ? { email: username } : { username: username };
        const user = await User.findOne(query);
        if (!user) {
            return done(null, false, { message: 'Неверный логин или пароль' });
        }
        user.authenticate(password, (err, user, passwordError) => {
            if (err) return done(err);
            if (passwordError) return done(null, false, { message: 'Неверный пароль' });
            return done(null, user);
        });
    } catch (err) {
        return done(err);
    }
}));

// Сериализация пользователя в сессию
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Десериализация пользователя из сессии (исправлено)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Используем async/await
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Маршрут: Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут: Страница входа
app.get('/login', (req, res) => {
    const message = req.flash('error'); // Получаем flash-сообщение, если есть ошибка
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Используем sendFile вместо render
});

// Маршрут: Вход пользователя
app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',  // Перенаправляем на страницу профиля после успешного входа
    failureRedirect: '/login',    // Если ошибка, возвращаемся на страницу входа
    failureFlash: true // Добавляем возможность вывода сообщений об ошибках
}));

// Маршрут: Регистрация пользователя
app.post('/register', async (req, res) => {
    const { username, password, email, phone } = req.body;
    const newUser = new User({ username, email, phone });

    try {
        await User.register(newUser, password);
        req.login(newUser, (err) => {  // Логиним сразу после регистрации
            if (err) return next(err);
            return res.redirect('/profile');  // Перенаправляем на страницу профиля после успешной регистрации
        });
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        req.flash('error', 'Ошибка регистрации. Возможно, пользователь уже существует.');
        res.redirect('/register');
    }
});

// Маршрут для проверки аутентификации
app.get('/is-authenticated', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});


// Маршрут: Страница профиля
app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Вам необходимо войти в систему.');
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

// Маршрут: Получение данных профиля
app.get('/profile-data', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(403).json({ message: 'Необходима авторизация' });
    }

    res.json({
        username: req.user.username,
        email: req.user.email,
        phone: req.user.phone,
        avatar: req.user.avatar || '/default-avatar.jpg', // Стандартная аватарка, если нет своей
        purchases: [
            { product: 'Цемент М400', quantity: 2, price: 1000 },
            { product: 'Молоток', quantity: 1, price: 150 }
        ]
    });
});

// Маршрут: Обновление профиля
app.post('/profile', upload.single('avatar'), (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(403).json({ message: 'Необходима авторизация' });
    }

    const updateData = { email: req.body.email, phone: req.body.phone };

    if (req.file) {
        updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    User.findByIdAndUpdate(req.user._id, updateData, { new: true }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при обновлении профиля' });
        }
        res.json({ message: 'Профиль обновлен успешно', user });
    });
});

// Маршрут: Выход пользователя
app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
