// Добавьте в самое начало файла script.js
const BASE_URL = ''; // Оставляем пустым для относительных путей

// Функция для проверки загрузки скрипта
console.log("Script loaded successfully!");

// Функция для отладки - проверяем, что все работает
function debugQuickView() {
    console.log("=== ДЕБАГ БЫСТРОГО ПРОСМОТРА ===");
    console.log("Функция openQuickView доступна:", typeof openQuickView);
    console.log("Модальное окно найдено:", document.getElementById('quickViewModal'));
    console.log("Кнопки быстрого просмотра:", document.querySelectorAll('.quick-view-button').length);
    
    // Проверяем продукты
    console.log("Продукты загружены:", products.length);
    products.forEach(p => console.log(`Продукт ${p.id}: ${p.name}`));
}

// Данные о товарах для TechGadgets
const products = [
    {
        id: 1,
        name: "Беспроводные наушники",
        price: 2500,
        category: "audio",
        image: "images/headphones.jpg",
        description: "Наушники с шумоподавлением, время работы 20 часов"
    },
    {
        id: 2,
        name: "Power Bank 10000 mAh",
        price: 1200,
        category: "chargers",
        image: "images/Powerbank.jpg",
        description: "Компактное зарядное устройство с двумя USB-портами"
    },
    {
        id: 3,
        name: "Чехол для телефона",
        price: 800,
        category: "accessories",
        image: "images/Phonecase.jpg",
        description: "Чехол для телефона "
    },
    {
        id: 4,
        name: "USB-флешка 64GB",
        price: 600,
        category: "storage",
        image: "images/Usb.jpg",
        description: "Стильная флешка с защитой от воды"
    },
    {
        id: 5,
        name: "Игровой контроллер для смартфона",
        price: 1500,
        category: "gaming",
        image: "images/orig.jpg",
        description: "Выдвижной геймпад для мобильных игр"
    },
    {
        id: 6,
        name: "Звуковые колонки",
        price: 3200,
        category: "audio",
        image: "images/orig2.jpg",
        description: "Колонки со встроенным bluetooth"
    }
];

function checkImages() {
    console.log("=== ПРОВЕРКА ИЗОБРАЖЕНИЙ ===");
    products.forEach(product => {
        const img = new Image();
        img.onload = () => console.log(`✅ ${product.name}: изображение загружено`);
        img.onerror = () => {
            console.log(`❌ ${product.name}: изображение не найдено, используем заглушку`);
            product.image = `https://via.placeholder.com/300x300/2563eb/ffffff?text=${encodeURIComponent(product.name)}`;
        };
        img.src = product.image;
    });
}

// === ИСТОРИЯ ПРОСМОТРОВ ===
function addToRecentlyViewed(productId) {
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    
    // Удаляем товар если он уже есть (чтобы не было дублей)
    viewed = viewed.filter(id => id !== productId);
    
    // Добавляем в начало
    viewed.unshift(productId);
    
    // Ограничиваем до 5 последних товаров
    viewed = viewed.slice(0, 5);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
    displayRecentlyViewed();
}

function displayRecentlyViewed() {
    const container = document.getElementById('recently-viewed');
    if (!container) return;
    
    const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    
    if (viewedIds.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    const grid = container.querySelector('.products-grid');
    grid.innerHTML = '';
    
    viewedIds.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const views = getProductViews(product.id);
            const isInCompare = compareItems.find(item => item.id === product.id);
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300/2563eb/ffffff?text=TechGadgets'">
                <h3>${product.name}</h3>
                <p class="description">${product.description}</p>
                
                <div class="product-meta">
                    <div class="product-views">
                        <span class="views-icon">👁️</span>
                        <span class="views-count">${views}</span>
                    </div>
                    ${generateRatingStars(product.id)}
                </div>
                
                <p class="price">${product.price} руб.</p>
                <div class="product-actions">
                    <button class="add-to-cart" data-product-id="${product.id}">
                        В корзину
                    </button>
                    <button class="quick-view-button" data-product-id="${product.id}">
                        Быстрый просмотр
                    </button>
                </div>
                <button class="compare-btn ${isInCompare ? 'active' : ''}" data-product-id="${product.id}">
                    ${isInCompare ? '✓ В сравнении' : '📊 Сравнить'}
                </button>
            `;
            grid.appendChild(productCard);
        }
    });
}

// Функции для работы с корзиной
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Добавление товара в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCounter();
    showNotification('Товар добавлен в корзину!');
}

// Удаление товара из корзины - ИСПРАВЛЕНО (мгновенное обновление HTML)
function removeFromCart(productId) {
    console.log(`🗑️ Удаление товара ${productId} из корзины`);
    
    // Находим товар для сообщения
    const removedItem = cart.find(item => item.id === productId);
    const itemName = removedItem ? removedItem.name : 'Товар';
    
    // Удаляем товар из массива
    cart = cart.filter(item => item.id !== productId);
    
    // Сохраняем в localStorage
    saveCart();
    
    // Обновляем счетчики везде
    updateCartCounter();
    
    // ВАЖНО: Обновляем отображение корзины на текущей странице
    const cartItemsContainer = document.querySelector('.cart-items');
    if (cartItemsContainer) {
        console.log("🔄 Обновляем HTML корзины");
        
        // Очищаем контейнер
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            // Показываем пустую корзину
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>😔 Ваша корзина пуста</p>
                    <p>Добавьте гаджеты из каталога!</p>
                    <a href="catalog.html" class="checkout-btn" style="margin-top: 15px; display: inline-block; text-decoration: none;">
                        Перейти в каталог
                    </a>
                </div>
            `;
            
            // Обнуляем цены
            const totalPriceElement = document.getElementById('total-price');
            const subtotalPriceElement = document.getElementById('subtotal-price');
            if (totalPriceElement) totalPriceElement.textContent = '0 руб.';
            if (subtotalPriceElement) subtotalPriceElement.textContent = '0 руб.';
            
        } else {
            // Заново отображаем все оставшиеся товары
            let totalPrice = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.setAttribute('data-product-id', item.id);
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80/2563eb/ffffff?text=Товар'">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p class="price">${item.price} руб./шт.</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn" data-product-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-product-id="${item.id}">+</button>
                    </div>
                    <div class="item-total">${itemTotal} руб.</div>
                    <button class="remove-btn" data-product-id="${item.id}">
                        🗑️ Удалить
                    </button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
            
            // Обновляем цены
            updateCartTotal();
            
            // Переназначаем обработчики для новых кнопок
            setupCartItemHandlers();
        }
    }
    
    // Показываем уведомление
    showNotification(`${itemName} удален из корзины`);
}

