document.addEventListener('DOMContentLoaded', function() {
    function loadCSS(filename) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = filename;
        document.head.appendChild(link);
    }

    // Подключаем CSS файл
    loadCSS('css/styles.css');

    fetch('http://localhost:3000/api/products')
    .then(response => response.json())
    .then(products => {
        const productList = document.querySelector('.product-list');
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
    })
    .catch(error => console.error('Ошибка при загрузке продуктов:', error));
});

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
