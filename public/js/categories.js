document.addEventListener('DOMContentLoaded', function () {
    const category = getCategoryFromURL();
    if (category) {
        fetch(`http://localhost:3000/api/products?category=${category}`)
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(products => {
                console.log('Products:', products);
                document.getElementById('category-title').textContent = category;
                document.getElementById('product-count').textContent = `${products.length} товаров`;
                displayProducts(products);
            })
            .catch(error => console.error('Ошибка при загрузке продуктов:', error));
    }

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