// Изменение количества товара - ИСПРАВЛЕНО
function updateQuantity(productId, newQuantity) {
    console.log(`🔄 Обновление количества товара ${productId}: ${newQuantity}`);
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCounter();
        
        // Если мы на странице корзины, обновляем отображение
        if (window.location.pathname.includes('cart.html')) {
            // Находим элемент товара и обновляем его количество и сумму
            const cartItem = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
            if (cartItem) {
                const quantitySpan = cartItem.querySelector('.quantity');
                const itemTotalDiv = cartItem.querySelector('.item-total');
                
                if (quantitySpan) quantitySpan.textContent = newQuantity;
                if (itemTotalDiv) {
                    const newTotal = item.price * newQuantity;
                    itemTotalDiv.textContent = newTotal + ' руб.';
                }
                
                // Обновляем общую сумму корзины
                updateCartTotal();
            }
        }
        
        showNotification('Количество обновлено');
    }
}

// Функция для обновления общей суммы корзины
function updateCartTotal() {
    const totalPriceElement = document.getElementById('total-price');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    
    if (!totalPriceElement && !subtotalPriceElement) return;
    
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    console.log(`💰 Общая сумма корзины: ${total} руб.`);
    
    if (totalPriceElement) totalPriceElement.textContent = total + ' руб.';
    if (subtotalPriceElement) subtotalPriceElement.textContent = total + ' руб.';
}

// === СРАВНЕНИЕ ТОВАРОВ ===
let compareItems = JSON.parse(localStorage.getItem('compareItems')) || [];

function toggleCompare(productId) {
    console.log("=== TOGGLE COMPARE ===");
    console.log("Product ID:", productId);
    console.log("Current compare items:", compareItems);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error("❌ Товар не найден");
        return false;
    }
    
    // ПРАВИЛЬНАЯ проверка наличия товара в сравнении
    const existingIndex = compareItems.findIndex(item => item.id === productId);
    console.log("Индекс товара в сравнении:", existingIndex);
    
    if (existingIndex !== -1) {
        // Удаляем из сравнения
        compareItems.splice(existingIndex, 1);
        console.log("✅ Товар удален из сравнения");
        showNotification('Товар удален из сравнения');
    } else {
        // Добавляем в сравнение (максимум 3 товара)
        if (compareItems.length >= 3) {
            console.log("⚠️ Достигнут лимит сравнения");
            showNotification('Можно сравнивать не более 3 товаров');
            return false;
        }
        compareItems.push(product);
        console.log("✅ Товар добавлен в сравнение");
        showNotification('Товар добавлен в сравнение');
    }
    
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
    updateCompareCounter();
    updateAllCompareButtons();
    console.log("Updated compare items:", compareItems);
    return true;
}

function updateCompareCounter() {
    const compareCounter = document.querySelector('.compare-counter');
    if (compareCounter) {
        compareCounter.textContent = compareItems.length;
    }
}

// Принудительное обновление всех кнопок сравнения на странице
function updateAllCompareButtons() {
    console.log("🔄 Обновление всех кнопок сравнения...");
    console.log("Текущие товары в сравнении:", compareItems);
    
    const compareButtons = document.querySelectorAll('.compare-btn');
    compareButtons.forEach(button => {
        const productId = parseInt(button.getAttribute('data-product-id'));
        const isInCompare = compareItems.some(item => item.id === productId); // ← Используем some вместо find
        
        console.log(`Кнопка ${productId}: в сравнении = ${isInCompare}`);
        
        if (isInCompare) {
            button.textContent = '✓ В сравнении';
            button.classList.add('active');
        } else {
            button.textContent = '📊 Сравнить';
            button.classList.remove('active');
        }
    });
    console.log("✅ Обновлено кнопок:", compareButtons.length);
}

