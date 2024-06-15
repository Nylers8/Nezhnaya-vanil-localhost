document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    const headerHTML = `
        <header>
            <div class="logo">Логотип</div>
            <div class="site-name"><a href="index.html">Нежная ваниль</a></div>
            <nav>
                <ul>
                    <li><a href="about.html">О нас</a></li>
                    <li><a href="contacts.html">Контакты</a></li>
                    <li class="catalog">
                        <a href="javascript:void(0)">Каталог</a>
                        <ul class="dropdown" id="catalog-dropdown"></ul>
                    </li>
                    ${user ? `
                    <li><a href="javascript:void(0)">${user.first_name} ${user.last_name}</a></li>
                    <li><a href="#" id="logout">Выйти</a></li>
                    ` : `
                    <li><a href="login.html">Авторизация</a></li>
                    <li><a href="register.html">Регистрация</a></li>
                    `}
                </ul>
            </nav>
            <div class="cart">
                <a href="cart.html">Корзина</a>
            </div>
            <div class="search">
                <input type="search" id="search-input" placeholder="Поиск...">
            </div>
        </header>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    if (user) {
        document.getElementById('logout').addEventListener('click', function() {
            localStorage.removeItem('user');
            fetch('http://localhost:3000/logout')
                .then(() => {
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    console.error('Ошибка при выходе:', error);
                });
        });
    }

    fetch('http://localhost:3000/get-categories')
        .then(response => response.json())
        .then(data => {
            const catalogDropdown = document.getElementById('catalog-dropdown');
            data.categories.forEach(category => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<a href="categories.html?category=${category.name}">${category.name}</a>`;
                catalogDropdown.appendChild(listItem);
            });
        })
        .catch(error => console.error('Ошибка при загрузке категорий:', error));

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function () {
        const query = this.value;
        if (window.location.pathname.includes('catalog.html')) {
            fetch(`http://localhost:3000/api/products/search?query=${query}&category=${getCategoryFromURL()}`)
                .then(response => response.json())
                .then(products => displayProducts(products))
                .catch(error => console.error('Ошибка при поиске продуктов:', error));
        } else {
            fetch(`http://localhost:3000/api/products/search?query=${query}`)
                .then(response => response.json())
                .then(products => displayProducts(products))
                .catch(error => console.error('Ошибка при поиске продуктов:', error));
        }
    });
});

function getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('category');
}

function displayProducts(products) {
    const productList = document.querySelector('.product-grid');
    if (!productList) return;
    productList.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        productDiv.innerHTML = `
            <img src="/${product.photo_url}" alt="${product.name}" onclick="window.location.href='product.html?id=${product.product_id}'">
            <h3>${product.name}</h3>
            <p>${product.price} тг</p>
            <p>Количество: ${product.quantity}</p>
            <button onclick="addToCart(${product.product_id})">Добавить в корзину</button>
        `;
        productList.appendChild(productDiv);
    });
}

function addToCart(productId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Пожалуйста, войдите в систему, чтобы добавить товар в корзину.');
        return;
    }

    fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.user_id, product_id: productId, quantity: 1 })
    })
    .then(response => response.json())
    .then(data => {
        alert('Товар добавлен в корзину.');
    })
    .catch(error => console.error('Ошибка при добавлении товара в корзину:', error));
}

