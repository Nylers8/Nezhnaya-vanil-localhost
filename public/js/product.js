document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        console.error('ID продукта не найден в URL');
        return;
    }

    fetch(`http://localhost:3000/api/product/${productId}`)
    .then(response => response.json())
    .then(product => {
        if (!product) {
            console.error('Продукт не найден');
            return;
        }
        document.getElementById('product-image').src = `/${product.photo_url}`;
        document.getElementById('product-image').alt = product.name;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-price').textContent = `Цена: ${product.price} тг`;
        document.getElementById('product-quantity').textContent = `Количество: ${product.quantity}`;
        document.getElementById('product-description').textContent = product.description;
    })
    .catch(error => console.error('Ошибка при загрузке продукта:', error));
});