function setupComparePage() {
    console.log("🔄 Настройка страницы сравнения...");
    const compareGrid = document.getElementById('compareGrid');
    if (!compareGrid) {
        console.error("❌ Элемент compareGrid не найден");
        return;
    }
    
    console.log("Товары в сравнении:", compareItems);
    
    if (compareItems.length === 0) {
        compareGrid.innerHTML = `
            <div class="empty-compare">
                <p>😔 В сравнении нет товаров</p>
                <p>Добавьте товары из каталога!</p>
                <a href="catalog.html" class="checkout-btn">Перейти в каталог</a>
            </div>
        `;
        return;
    }
    
    // Создаем таблицу сравнения
    let compareHTML = `
        <div class="compare-header">
            <div class="compare-features">Характеристики</div>
            ${compareItems.map(item => `
                <div class="compare-product">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150x150/2563eb/ffffff?text=TechGadgets'">
                    <h3>${item.name}</h3>
                    <p class="price">${item.price} руб.</p>
                    <button class="remove-compare-btn" onclick="removeFromCompare(${item.id})">Удалить</button>
                </div>
            `).join('')}
        </div>
    `;
    
    // Добавляем строки сравнения
    const features = [
        { name: 'Категория', key: 'category', format: (val) => getCategoryName(val) },
        { name: 'Цена', key: 'price', format: (val) => `${val} руб.` },
        { name: 'Описание', key: 'description', format: (val) => val }
    ];
    
    features.forEach(feature => {
        compareHTML += `
            <div class="compare-row">
                <div class="compare-features">${feature.name}</div>
                ${compareItems.map(item => `
                    <div class="compare-value">
                        ${feature.format ? feature.format(item[feature.key]) : item[feature.key]}
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    compareGrid.innerHTML = compareHTML;
    console.log("✅ Страница сравнения настроена");
}

function removeFromCompare(productId) {
    console.log("🗑️ Удаляем товар из сравнения:", productId);
    compareItems = compareItems.filter(item => item.id !== productId);
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
    setupComparePage();
    updateCompareCounter();
    showNotification('Товар удален из сравнения');
}

function getCategoryName(category) {
    const categories = {
        'audio': '🎧 Аудио',
        'chargers': '🔌 Зарядные устройства',
        'accessories': '📱 Аксессуары',
        'storage': '💾 Накопители',
        'gaming': '🎮 Игровые'
    };
    return categories[category] || category;
}

// === БЫСТРЫЙ ПРОСМОТР ===
function openQuickView(productId) {
    console.log("🔍 Открываем быстрый просмотр для товара:", productId);
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error("❌ Товар не найден");
        return;
    }

    const modal = document.getElementById('quickViewModal');
    const content = document.getElementById('quickViewContent');
    
    if (!modal || !content) {
        console.error("❌ Модальное окно не найдено");
        return;
    }

    // Заполняем контент модального окна
    content.innerHTML = `
        <div class="quick-view-grid">
            <div class="quick-view-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400/2563eb/ffffff?text=TechGadgets'">
            </div>
            <div class="quick-view-details">
                <h2>${product.name}</h2>
                <div class="quick-view-price">${product.price} руб.</div>
                <p class="quick-view-description">${product.description}</p>
                
                <div class="product-features">
                    <div class="feature">
                        <span class="feature-icon">📦</span>
                        <span>Бесплатная доставка</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🛡️</span>
                        <span>Гарантия 1 год</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🔄</span>
                        <span>Возврат в течение 14 дней</span>
                    </div>
                </div>
                
                <div class="quick-view-actions">
                    <button class="quick-view-btn quick-buy" onclick="quickBuy(${product.id})">
                        🚀 Быстрая покупка
                    </button>
                    <button class="quick-view-btn add-to-cart-quick" onclick="addToCartFromQuickView(${product.id})">
                        🛒 Добавить в корзину
                    </button>
                </div>
            </div>
        </div>
    `;

    // Показываем модальное окно
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Запрещаем прокрутку страницы
}

// Закрытие модального окна
function closeQuickView() {
    console.log("🔒 Закрываем модальное окно");
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Возвращаем прокрутку
    }
}

// Быстрая покупка из модального окна
function quickBuy(productId) {
    console.log("🚀 Быстрая покупка товара ID:", productId);
    addToCart(productId);
    closeQuickView();
    // Перенаправляем в корзину для оформления заказа
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 500);
}

// Добавление в корзину из модального окна
function addToCartFromQuickView(productId) {
    console.log("🛒 Добавляем в корзину из быстрого просмотра:", productId);
    addToCart(productId);
    closeQuickView();
}

// Обновление счетчика товаров в корзине (в шапке сайта)
function updateCartCounter() {
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
    }
}

// Показ уведомлений - ИСПРАВЛЕННАЯ ВЕРСИЯ
function showNotification(message) {
    console.log("🔔 Уведомление:", message);
    
    // Удаляем предыдущее уведомление, если есть
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        z-index: 9999;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: slideInNotification 0.3s ease;
        border: 1px solid rgba(255,255,255,0.2);
    `;
    
    // Добавляем стиль анимации, если его нет
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInNotification {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideInNotification 0.3s reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Отображение товаров на главной странице и в каталоге
function displayProducts(productsToShow = products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    // ПЕРЕЗАГРУЖАЕМ compareItems из localStorage ПЕРЕД созданием кнопок
    compareItems = JSON.parse(localStorage.getItem('compareItems')) || [];
    console.log("🔄 displayProducts: compareItems загружены:", compareItems);
    
    productsGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        // ИСПОЛЬЗУЕМ АКТУАЛЬНЫЕ ДАННЫЕ для определения состояния кнопок
        const isInCompare = compareItems.some(item => item.id === product.id);
        const views = getProductViews(product.id);
        
        console.log(`Товар ${product.id}: в сравнении = ${isInCompare}`);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300/2563eb/ffffff?text=TechGadgets'">
            <h3>${product.name}</h3>
            <p class="description">${product.description}</p>
            
            <div class="product-meta">
                <div class="product-views">
                    <span class="views-icon">👁️</span>
                    <span class="views-count">${views}</span>
                </div>
                ${generateRatingStars(product.id)}
            </div>
            
            <p class="price">${product.price} руб.</p>
            <div class="product-actions">
                <button class="add-to-cart" data-product-id="${product.id}">
                    В корзину
                </button>
                <button class="quick-view-button" data-product-id="${product.id}">
                    Быстрый просмотр
                </button>
            </div>
            <button class="compare-btn ${isInCompare ? 'active' : ''}" data-product-id="${product.id}">
                ${isInCompare ? '✓ В сравнении' : '📊 Сравнить'}
            </button>
        `;
        productsGrid.appendChild(productCard);
    });
    
    // Убираем старые прямые обработчики, так как у нас теперь работает универсальный
    console.log("✅ Товары отображены с актуальным состоянием сравнения");
}

