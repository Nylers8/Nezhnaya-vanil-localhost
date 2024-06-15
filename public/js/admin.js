document.addEventListener('DOMContentLoaded', function () {
    const categoryForm = document.getElementById('add-category-form');
    categoryForm.onsubmit = function(e) {
        e.preventDefault();
        sendCategory();
    };

    const productForm = document.getElementById('add-product-form');
    productForm.onsubmit = function(e) {
        e.preventDefault();
        sendProduct();
    };

    const categoryInput = document.getElementById('category-input');
    const categoryList = document.getElementById('category-list');
    categoryInput.onclick = function() {
        categoryList.style.display = (categoryList.style.display === 'block') ? 'none' : 'block';
        fetchCategories();
    };

    loadProducts();
    loadUsers();
    loadCategories();

    document.getElementById('search-products').oninput = function() {
        searchProducts(this.value);
    };

    document.getElementById('search-users').oninput = function() {
        searchUsers(this.value);
    };

    document.getElementById('search-categories').oninput = function() {
        searchCategories(this.value);
    };
});

function sendCategory() {
    const name = document.getElementById('category-name').value;
    fetch('http://localhost:3000/add-category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById('category-name').value = '';
        loadCategories(); // Перезагрузка списка категорий после добавления новой
    })
    .catch(error => {
        console.error('Ошибка при добавлении категории:', error);
    });
}

function sendProduct() {
    const formData = new FormData(document.getElementById('add-product-form'));
    formData.append('categories', JSON.stringify(getSelectedCategories()));
    fetch('http://localhost:3000/add-product', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById('add-product-form').reset();
        loadProducts(); // Перезагрузка списка продуктов после добавления нового
    })
    .catch(error => {
        console.error('Ошибка при добавлении товара:', error);
    });
}

function fetchCategories() {
    fetch('http://localhost:3000/get-categories')
    .then(response => response.json())
    .then(data => {
        showCategories(data.categories);
    })
    .catch(error => {
        console.error('Ошибка при получении категорий:', error);
    });
}

function showCategories(categories) {
    const list = document.getElementById('category-list');
    list.innerHTML = '';
    categories.forEach(category => {
        const item = document.createElement('li');
        item.textContent = category.name;
        item.onclick = function() {
            selectCategory(category.name);
        };
        list.appendChild(item);
    });
}

function selectCategory(categoryName) {
    const input = document.getElementById('category-input');
    const currentCategories = getSelectedCategories();
    const categoryIndex = currentCategories.indexOf(categoryName);

    if (categoryIndex === -1) {
        currentCategories.push(categoryName);
    } else {
        currentCategories.splice(categoryIndex, 1);
    }

    input.value = currentCategories.join(', ');
}

function getSelectedCategories() {
    const input = document.getElementById('category-input');
    return input.value ? input.value.split(', ').filter(Boolean) : [];
}

function loadProducts() {
    fetch('http://localhost:3000/api/products')
    .then(response => response.json())
    .then(products => {
        displayProducts(products);
    })
    .catch(error => console.error('Ошибка при загрузке продуктов:', error));
}

function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        productDiv.innerHTML = `
            <img src="/${product.photo_url}" alt="${product.name}">
            <input type="text" value="${product.name}" onchange="updateProduct(${product.product_id}, 'name', this.value)">
            <input type="number" value="${product.price}" onchange="updateProduct(${product.product_id}, 'price', this.value)">
            <textarea onchange="updateProduct(${product.product_id}, 'description', this.value)">${product.description}</textarea>
            <input type="number" value="${product.quantity}" onchange="updateProduct(${product.product_id}, 'quantity', this.value)">
            <button onclick="deleteProduct(${product.product_id})">Удалить</button>
        `;
        productList.appendChild(productDiv);
    });
}

function updateProduct(id, field, value) {
    fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field: field, value: value })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Ошибка при обновлении продукта:', error));
}

function deleteProduct(id) {
    fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadProducts(); // Перезагрузка списка продуктов после удаления
    })
    .catch(error => console.error('Ошибка при удалении продукта:', error));
}

function loadUsers() {
    fetch('http://localhost:3000/api/users')
    .then(response => response.json())
    .then(users => {
        displayUsers(users);
    })
    .catch(error => console.error('Ошибка при загрузке пользователей:', error));
}

function displayUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-card';
        userDiv.innerHTML = `
            <input type="text" value="${user.email}" onchange="updateUser(${user.user_id}, 'email', this.value)">
            <input type="text" value="${user.first_name}" onchange="updateUser(${user.user_id}, 'first_name', this.value)">
            <input type="text" value="${user.last_name}" onchange="updateUser(${user.user_id}, 'last_name', this.value)">
            <input type="text" value="${user.phone}" onchange="updateUser(${user.user_id}, 'phone', this.value)">
            <input type="text" value="${user.city}" onchange="updateUser(${user.user_id}, 'city', this.value)">
            <input type="text" value="${user.address}" onchange="updateUser(${user.user_id}, 'address', this.value)">
            <input type="text" value="${user.postal_code}" onchange="updateUser(${user.user_id}, 'postal_code', this.value)">
            <button onclick="deleteUser(${user.user_id})">Удалить</button>
        `;
        userList.appendChild(userDiv);
    });
}

function updateUser(id, field, value) {
    fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field: field, value: value })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Ошибка при обновлении пользователя:', error));
}

function deleteUser(id) {
    fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadUsers(); // Перезагрузка списка пользователей после удаления
    })
    .catch(error => console.error('Ошибка при удалении пользователя:', error));
}

function loadCategories() {
    fetch('http://localhost:3000/api/categories')
    .then(response => response.json())
    .then(categories => {
        displayCategories(categories);
    })
    .catch(error => console.error('Ошибка при загрузке категорий:', error));
}

function displayCategories(categories) {
    const categoryList = document.getElementById('category-management-list');
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-card';
        categoryDiv.innerHTML = `
            <input type="text" value="${category.name}" onchange="updateCategory(${category.catalog_id}, 'name', this.value)">
            <button onclick="deleteCategory(${category.catalog_id})">Удалить</button>
        `;
        categoryList.appendChild(categoryDiv);
    });
}

function updateCategory(id, field, value) {
    fetch(`http://localhost:3000/api/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field: field, value: value })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Ошибка при обновлении категории:', error));
}

function deleteCategory(id) {
    fetch(`http://localhost:3000/api/categories/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadCategories(); // Перезагрузка списка категорий после удаления
    })
    .catch(error => console.error('Ошибка при удалении категории:', error));
}

function searchProducts(query) {
    fetch(`http://localhost:3000/api/products/search?query=${query}`)
    .then(response => response.json())
    .then(products => {
        displayProducts(products);
    })
    .catch(error => console.error('Ошибка при поиске продуктов:', error));
}

function searchUsers(query) {
    fetch(`http://localhost:3000/api/users/search?query=${query}`)
    .then(response => response.json())
    .then(users => {
        displayUsers(users);
    })
    .catch(error => console.error('Ошибка при поиске пользователей:', error));
}

function searchCategories(query) {
    fetch(`http://localhost:3000/api/categories/search?query=${query}`)
    .then(response => response.json())
    .then(categories => {
        displayCategories(categories);
    })
    .catch(error => console.error('Ошибка при поиске категорий:', error));
}
