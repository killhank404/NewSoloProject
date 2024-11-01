// Инициализация корзины из localStorage или пустой массив
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Функция для добавления товара в корзину
const addToCart = (productId) => {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    const existingProduct = cart.find(item => item.id === productId);

    existingProduct ? existingProduct.quantity++ : cart.push({ ...product, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
};

// Обновление количества товаров в корзине
const updateCartCount = () => {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
};

// Получение списка товаров с изображениями
const getProducts = () => {
    return [
        // Товары
        { id: 1, name: 'Цемент М400', price: 500, category: 'building', image: 'images/cement.jpg' },
        { id: 2, name: 'Кирпич', price: 350, category: 'building', image: 'images/brick.jpg' },
        { id: 3, name: 'Бетон', price: 800, category: 'building', image: 'images/concrete.jpg' },
        { id: 4, name: 'Песок', price: 100, category: 'building', image: 'images/sand.jpg' },
        { id: 5, name: 'Гравий', price: 150, category: 'building', image: 'images/gravel.jpg' },
        { id: 6, name: 'Штукатурка', price: 250, category: 'building', image: 'images/plaster.jpg' },
        { id: 7, name: 'Гипсокартон', price: 400, category: 'building', image: 'images/drywall.jpg' },
        { id: 8, name: 'Изоляция', price: 700, category: 'building', image: 'images/insulation.jpg' },
        { id: 9, name: 'Клей для плитки', price: 200, category: 'building', image: 'images/tile-adhesive.jpg' },
        { id: 10, name: 'Шифер', price: 1000, category: 'building', image: 'images/slate.jpg' },

        // Инструменты
        { id: 11, name: 'Молоток', price: 150, category: 'tools', image: 'images/hammer.jpg' },
        { id: 12, name: 'Дрель', price: 2000, category: 'tools', image: 'images/drill.jpg' },
        { id: 13, name: 'Отвертка', price: 80, category: 'tools', image: 'images/screwdriver.jpg' },
        { id: 14, name: 'Шуруповерт', price: 2500, category: 'tools', image: 'images/screwdriver-electric.jpg' },
        { id: 15, name: 'Пила', price: 1200, category: 'tools', image: 'images/saw.jpg' },
        { id: 16, name: 'Уровень', price: 300, category: 'tools', image: 'images/level.jpg' },
        { id: 17, name: 'Рулетка', price: 100, category: 'tools', image: 'images/tape-measure.jpg' },
        { id: 18, name: 'Перфоратор', price: 3500, category: 'tools', image: 'images/perforator.jpg' },
        { id: 19, name: 'Шлифовальная машина', price: 1800, category: 'tools', image: 'images/grinder.jpg' },
        { id: 20, name: 'Лазерный уровень', price: 4000, category: 'tools', image: 'images/laser-level.jpg' }
    ];
};

// Функция для фильтрации товаров
const filterProducts = () => {
    const products = getProducts();
    const categoryFilter = document.getElementById('category-filter').value;
    const priceFilter = document.getElementById('price-filter').value;

    const filteredProducts = products.filter(product => {
        const inCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const inPriceRange = product.price <= priceFilter;
        return inCategory && inPriceRange;
    });

    renderCatalog(filteredProducts);
};

// Функция для отображения товаров в каталоге
const renderCatalog = (products) => {
    const catalog = document.querySelector('.product-list');
    if (catalog) {
        catalog.innerHTML = products.map(product => `
            <div class="product">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Цена: ${product.price} грн.</p>
                <button onclick="addToCart(${product.id})">Добавить в корзину</button>
            </div>
        `).join('');
    }
};

// Переключение вида каталога (сетка или список)
const switchView = (view) => {
    const productList = document.querySelector('.product-list');
    if (productList) {
        productList.classList.toggle('list-view', view === 'list');
    }
};

// Загрузка товаров в каталог
const loadCatalog = () => {
    const products = getProducts();
    renderCatalog(products);

    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const gridViewButton = document.getElementById('grid-view');
    const listViewButton = document.getElementById('list-view');

    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (priceFilter) priceFilter.addEventListener('input', filterProducts);
    if (gridViewButton) gridViewButton.addEventListener('click', () => switchView('grid'));
    if (listViewButton) listViewButton.addEventListener('click', () => switchView('list'));
};

// Обновление количества товаров в корзине при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    loadCatalog();
});

/// Логика для кнопки Вход и модального окна
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    loadCatalog();
    checkAuthentication(); // Проверка аутентификации пользователя

    const loginModal = document.getElementById('login-modal');
    const closeModal = document.getElementById('close-modal');
    const registerButton = document.getElementById('register-button');

    const loginButton = document.getElementById('auth-button');
    if (loginButton && loginModal) {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.add('show');
        });

        closeModal?.addEventListener('click', () => {
            loginModal.classList.remove('show');
        });

        registerButton?.addEventListener('click', () => {
            window.location.href = 'registration.html';
        });

        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('show');
            }
        });
    }
});

// Обработчик отправки формы логина
document.getElementById('login-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    // Отправляем POST-запрос на сервер для аутентификации
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password })
    });

    if (response.ok) {
        document.getElementById('login-modal')?.classList.remove('show');
        window.location.href = '/profile'; // Перенаправляем на страницу профиля
    } else {
        alert('Неверный логин или пароль.');
    }
});

// Проверка аутентификации пользователя
const checkAuthentication = async () => {
    try {
        const response = await fetch('/is-authenticated');
        const data = await response.json();

        const authButton = document.getElementById('auth-button');

        if (data.authenticated) {
            // Если пользователь авторизован, меняем кнопку на "Личный кабинет"
            authButton.textContent = 'Личный кабинет';
            authButton.href = '/profile';
        } else {
            // Если пользователь не авторизован, оставляем "Вход"
            authButton.textContent = 'Вход';
            authButton.href = '#';
            authButton.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('login-modal').classList.add('show');
            });
        }
    } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
    }
};

// Функция для обновления корзины и отображения товаров
const updateCart = () => {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    let total = 0;

    // Получаем корзину из localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Если корзина пустая
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Ваша корзина пуста</p>';
        cartTotal.textContent = '0 грн';
        return;
    }

    // Генерация HTML для каждого товара в корзине
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <p>${item.name} - ${item.quantity} шт. - ${item.price * item.quantity} грн.</p>
            <button onclick="removeFromCart(${item.id})">Удалить</button>
        </div>
    `).join('');

    // Подсчет общей стоимости
    total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = `${total} грн`;
};

// Функция для удаления товара из корзины
const removeFromCart = (productId) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
};

// Логика для модального окна оформления заказа
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModal = document.getElementById('close-modal');

    // Показать модальное окно
    checkoutBtn?.addEventListener('click', () => {
        checkoutModal.style.display = 'block';
    });

    // Закрыть модальное окно
    closeModal?.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });

    // Обработчик отправки формы заказа
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;

        console.log({ name, address, phone });
        alert('Заказ оформлен. Спасибо!');

        // Закрыть модальное окно
        checkoutModal.style.display = 'none';
    });
});