// Отображение товаров в корзине - ИСПРАВЛЕНО
function displayCartItems() {
    console.log("🛒 Отображение корзины, товаров:", cart.length);
    
    const cartItems = document.querySelector('.cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    
    if (!cartItems) {
        console.error("❌ Элемент .cart-items не найден");
        return;
    }
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>😔 Ваша корзина пуста</p>
                <p>Добавьте гаджеты из каталога!</p>
                <a href="catalog.html" class="checkout-btn" style="margin-top: 15px; display: inline-block; text-decoration: none;">
                    Перейти в каталог
                </a>
            </div>
        `;
        if (totalPriceElement) totalPriceElement.textContent = '0 руб.';
        if (subtotalPriceElement) subtotalPriceElement.textContent = '0 руб.';
        return;
    }
    
    let totalPrice = 0;
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('data-product-id', item.id);
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80/2563eb/ffffff?text=Товар'">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="price">${item.price} руб./шт.</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn decrease-btn" data-product-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase-btn" data-product-id="${item.id}">+</button>
            </div>
            <div class="item-total">${itemTotal} руб.</div>
            <button class="remove-btn" data-product-id="${item.id}">
                🗑️ Удалить
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    if (totalPriceElement) totalPriceElement.textContent = totalPrice + ' руб.';
    if (subtotalPriceElement) subtotalPriceElement.textContent = subtotal + ' руб.';
    
    // Добавляем обработчики для кнопок в корзине
    setupCartItemHandlers();
}

// Обработчики для кнопок в корзине
function setupCartItemHandlers() {
    console.log("🔧 Настройка обработчиков кнопок корзины");
    
    // Удаляем старые обработчики через новые функции
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            const item = cart.find(i => i.id === productId);
            if (item) {
                updateQuantity(productId, item.quantity - 1);
            }
        };
    });
    
    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            const item = cart.find(i => i.id === productId);
            if (item) {
                updateQuantity(productId, item.quantity + 1);
            }
        };
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            removeFromCart(productId);
        };
    });
}

// Обработчики событий
function handleDecrease(e) {
    e.preventDefault();
    e.stopPropagation();
    const productId = parseInt(this.getAttribute('data-product-id'));
    const item = cart.find(i => i.id === productId);
    if (item) {
        updateQuantity(productId, item.quantity - 1);
    }
}

function handleIncrease(e) {
    e.preventDefault();
    e.stopPropagation();
    const productId = parseInt(this.getAttribute('data-product-id'));
    const item = cart.find(i => i.id === productId);
    if (item) {
        updateQuantity(productId, item.quantity + 1);
    }
}

function handleRemove(e) {
    e.preventDefault();
    e.stopPropagation();
    const productId = parseInt(this.getAttribute('data-product-id'));
    removeFromCart(productId);
}

// Обновленная функция отображения заказа
function displayOrderSummary() {
    const orderItems = document.querySelector('#order-items');
    const orderTotalPrice = document.querySelector('#order-total-price');
    
    if (!orderItems) return;
    
    orderItems.innerHTML = '';
    
    if (cart.length === 0) {
        orderItems.innerHTML = `
            <div class="empty-order">
                <p>😔 В заказе нет товаров</p>
                <a href="catalog.html" style="color: var(--primary); text-decoration: none;">Добавить товары</a>
            </div>
        `;
        if (orderTotalPrice) {
            orderTotalPrice.textContent = '0';
        }
        return;
    }
    
    let totalPrice = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div style="font-size: 0.9rem; color: #64748b;">${item.quantity} × ${item.price} руб.</div>
            </div>
            <strong>${itemTotal} руб.</strong>
        `;
        orderItems.appendChild(orderItem);
    });
    
    if (orderTotalPrice) {
        orderTotalPrice.textContent = totalPrice;
    }
}
// Обработка формы заказа
function setupOrderForm() {
    const orderForm = document.querySelector('#order-form');
    if (!orderForm) return;
    
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Собираем данные формы
        const formData = {
            fullname: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            comment: document.getElementById('comment').value,
            payment: document.querySelector('input[name="payment"]:checked').value,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            orderId: 'ORD-' + Date.now()
        };
        
        // В реальном проекте здесь был бы AJAX-запрос на сервер
        // Для учебного проекта просто покажем сообщение и очистим корзину
        
        // Сохраняем заказ в localStorage (для истории)
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(formData);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Очищаем корзину
        cart = [];
        saveCart();
        updateCartCounter();
        
        // Показываем сообщение об успехе
alert(`✅ Заказ оформлен успешно!\nНомер вашего заказа: ${formData.orderId}\nМы отправили подтверждение на ${formData.email}\nС вами свяжутся для уточнения деталей доставки.`);
        
        // Перенаправляем на главную страницу
        window.location.href = 'index.html';
    });
}
// === ПОИСК ТОВАРОВ ===
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );

        displaySearchResults(filteredProducts, searchTerm);
    });

// Запускаем инициализацию когда страница полностью загружена
document.addEventListener('DOMContentLoaded', init);

    // Закрытие результатов при клике вне поиска
    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function displaySearchResults(results, searchTerm) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <p>😔 Не найдено товаров по запросу</p>
                <p>"${searchTerm}"</p>
            </div>
        `;
    } else {
        searchResults.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="addToCart(${product.id}); this.style.background='#dcfce7'; setTimeout(() => this.style.background='', 1000);">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                <div class="search-result-info">
                    <h4>${product.name}</h4>
                    <div class="price">${product.price} руб.</div>
                </div>
            </div>
        `).join('');
    }
    
    searchResults.style.display = 'block';
}
function trackProductView(productId) {
    addToRecentlyViewed(productId); // Добавляем в историю просмотров
    
    let views = JSON.parse(localStorage.getItem('productViews')) || {};
    views[productId] = (views[productId] || 0) + 1;
    localStorage.setItem('productViews', JSON.stringify(views));
    return views[productId];
}

