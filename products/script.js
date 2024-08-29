let currentProduct = null;

// Определяем функции openModal, closeModal и updateSPT вне DOMContentLoaded, чтобы они были доступны глобально
function openModal() {
    const modal = document.getElementById('addProductModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('addProductModal');
    modal.style.display = 'none';
    const productNameInput = document.getElementById('productName');
    const productCcalInput = document.getElementById('productCcal');
    const productSPTDisplay = document.getElementById('productSPT');

    productNameInput.value = '';
    productCcalInput.value = '';
    productSPTDisplay.style.backgroundColor = '#f5f5f5';
    productSPTDisplay.style.color = '#A0A0A0';
    productSPTDisplay.textContent = 'SPT 0.00';
    toggleSubmitButton();
}

function updateSPT() {
    const productCcalInput = document.getElementById('productCcal');
    const productSPTDisplay = document.getElementById('productSPT');
    let ccal = productCcalInput.value;

    // Удаляем минус, если он присутствует
    if (ccal.includes('-')) {
        ccal = ccal.replace('-', '');
    }

    // Приводим к числу и ограничиваем по максимуму
    ccal = parseInt(ccal, 10);

    // Позволяем пользователю стереть 1, чтобы можно было ввести другое число
    if (isNaN(ccal) || ccal === 0) {
        productCcalInput.value = '';
        productSPTDisplay.textContent = 'SPT 0.00';
        productSPTDisplay.style.backgroundColor = '#f5f5f5';
        productSPTDisplay.style.color = '#A0A0A0';
        toggleSubmitButton();
        return;
    }

    if (ccal > 999) {
        ccal = 999;
    } else if (ccal < 1) {
        ccal = 1;
    }

    productCcalInput.value = ccal;
    let spt = convertToSPT(ccal);

    // Если SPT получилось отрицательным, заменяем его на 0.0
    if (parseFloat(spt) < 0) {
        spt = '0.00';
        productSPTDisplay.style.backgroundColor = '#f5f5f5';
        productSPTDisplay.style.color = '#A0A0A0';
    }

    productSPTDisplay.textContent = `SPT ${spt}`;

    // Определяем цвет SPT на основе сравнения с балансом
    const balance = calculateBalance();

    if (parseFloat(spt) >= balance && parseFloat(spt) > 0) {
        productSPTDisplay.style.backgroundColor = '#FFDEE2'
        productSPTDisplay.style.color = '#FD5B71';
    } else if (parseFloat(spt) === 0) {
        productSPTDisplay.style.backgroundColor = '#f5f5f5';
        productSPTDisplay.style.color = '#A0A0A0';
    } else {
        productSPTDisplay.style.backgroundColor = '#F0FFF0'
        productSPTDisplay.style.color = '#11A06C';
    }

    toggleSubmitButton();
}

function validateName() {
    const productNameInput = document.getElementById('productName');
    const pattern = /^(?! )[А-Яа-яA-Za-z0-9 ]{1,9}(?<! )$/;
    return pattern.test(productNameInput.value);
}

function validateCcal() {
    const productCcalInput = document.getElementById('productCcal');
    const ccal = parseInt(productCcalInput.value, 10);
    return productCcalInput.value && ccal >= 1 && ccal <= 999;
}

function toggleSubmitButton() {
    const submitButton = document.querySelector('.submit-button');
    if (validateName() && validateCcal()) {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = '#7C7CFF';
        submitButton.style.color = '#ffffff';
    } else {
        submitButton.disabled = true;
        submitButton.style.backgroundColor = '#cccccc';
        submitButton.style.color = '#666666';
    }
}


function renderProducts(products) {
    const productsContainer = document.querySelector('.products-grid');

    const productsSorted = products.sort((a, b) => a.ccal - b.ccal);
    const balance = calculateBalance();

    productsContainer.innerHTML = ''; // Очищаем контейнер перед рендерингом
    productsSorted.forEach((product) => {
        const priceSPT = convertToSPT(product.ccal);

        let productCardClass = null;
        let priceSPTClass = null;

        if (balance >= priceSPT) {
            productCardClass = 'product-card tab-debit';
            priceSPTClass = 'product-spt spt-debit';
        } else {
            productCardClass = 'product-card tab-credit';
            priceSPTClass = 'product-spt spt-credit';
        }

        // Создаем карточку продукта как элемент DOM
        const productCard = document.createElement('div');
        productCard.className = productCardClass;
        productCard.innerHTML = `
            <div class="product-content">
                <h2>${product.caption}</h2>
                <div class="product-info">
                    <span class="${priceSPTClass}">SPT ${priceSPT}</span>
                    <span class="product-ccal">${product.ccal} ккал</span>
                </div>
            </div>
        `;

        // Добавляем обработчик клика на карточку продукта
        productCard.addEventListener('click', () => openProductModal(product));

        // Вставляем карточку в контейнер
        productsContainer.appendChild(productCard);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.querySelector('.products-grid');
    const addProductForm = document.getElementById('addProductForm');
    const productNameInput = document.getElementById('productName');
    const productCcalInput = document.getElementById('productCcal');
    let products = JSON.parse(localStorage.getItem('products')) || [];


    function addProduct(event) {
        event.preventDefault();
        const newProduct = {
            caption: productNameInput.value,
            ccal: parseFloat(productCcalInput.value),
        };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts(products);
        closeModal();
    }

    addProductForm.addEventListener('submit', addProduct);
    productNameInput.addEventListener('input', updateSPT);
    productCcalInput.addEventListener('input', updateSPT);

    // Закрытие модального окна при клике вне его
    window.onclick = function(event) {
        const modal = document.getElementById('addProductModal');
        if (event.target === modal) {
            closeModal();
        }
    }

    renderProducts(products);
    toggleSubmitButton(); // Проверка кнопки при загрузке
});

function calculateBalance() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    let balance = 0.0;

    history.forEach(entry => {
        if (entry.action === 'Тренировка') {
            balance += parseFloat(entry.spt);
        } else if (entry.action === 'Вкусное') {
            balance -= parseFloat(entry.spt);
        }
    });
    return balance;
}

function handleResult(result, defaultValue = '-') {
    if (result == null || typeof result === 'undefined' || result === '' || isNaN(result)) {
        return defaultValue;
    } else {
        return result;
    }
}

function convertToSPT(ccal, validate = false) {
    const exchangeRateToSPT = 0.85182;
    const result = (parseFloat(ccal) * exchangeRateToSPT).toFixed(2);
    if (validate) {
        return handleResult(result);
    }
    return result;
}

// Функция для открытия модального окна с информацией о продукте
function openProductModal(product) {
    currentProduct = product;  // Сохраняем текущий продукт
    const modal = document.getElementById('productInfoModal');
    const modalProductCaption = document.getElementById('modalProductCaption');
    const modalProductSPT = document.getElementById('modalProductSPT');
    const currentBalanceElement = document.getElementById('currentBalance');
    const balance = calculateBalance();

    modalProductCaption.textContent = product.caption;

    let spt = convertToSPT(product.ccal);

    // Если SPT получилось отрицательным, заменяем его на 0.0
    if (parseFloat(spt) < 0) {
        spt = '0.00';
    }

    modalProductSPT.textContent = `SPT ${spt}`;

    // Определяем цвет SPT на основе сравнения с балансом
    if (parseFloat(spt) >= balance && parseFloat(spt) > 0) {
        modalProductSPT.style.color = '#FD5B71'; // Красный цвет
    } else if (parseFloat(spt) === 0) {
        modalProductSPT.style.color = '#A0A0A0'; // Серый цвет для 0.0
    } else {
        modalProductSPT.style.color = '#11A06C'; // Зеленый цвет
    }

    currentBalanceElement.textContent = `SPT ${balance.toFixed(2)}`;
    modal.style.display = 'block';
}

// Функция для закрытия модального окна продукта
function closeProductModal() {
    const modal = document.getElementById('productInfoModal');
    modal.style.display = 'none';
}

function back() {
    window.location.href = `../index.html`;
}

function spendSPT() {
    if (currentProduct && currentProduct.ccal) {
        const ccal = currentProduct.ccal;
        const url = `../index.html?ccal=${ccal}`;
        window.location.href = url;
    } else {
        console.error('Ошибка: currentProduct не определен или не содержит ccal.');
    }
}

function deleteProduct() {
    if (currentProduct) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        // Создаем сообщение с краткой информацией о продукте
        const confirmationMessage = `Вы точно хотите удалить этот продукт?\nНазвание: ${currentProduct.caption}\nКалории: ${currentProduct.ccal} ккал`;

        // Спрашиваем подтверждение с дополнительной информацией о продукте
        if (confirm(confirmationMessage)) {
            // Удаляем продукт из массива, если подтверждение получено
            products = products.filter(product =>
                !(product.caption === currentProduct.caption && product.ccal === currentProduct.ccal)
            );
            localStorage.setItem('products', JSON.stringify(products));  // Обновляем localStorage
            renderProducts(products);  // Перерисовываем продукты на странице
            closeProductModal();  // Закрываем модальное окно
        }
    }
}