function getProductViews(productId) {
    const views = JSON.parse(localStorage.getItem('productViews')) || {};
    return views[productId] || 0;
}



// === ИНТЕРАКТИВНЫЙ РЕЙТИНГ ===
function generateRatingStars(productId) {
    // Получаем рейтинг из localStorage или используем случайный
    const savedRating = localStorage.getItem(`rating_${productId}`);
    const rating = savedRating ? parseFloat(savedRating) : (Math.random() * 2 + 3).toFixed(1);
    
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= Math.floor(rating);
        starsHtml += `<span class="rating-star ${isActive ? 'active' : ''}" data-value="${i}">★</span>`;
    }
    
    return `
        <div class="product-rating-interactive" data-product-id="${productId}">
            ${starsHtml}
            <span class="rating-value">${rating}</span>
        </div>
    `;
}

// Инициализация рейтинга
function setupRatingHandlers() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('rating-star')) {
            const star = e.target;
            const ratingValue = parseInt(star.getAttribute('data-value'));
            const ratingContainer = star.closest('.product-rating-interactive');
            const productId = ratingContainer.getAttribute('data-product-id');
            const valueDisplay = ratingContainer.querySelector('.rating-value');
            
            // Обновляем звезды
            ratingContainer.querySelectorAll('.rating-star').forEach(s => {
                const starValue = parseInt(s.getAttribute('data-value'));
                if (starValue <= ratingValue) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            
            // Обновляем числовое значение
            valueDisplay.textContent = ratingValue + '.0';
            
            // Сохраняем в localStorage
            localStorage.setItem(`rating_${productId}`, ratingValue.toString());
            
            console.log(`Пользователь оценил товар ${productId} на ${ratingValue} звезд`);
        }
    });
}

    
function closeQuickView() {
    console.log("🔒 Закрываем модальное окно");
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Быстрая покупка из модального окна
function quickBuy(productId) {
    console.log("🚀 Быстрая покупка товара ID:", productId);
    addToCart(productId);
    closeQuickView();
    // Перенаправляем в корзину для оформления заказа
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 500);
}

// Добавление в корзину из модального окна
function addToCartFromQuickView(productId) {
    console.log("🛒 Добавляем в корзину из быстрого просмотра:", productId);
    addToCart(productId);
    closeQuickView();
}
// Закрытие модального окна

// Функции для фильтрации товаров (для каталога)
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterBtns.forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            const filter = this.textContent.trim();
            let filteredProducts = products;
            
            // Сопоставляем русские названия фильтров с категориями в товарах
            if (filter === 'Аудио') {
                filteredProducts = products.filter(p => p.category === 'audio');
            } else if (filter === 'Зарядные устройства') {
                filteredProducts = products.filter(p => p.category === 'chargers');
            } else if (filter === 'Аксессуары') {
                filteredProducts = products.filter(p => p.category === 'accessories');
            } else if (filter === 'Накопители') {
                filteredProducts = products.filter(p => p.category === 'storage');
            } else if (filter === 'Игровые') {
                filteredProducts = products.filter(p => p.category === 'gaming');
            }
            // "Все" - показываем все товары
            
            displayProducts(filteredProducts);
        });
    });
}

// === ФИЛЬТР ПО ЦЕНЕ ===
function setupPriceFilter() {
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceRangeValue');
    const applyBtn = document.getElementById('applyPriceFilter');
    
    if (!priceRange || !applyBtn) return;
    
    // Обновляем отображение значения
    priceRange.addEventListener('input', function() {
        priceValue.textContent = this.value + ' руб.';
    });
    
    // Применяем фильтр
    applyBtn.addEventListener('click', function() {
        const maxPrice = parseInt(priceRange.value);
        const filteredProducts = products.filter(product => product.price <= maxPrice);
        displayProducts(filteredProducts);
        
        // Показываем количество найденных товаров
        showNotification(`Найдено ${filteredProducts.length} товаров до ${maxPrice} руб.`);
    });
}

// === ТАЙМЕР АКЦИЙ ===
function startPromotionTimer() {
    const timerElement = document.querySelector('.promotion-timer');
    if (!timerElement) return; // Если элемента нет на странице, выходим
    
    const endTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    
    function updateTimer() {
        const now = new Date().getTime();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
            timerElement.innerHTML = `
                <h3>🎉 Акция завершена!</h3>
                <p>Следите за новыми акциями</p>
            `;
            return;
        }
        
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const hoursElement = document.getElementById('timer-hours');
        const minutesElement = document.getElementById('timer-minutes');
        const secondsElement = document.getElementById('timer-seconds');
        
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}
// === ЧАТ-БОТ ===
const chatBot = {
    init() {
        this.toggleBtn = document.querySelector('.chatbot-toggle');
        this.container = document.querySelector('.chatbot-container');
        this.closeBtn = document.querySelector('.chatbot-close');
        this.sendBtn = document.getElementById('sendMessage');
        this.chatInput = document.getElementById('chatInput');
        this.messagesContainer = document.getElementById('chatMessages');
        
        this.setupEvents();
    },
    
    setupEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    },
    
    toggleChat() {
        this.container.classList.toggle('active');
        if (this.container.classList.contains('active')) {
            this.chatInput.focus();
        }
    },
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        
        // Имитация набора сообщения ботом
        setTimeout(() => {
            this.botResponse(message);
        }, 1000);
    },
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    },
    
    botResponse(userMessage) {
        const responses = {
            'привет': 'Здравствуйте! 👋 Чем могу помочь с выбором гаджетов?',
            'здравствуйте': 'Добрый день! 🎧 Ищете что-то конкретное или нужна помощь с выбором?',
            'доставка': '🚚 Доставка осуществляется в течение 2-3 дней по всей России. Бесплатная доставка от 3000 рублей!',
            'цена': '💎 Все цены указаны на страницах товаров. Есть товары разных ценовых категорий!',
            'акция': '🎁 У нас сейчас действуют специальные предложения! Следите за таймером акций на главной странице.',
            'возврат': '🔄 Возврат товара возможен в течение 14 дней с момента получения.',
            'каталог': '📱 Весь каталог доступен на странице "Каталог". Используйте фильтры для удобного поиска!',
            'гарантия': '🛡️ На все товары предоставляется гарантия от 1 года. Подробности в описании каждого товара.',
            'оплата': '💳 Доступные способы оплаты: банковские карты, наличные при получении, электронные кошельки.',
            'помощь': '🤝 Чем конкретно могу помочь? Могу рассказать о доставке, акциях, помочь с выбором товара!'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        let response = '🤔 Извините, я не понял вопрос. Можете переформулировать? Попробуйте спросить о доставке, акциях или ассортименте товаров.';
        
        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                response = value;
                break;
            }
        }
        
        this.addMessage(response, 'bot');
    }
};

function setupUniversalEventHandlers() {
    console.log("🔄 Настройка универсальных обработчиков событий...");
    
    // Удаляем старые обработчики чтобы избежать дублирования
    document.removeEventListener('click', this);
    
    // Используем делегирование событий на всем документе
    document.addEventListener('click', function(event) {
        const target = event.target;
        console.log("🎯 Клик по элементу:", target.tagName, target.className);
        
        // Обработка кликов по product-card (включая кнопки внутри)
        if (target.closest('.product-card')) {
            event.preventDefault();
            event.stopPropagation();
            
            const productCard = target.closest('.product-card');
            const clickedElement = target;
            
            console.log("📦 Клик внутри product-card, элемент:", clickedElement.tagName, clickedElement.className);
            
            // Проверяем, кликнули ли прямо на кнопку сравнения или на ее текст
            if (clickedElement.classList.contains('compare-btn') || 
                clickedElement.closest('.compare-btn') ||
                clickedElement.textContent.includes('Сравнить') || 
                clickedElement.textContent.includes('В сравнении')) {
                
                const compareBtn = clickedElement.classList.contains('compare-btn') ? 
                                 clickedElement : clickedElement.closest('.compare-btn');
                
                if (compareBtn) {
                    const productId = parseInt(compareBtn.getAttribute('data-product-id'));
                    console.log("🎯 КЛИК ПО КНОПКЕ СРАВНЕНИЯ! Product ID:", productId);
                    
                    if (productId) {
                        toggleCompare(productId);
                        return;
                    }
                }
            }
            
            // Проверяем другие кнопки
            if (clickedElement.classList.contains('add-to-cart') || clickedElement.closest('.add-to-cart')) {
                const button = clickedElement.classList.contains('add-to-cart') ? 
                              clickedElement : clickedElement.closest('.add-to-cart');
                const productId = parseInt(button.getAttribute('data-product-id'));
                console.log("🛒 Клик по кнопке корзины:", productId);
                if (productId) addToCart(productId);
                return;
            }
            
            if (clickedElement.classList.contains('quick-view-button') || clickedElement.closest('.quick-view-button')) {
                const button = clickedElement.classList.contains('quick-view-button') ? 
                              clickedElement : clickedElement.closest('.quick-view-button');
                const productId = parseInt(button.getAttribute('data-product-id'));
                console.log("🔍 Клик по кнопке быстрого просмотра:", productId);
                if (productId) openQuickView(productId);
                return;
            }
            
            console.log("ℹ️ Клик по product-card, но не по кнопке");
            return;
        }
        
        // Закрытие модального окна
        if (target.classList.contains('close-modal') || target.classList.contains('modal')) {
            closeQuickView();
            return;
        }
    });
    
    // Обработка клавиши Escape для закрытия модальных окон
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeQuickView();
        }
    });
    
    console.log("✅ Универсальные обработчики событий настроены");
}

function init() {
    console.log("=== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===");
    
    // Базовая инициализация
    checkImages();
    updateCartCounter();
    updateCompareCounter();
    setupSearch();
    setupUniversalEventHandlers();
    setupRatingHandlers();
// В функции init замените вызов chatBot.init на:
try {
    chatBot.init();
} catch (error) {
    console.log("Чат-бот не инициализирован на этой странице:", error.message);
}
    
    // Инициализация страниц
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        console.log("📄 Загрузка главной страницы");
        compareItems = JSON.parse(localStorage.getItem('compareItems')) || [];
    console.log("Главная страница: compareItems загружены", compareItems);
        displayProducts();
        startPromotionTimer();
        displayRecentlyViewed();
    } else if (window.location.pathname.includes('catalog.html')) {
        console.log("📄 Загрузка каталога");
        displayProducts();
        setupFilters();
        setupPriceFilter();
    } else if (window.location.pathname.includes('cart.html')) {
        console.log("📄 Загрузка корзины");
        displayCartItems();
    } else if (window.location.pathname.includes('order.html')) {
        console.log("📄 Загрузка оформления заказа");
        displayOrderSummary();
        setupOrderForm();
    } else if (window.location.pathname.includes('compare.html')) {
        console.log("📄 Загрузка сравнения");
        setupComparePage(); // ← ДОБАВЬТЕ ЭТУ СТРОЧКУ
    } else if (window.location.pathname.includes('compare.html')) {
    console.log("📄 Загрузка сравнения");
    
    // Принудительно загружаем compareItems из localStorage
    compareItems = JSON.parse(localStorage.getItem('compareItems')) || [];
    console.log("Товары в сравнении:", compareItems);
    
    setupComparePage();
    updateCompareCounter();
}
    
    
    // Добавление счетчиков в шапку
    addCartCounterToHeader();
    addCompareCounterToHeader();
    
    console.log("✅ Инициализация завершена");

}

// Добавление счетчика товаров в шапку - ИСПРАВЛЕНО
function addCartCounterToHeader() {
    const cartLink = document.querySelector('nav a[href="cart.html"]');
    if (cartLink) {
        // Удаляем старый счетчик, если есть
        const oldCounter = cartLink.querySelector('.cart-counter');
        if (oldCounter) oldCounter.remove();
        
        // Создаем новый счетчик
        const counter = document.createElement('span');
        counter.className = 'cart-counter';
        counter.style.cssText = `
            background: #ff4757;
            color: white;
            border-radius: 50%;
            padding: 2px 8px;
            font-size: 0.8rem;
            margin-left: 8px;
            display: inline-block;
            min-width: 20px;
            text-align: center;
        `;
        cartLink.appendChild(counter);
    }
    updateCartCounter();
}

function addCompareCounterToHeader() {
    const compareLink = document.querySelector('nav a[href="compare.html"]');
    if (compareLink) {
        // Удаляем старый счетчик, если есть
        const oldCounter = compareLink.querySelector('.compare-counter');
        if (oldCounter) oldCounter.remove();
        
        // Создаем новый счетчик
        const counter = document.createElement('span');
        counter.className = 'compare-counter';
        counter.style.cssText = `
            background: #8b5cf6;
            color: white;
            border-radius: 50%;
            padding: 2px 8px;
            font-size: 0.8rem;
            margin-left: 8px;
            display: inline-block;
            min-width: 20px;
            text-align: center;
        `;
        compareLink.appendChild(counter);
    }
    updateCompareCounter();
}

// Обновление счетчика товаров в корзине
function updateCartCounter() {
    const cartCounters = document.querySelectorAll('.cart-counter');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    cartCounters.forEach(counter => {
        counter.textContent = totalItems;
        // Показываем счетчик только если есть товары
        counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    });
}

// Обновление счетчика сравнения
function updateCompareCounter() {
    const compareCounters = document.querySelectorAll('.compare-counter');
    compareCounters.forEach(counter => {
        counter.textContent = compareItems.length;
        counter.style.display = compareItems.length > 0 ? 'inline-block' : 'none';
    });
}

// Запускаем инициализацию когда страница полностью загружена
document.addEventListener('DOMContentLoaded', init);
// Функция для тестирования сравнения
function testCompare() {
    console.log("=== ТЕСТ СРАВНЕНИЯ ===");
    console.log("Товары в сравнении:", compareItems);
    console.log("Локальное хранилище:", JSON.parse(localStorage.getItem('compareItems')));
    
    // Добавляем тестовые товары
    toggleCompare(1);
    toggleCompare(2);
    
    setTimeout(() => {
        console.log("После добавления:", compareItems);
    }, 1000);
}

// Функция для тестирования сравнения - вызовите ее в консоли браузера
function debugCompare() {
    console.log("=== ДЕБАГ СРАВНЕНИЯ ===");
    console.log("Товары:", products);
    console.log("В сравнении:", compareItems);
    console.log("Кнопки сравнения на странице:", document.querySelectorAll('.compare-btn').length);
    
    // Проверим обработчики
    document.querySelectorAll('.compare-btn').forEach((btn, index) => {
        const productId = btn.getAttribute('data-product-id');
        console.log(`Кнопка ${index}: productId=${productId}, текст=${btn.textContent}`);
    });
    
    // Тест добавления товара
    if (products.length > 0) {
        console.log("Тест: добавляем товар ID 1 в сравнение");
        toggleCompare(1);
    }
}
// Добавьте эту функцию и вызовите ее в консоли на главной странице
function testCompareManually() {
    console.log("=== РУЧНОЙ ТЕСТ СРАВНЕНИЯ ===");
    
    // Очищаем сравнение
    compareItems = [];
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
    
    // Добавляем товар 1
    console.log("Добавляем товар 1...");
    toggleCompare(1);
    
    // Проверяем результат
    setTimeout(() => {
        const stored = JSON.parse(localStorage.getItem('compareItems'));
        console.log("В localStorage:", stored);
        console.log("В compareItems:", compareItems);
        console.log("Счетчик сравнения:", document.querySelector('.compare-counter')?.textContent);
    }, 500);
}
// ===== МОБИЛЬНОЕ МЕНЮ - ИСПРАВЛЕННАЯ ВЕРСИЯ =====
function initMobileMenu() {
    console.log("📱 Инициализация мобильного меню");
    
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.mobile-menu-close');
    
    if (!toggleBtn) {
        console.log("❌ Кнопка мобильного меню не найдена");
        return;
    }
    
    if (!mobileMenu) {
        console.log("❌ Мобильное меню не найдено");
        return;
    }
    
    console.log("✅ Мобильное меню найдено, настраиваем обработчики");
    
    function openMenu() {
        console.log("📱 Открытие меню");
        mobileMenu.classList.add('active');
        if (overlay) overlay.classList.add('active');
        toggleBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        console.log("📱 Закрытие меню");
        mobileMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        toggleBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    toggleBtn.addEventListener('click', openMenu);
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    // Закрытие при клике на ссылку
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Обновление счетчиков в мобильном меню
    function updateMobileCounters() {
        const cartCounter = document.querySelector('.mobile-nav .cart-counter');
        const compareCounter = document.querySelector('.mobile-nav .compare-counter');
        
        if (cartCounter) {
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            cartCounter.textContent = totalItems;
        }
        
        if (compareCounter) {
            compareCounter.textContent = compareItems.length;
        }
    }
    
    // Переопределяем функции обновления счетчиков
    const originalUpdateCartCounter = window.updateCartCounter || function() {};
    const originalUpdateCompareCounter = window.updateCompareCounter || function() {};
    
    window.updateCartCounter = function() {
        if (typeof originalUpdateCartCounter === 'function') {
            originalUpdateCartCounter();
        }
        updateMobileCounters();
    };
    
    window.updateCompareCounter = function() {
        if (typeof originalUpdateCompareCounter === 'function') {
            originalUpdateCompareCounter();
        }
        updateMobileCounters();
    };
    
    // Первоначальное обновление счетчиков
    setTimeout(updateMobileCounters, 100);
}

function init() {
    console.log("=== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===");
    
    // Проверка изображений
    if (typeof checkImages === 'function') {
        checkImages();
    }
    
    // Базовая инициализация
    updateCartCounter();
    updateCompareCounter();
    setupSearch();
    setupUniversalEventHandlers();
    setupRatingHandlers();
    
    // Инициализация мобильного меню
    setTimeout(() => {
        initMobileMenu();
    }, 100); // Небольшая задержка для гарантии загрузки DOM
    
    try {
        if (typeof chatBot !== 'undefined' && chatBot.init) {
            chatBot.init();
        }
    } catch (error) {
        console.log("Чат-бот не инициализирован на этой странице:", error.message);
    }
    
    // Определение текущей страницы
    const path = window.location.pathname;
    console.log("📄 Текущий путь:", path);
    
    // Инициализация страниц
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        console.log("📄 Загрузка главной страницы");
        window.compareItems = JSON.parse(localStorage.getItem('compareItems')) || [];
        displayProducts();
        startPromotionTimer();
        displayRecentlyViewed();
    } else if (path.includes('catalog.html')) {
        console.log("📄 Загрузка каталога");
        displayProducts();
        setupFilters();
        setupPriceFilter();
    } else if (path.includes('cart.html')) {
        console.log("📄 Загрузка корзины");
        displayCartItems();
    } else if (path.includes('order.html')) {
        console.log("📄 Загрузка оформления заказа");
        displayOrderSummary();
        setupOrderForm();
    } else if (path.includes('compare.html')) {
        console.log("📄 Загрузка сравнения");
        window.compareItems = JSON.parse(localStorage.getItem('compareItems')) || [];
        setupComparePage();
        updateCompareCounter();
    }
    
    // Добавление счетчиков в шапку
    addCartCounterToHeader();
    addCompareCounterToHeader();
    
    console.log("✅ Инициализация завершена");
}
// ===== ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ШИРИНЫ ЭКРАНА =====
// Добавьте этот код в конец файла script.js

// Функция для проверки и адаптации к ширине экрана
function checkScreenWidth() {
    const width = window.innerWidth;
    console.log(`📱 Ширина экрана: ${width}px`);
    
    // Получаем элементы мобильного меню
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    // Принудительно показываем/скрываем мобильное меню в зависимости от ширины
    if (width <= 992) {
        console.log("📱 Активирован мобильный режим");
        document.body.classList.add('mobile-view');
        
        // На планшетах и телефонах проверяем помещается ли контент
        if (width < 768) {
            // Для телефонов
            document.body.style.overflowX = 'hidden';
        } else {
            // Для планшетов
            document.body.style.overflowX = 'auto';
        }
    } else {
        console.log("💻 Активирован режим ПК");
        document.body.classList.remove('mobile-view');
        document.body.style.overflowX = '';
        
        // Закрываем мобильное меню если оно открыто (для ПК)
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (toggle) toggle.classList.remove('active');
    }
    
    // Дополнительная проверка для планшетов
    if (width >= 768 && width <= 992) {
        console.log("📟 Планшетный режим");
        // Принудительно применяем стили для планшетов
        document.querySelectorAll('.container').forEach(container => {
            container.style.padding = '0 15px';
        });
    }
}

// Функция для принудительного обновления layout при повороте экрана
function handleOrientationChange() {
    console.log("🔄 Изменение ориентации экрана");
    setTimeout(checkScreenWidth, 100); // Небольшая задержка для применения изменений
}

// Добавляем обработчики событий
window.addEventListener('load', function() {
    checkScreenWidth(); // Проверяем при загрузке
    
    // Проверяем через небольшие промежутки для надежности
    setTimeout(checkScreenWidth, 500);
    setTimeout(checkScreenWidth, 1000);
});

window.addEventListener('resize', function() {
    // Используем debounce для оптимизации
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(checkScreenWidth, 150);
});

// Следим за поворотом экрана на мобильных устройствах
window.addEventListener('orientationchange', handleOrientationChange);

// Дополнительная функция для принудительного применения стилей к определенным элементам
function fixTabletLayout() {
    const width = window.innerWidth;
    
    // Для планшетов (768px - 992px)
    if (width >= 768 && width <= 992) {
        // Исправляем отображение сетки товаров
        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            productsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            productsGrid.style.gap = '15px';
        }
        
        // Исправляем поиск
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.style.width = '100%';
            searchContainer.style.margin = '10px 0';
        }
        
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.style.width = '100%';
        }
        
        // Исправляем хедер для планшетов
        const header = document.querySelector('header .container');
        if (header) {
            header.style.flexWrap = 'wrap';
        }
    }
}

// Вызываем функцию фиксов вместе с checkScreenWidth
function enhancedCheckScreenWidth() {
    checkScreenWidth();
    fixTabletLayout();
}

// Заменяем вызовы на enhancedCheckScreenWidth
window.addEventListener('load', enhancedCheckScreenWidth);
window.addEventListener('resize', function() {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(enhancedCheckScreenWidth, 150);
});