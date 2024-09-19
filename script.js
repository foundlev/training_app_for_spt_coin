let selectedHistoryItem = null;
let keyboardShow = false;

function calculateBalance() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    let balance = 0.0;

    history.forEach(entry => {
        if (entry.action === 'Тренировка' || entry.action === 'Награда') {
            balance += parseFloat(entry.spt);
        } else if (entry.action === 'Вкусное') {
            balance -= parseFloat(entry.spt);
        }
    });

    return balance;
}

function highlightSpendButton() {
    const spendButton = document.getElementById('spend-button');
    spendButton.classList.add('highlighted');
}

function resetSpendButton() {
    const spendButton = document.getElementById('spend-button');
    spendButton.classList.remove('highlighted');
}

function highlightAddButton() {
    const addButton = document.getElementById('add-button');
    addButton.classList.add('highlighted');
}

function resetAddButton() {
    const addButton = document.getElementById('add-button');
    addButton.classList.remove('highlighted');
}

function resetAllButtons() {
    resetAddButton();
    resetSpendButton();
}

function checkHighlightButtons() {
    const caloriesInput = document.getElementById('calories-input');
    let value = caloriesInput.value.replace(/\D/g, '');

    if (value.length === 0) {
        resetSpendButton();
        resetAddButton();
    } else {
        const spendButton = document.getElementById('spend-button');
        if (!spendButton.classList.contains('highlighted')) {
            highlightAddButton();
        }
    }
}


function saveHistoryEntry(actionType, calories, spt, typeInt = 0) {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const now = new Date();
    const formattedDate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;

    const entry = {
        action: actionType, // "Тренировка" или "Вкусное"
        calories: calories,
        spt: spt,
        date: formattedDate,
        typeInt: typeInt
    };

    history.push(entry);
    localStorage.setItem('history', JSON.stringify(history));

    // Обновляем отображение истории на экране
    renderHistory();
}


function renderHistory() {
    const historySection = document.querySelector('.history-section');
    historySection.innerHTML = '<h3>История баланса</h3>'; // Сбрасываем историю для повторной отрисовки

    const history = JSON.parse(localStorage.getItem('history')) || [];

    if (history.length === 0) {
        // Если история пуста, выводим сообщение
        const emptyMessage = document.createElement('p');
        emptyMessage.classList.add('empty-history-message');
        emptyMessage.textContent = 'Тут пока ничего нет';
        historySection.appendChild(emptyMessage);
        return;
    }

    // Перебираем историю в обратном порядке, чтобы последние действия были сверху
    history.reverse().forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');

        let svgPath = null;
        let comment = undefined;
        if ((entry.action) === 'Тренировка') {
            svgPath = 'workout';
        } else if ((entry.action) === 'Вкусное') {
            svgPath = 'tasty';
        } else if ((entry.action) === 'Награда') {
            svgPath = 'reward';
            const commentReward = {
                1: 'Малая',
                2: 'Средняя',
                3: 'Большая',
                4: 'Супер'
            }
            comment = commentReward[entry.typeInt];
        }

        let actionType = 'positive';
        if ((entry.action) === 'Вкусное') {
            actionType = 'negative';
        } else if ((entry.action) === 'Награда') {
            actionType = 'reward';
        }

        historyItem.innerHTML = `
            <div class="history-left">
                <img src="assets/${svgPath}.svg" alt="${entry.action}">
                <div>
                    <div class="history-text">${entry.action}</div>
                    <div class="history-text-small">${comment === undefined ? (entry.calories > 0 ? entry.calories : '-') + ' ккал' : comment}</div>
                </div>
            </div>
            <div class="history-status-wrapper">
                <div class="history-status">SPT ${parseFloat(entry.spt).toFixed(2)}</div>
                <div class="history-label ${actionType}">${(actionType === 'positive' || actionType === 'reward') ? 'Накопление' : 'Списание'}</div>
                <div class="history-date">${entry.date}</div>
            </div>
        `;

        historySection.appendChild(historyItem);
    });
}


// Обновление отображаемого баланса
function updateBalanceDisplay() {
    const balanceElement = document.querySelector('.balance-amount');
    const balance = calculateBalance();

    balanceElement.textContent = `SPT ${parseFloat(balance).toFixed(2)}`;
    if (balance > 0) {
        balanceElement.style.color = '#66BB6A'; // Зеленый цвет для положительного баланса
    } else if (balance < 0) {
        balanceElement.style.color = '#F06260'; // Красный цвет для отрицательного баланса
    } else {
        balanceElement.style.color = ''; // Черный цвет для нулевого баланса
    }
}



// Функция для скрытия алерта
function hideAlert() {
    const alertWindow = document.getElementById('alert-window');

    alertWindow.classList.remove('show');
    alertWindow.classList.add('hidden');
}

document.addEventListener("DOMContentLoaded", function() {
    const alertWindow = document.getElementById('alert-window');
    const alertMessage = document.getElementById('alert-message');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    // Функция для показа алерта с информацией
    function showAlert(historyItem) {
        selectedHistoryItem = historyItem;
        const action = historyItem.querySelector('.history-text').textContent;
        const calories = historyItem.querySelector('.history-text-small').textContent;
        const spt = historyItem.querySelector('.history-status').textContent;
        alertMessage.innerHTML = `Удалить запись<br>${action} (${calories}, ${spt})?`;
        alertWindow.classList.remove('hidden');
        alertWindow.classList.add('show');
    }

    // Подтверждение удаления элемента истории
    confirmDeleteButton.addEventListener('click', function() {
        if (selectedHistoryItem) {
            const history = JSON.parse(localStorage.getItem('history')) || [];
            const index = Array.from(document.querySelectorAll('.history-item')).indexOf(selectedHistoryItem);
            if (index > -1) {
                history.splice(history.length - 1 - index, 1); // Удаляем элемент из истории
                localStorage.setItem('history', JSON.stringify(history));
                selectedHistoryItem.remove(); // Удаляем элемент из DOM
                hideAlert(); // Скрываем алерт
                updateBalanceDisplay();
            }
        }
    });

    // Отмена удаления
    cancelDeleteButton.addEventListener('click', hideAlert);

    // Добавляем обработчики на элементы истории
    document.querySelector('.history-section').addEventListener('click', function(event) {
        const historyItem = event.target.closest('.history-item');
        if (historyItem) {
            showAlert(historyItem); // Показываем алерт с информацией
        }
    });
});


function showNotification(message, spend) {
    const balanceSection = document.querySelector('.balance-section');
    const notification = document.createElement('div');  // Создаем элемент уведомления

    notification.classList.add('notification', 'hidden');
    balanceSection.appendChild(notification);  // Добавляем уведомление в раздел баланса

    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('show');

    if (spend) {
        notification.classList.add('notification-spend');
    }

    // Убираем уведомление через 3 секунды
    setTimeout(function() {
        notification.classList.remove('show');
        setTimeout(function() {
            notification.classList.add('hidden');
            notification.classList.remove('notification-spend');
        }, 500); // Даем время для исчезновения анимации
    }, 3000);
}

document.addEventListener("DOMContentLoaded", function() {
    const caloriesSection = document.querySelector('.calories-section');
    const hideKeyboardButton = document.getElementById('hide-keyboard-button');

    function toggleKeyboard() {
        const historySection = document.getElementById('history-section').parentElement;
        const keyboardSection = document.getElementById('keyboard-section');

        if (keyboardShow) {
            historySection.style.display = '';  // Удаляем инлайновый стиль
            historySection.classList.add('hidden');  // Скрываем историю
            keyboardSection.classList.remove('hidden');  // Показываем клавиатуру
        } else {
            keyboardSection.style.display = '';  // Удаляем инлайновый стиль с клавиатуры
            historySection.classList.remove('hidden');  // Показываем историю
            keyboardSection.classList.add('hidden');  // Скрываем клавиатуру
        }
    }

    function showKeyboard() {
        hideNotification();
        keyboardShow = true;
        toggleKeyboard();
    }

    function hideKeyboard() {
        keyboardShow = false;
        toggleKeyboard();
    }

    caloriesSection.addEventListener('click', function() {
        showKeyboard(); // Отображаем кастомную клавиатуру
    });

    hideKeyboardButton.addEventListener('click', function() {
        hideKeyboard(); // Скрываем кастомную клавиатуру по нажатию на кнопку "Назад"
    });

    const caloriesInput = document.getElementById('calories-input');
    const caloriesResetButton = document.getElementById('reset');
    const outputLabel = document.getElementById('show-output');

    const keys = document.querySelectorAll('.key[data-digit]');
    const deleteKey = document.getElementById('delete-key');

    const exchangeRateToSPT = 0.85182;
    const balanceSection = document.querySelector('.balance-section');
    const notification = document.createElement('div');  // Создаем элемент уведомления

    notification.classList.add('notification', 'hidden');
    balanceSection.appendChild(notification);  // Добавляем уведомление в раздел баланса

    updateBalanceDisplay();
    renderHistory();

    function hideNotification() {
        notification.classList.remove('show');
        notification.classList.remove('notification-spend');
        notification.classList.add('hidden');
    }

    function handleResult(result, defaultValue = '-') {
        // Проверяем на null, undefined, или любые другие "ложные" значения
        if (result == null || typeof result === 'undefined' || result === '' || isNaN(result)) {
            return defaultValue; // Возвращаем пустую строку в случае ошибки
        } else {
            return result; // Возвращаем Result, если всё нормально
        }
    }

    function convertToSPT(ccal, validate = false, multiply = 1) {
        const result = (parseFloat(ccal) * exchangeRateToSPT * multiply).toFixed(2);
        if (validate) {
            return handleResult(result);
        }
        return result;
    }

    function convertToSpendSPT(ccal, validate = false) {
        return convertToSPT(ccal, validate);
    }

    function convertToEarnSPT(ccal, nowBalance, validate = false) {
        multiply = null;
        if (nowBalance <= -1000) {
            multiply = 2.5;
        } else if (nowBalance <= 0) {
            multiply = 1.7;
        } else {
            multiply = 1.2;
        }
        return convertToSPT(ccal, validate, multiply);
    }

    function convertToCcal(spt, validate = false) {
        const result =  (parseFloat(spt) / exchangeRateToSPT).toFixed(2);
        if (validate) {
            return handleResult(result);
        }
        return result;
    }

    function inputDigit(digit) {
        let value = caloriesInput.value.replace(/\D/g, ''); // удаляем все нецифровые символы
        value += digit.toString();
        const previousLength = value.length;

        // Ограничиваем ввод чисел от 1 до 999
        if (value > 999) {
            value = value.slice(0, 3);
        } else if (value <= 0) {
            value = 1;
        }

        // Если поле пустое, оставляем его пустым, чтобы кнопка удаления работала корректно
        if (value.length === 0) {
            caloriesInput.value = ' ';
        } else {
            caloriesInput.value = `${value} ккал`; // добавляем маску
        }
        const balance = calculateBalance();
        outputLabel.textContent = `SPT ↓ ${convertToSpendSPT(value, true)} ↑ ${convertToEarnSPT(value, balance, true)}`;
        checkHighlightButtons();
    }

    function deleteDigit() {
        let value = caloriesInput.value.replace(/\D/g, ''); // удаляем все нецифровые символы
        if (value.length > 0) {
            value = value.slice(0, -1); // удаляем последнюю цифру
            caloriesInput.value = value.length === 0 ? ' ' : `${value} ккал`;
            const balance = calculateBalance();
            outputLabel.textContent = `SPT ↓ ${convertToSpendSPT(value, true)} ↑ ${convertToEarnSPT(value, balance, true)}`;
        } else {
            outputLabel.textContent = `SPT ↓ - ↑ -`;
        }
        checkHighlightButtons();
    }

    caloriesResetButton.addEventListener('click', function() {
        caloriesInput.value = ' ';
        outputLabel.textContent = `SPT ↓ - ↑ -`;
        checkHighlightButtons();
    });

    // Обработка добавления калорий к балансу
    document.querySelector('.add-btn').addEventListener('click', function() {
        let calories = parseFloat(caloriesInput.value.replace(/\D/g, ''));
        if (!isNaN(calories)) {
            const balance = calculateBalance();
            let spt = convertToEarnSPT(calories, balance); // convertToSPT(calories);
            caloriesInput.value = ' ';
            outputLabel.textContent = `SPT ↓ - ↑ -`;
            showNotification(`+ SPT ${spt}`, false);

            // Сохраняем запись в истории
            saveHistoryEntry('Тренировка', calories, spt);
            updateBalanceDisplay();
            hideKeyboard();
            resetAllButtons();
        }
    });

    // Обработка траты калорий (вычитание из баланса)
    document.querySelector('.spend-btn').addEventListener('click', function() {
        let calories = parseFloat(caloriesInput.value.replace(/\D/g, ''));
        if (!isNaN(calories)) {
            let spt = convertToSpendSPT(calories); // convertToSPT(calories);
            caloriesInput.value = ' ';
            outputLabel.textContent = `SPT ↓ - ↑ -`;
            showNotification(`- SPT ${spt}`, true);

            // Сохраняем запись в истории
            saveHistoryEntry('Вкусное', calories, spt);
            updateBalanceDisplay();
            hideKeyboard();
            resetAllButtons();
        }
    });

    // Добавляем обработчики событий на все кнопки с цифрами
    keys.forEach(key => {
        key.addEventListener('click', function() {
            const digit = key.getAttribute('data-digit');
            inputDigit(digit); // Вызываем inputDigit с соответствующей цифрой
        });
    });

    // Обработчик для кнопки удаления
    deleteKey.addEventListener('click', function() {
        deleteDigit(); // Вызываем deleteDigit при нажатии на кнопку удаления
    });

    function getURLParameter(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    // Получаем значение параметра ccal из URL
    const ccalValue = getURLParameter('ccal');
    const regex = /^[1-9]\d*$/;

    // Если параметр ccal существует и является числом
    if (ccalValue && !isNaN(ccalValue) && regex.test(ccalValue)) {
        inputDigit(ccalValue);
        highlightSpendButton();
        resetAddButton();
    }
});

window.addEventListener('resize', function() {
    if (keyboardShow) {
        return;
    }

    const container = document.querySelector('.container');
    const historySection = document.querySelector('.history-section-wrapper.scrollable');
    const containerBottom = container.getBoundingClientRect().bottom;
    const availableHeight = window.innerHeight - containerBottom;

    if (availableHeight < 120) {  // Минимальная высота для отображения истории
        historySection.style.display = 'none';
    } else {
        historySection.style.display = 'block';
        historySection.style.height = `${availableHeight}px`;
    }
});

document.addEventListener("DOMContentLoaded", function() {
    rewardInfo = document.getElementById('reward-info');

    // Показ модального окна
    document.querySelector('.reward-btn').addEventListener('click', function() {
        hideAlert();
        const rewardModal = document.getElementById('reward-modal');
        rewardModal.classList.remove('hidden');
        rewardModal.classList.add('show');
    });

    // Закрытие модального окна при нажатии на кнопку "Отмена"
    document.querySelector('.close-modal').addEventListener('click', function() {
        const rewardModal = document.getElementById('reward-modal');
        rewardModal.classList.remove('show');
        rewardModal.classList.add('hidden');
    });

    // Переменные для хранения текущей награды
    let selectedReward = 30; // По умолчанию малая награда (30)

    // Обработка изменения значения слайдера
    document.getElementById('rewardRange').addEventListener('input', function() {
        const sliderValue = this.value;

        // Обновляем выбранную награду в зависимости от значения слайдера
        if (sliderValue == 1) {
            selectedReward = 30;
            document.getElementById('small-reward-label').style.fontWeight = 'bold';
            document.getElementById('medium-reward-label').style.fontWeight = 'normal';
            document.getElementById('large-reward-label').style.fontWeight = 'normal';
            document.getElementById('super-reward-label').style.fontWeight = 'normal';

            rewardInfo.textContent = `Вознаграждение: SPT ${selectedReward}`;
        } else if (sliderValue == 2) {
            selectedReward = 60;
            document.getElementById('small-reward-label').style.fontWeight = 'normal';
            document.getElementById('medium-reward-label').style.fontWeight = 'bold';
            document.getElementById('large-reward-label').style.fontWeight = 'normal';
            document.getElementById('super-reward-label').style.fontWeight = 'normal';

            rewardInfo.textContent = `Вознаграждение: SPT ${selectedReward}`;
        } else if (sliderValue == 3) {
            selectedReward = 120;
            document.getElementById('small-reward-label').style.fontWeight = 'normal';
            document.getElementById('medium-reward-label').style.fontWeight = 'normal';
            document.getElementById('large-reward-label').style.fontWeight = 'bold';
            document.getElementById('super-reward-label').style.fontWeight = 'normal';

            rewardInfo.textContent = `Вознаграждение: SPT ${selectedReward}`;
        } else if (sliderValue == 4) {
            selectedReward = 200;
            document.getElementById('small-reward-label').style.fontWeight = 'normal';
            document.getElementById('medium-reward-label').style.fontWeight = 'normal';
            document.getElementById('large-reward-label').style.fontWeight = 'normal';
            document.getElementById('super-reward-label').style.fontWeight = 'bold';

            rewardInfo.textContent = `Вознаграждение: SPT ${selectedReward}`;
        }
    });

    // Применение награды
    document.querySelector('.apply-reward').addEventListener('click', function() {
        const sliderValue = document.getElementById('rewardRange').value;
        applyReward(selectedReward, sliderValue);

        // Закрыть модальное окно
        const rewardModal = document.getElementById('reward-modal');
        rewardModal.classList.remove('show');
        rewardModal.classList.add('hidden');
    });

    // Логика применения награды
    function applyReward(amount, typeInt) {
        showNotification(`+ SPT ${parseFloat(amount).toFixed(2)}`, false);
        saveHistoryEntry('Награда', 0, parseFloat(amount), typeInt);
        updateBalanceDisplay();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // Ваш существующий код...

    // Элемент уведомления для обновления
    const updateNotification = document.getElementById('update-notification');

    // Функция для показа уведомления
    function showUpdateNotification(message, isError = false) {
        updateNotification.textContent = message;
        updateNotification.classList.remove('hidden');
        updateNotification.classList.add('show');

        if (isError) {
            updateNotification.classList.add('error');
        } else {
            updateNotification.classList.remove('error');
        }

        // Скрываем уведомление через 3 секунды
        setTimeout(function() {
            updateNotification.classList.remove('show');
            setTimeout(function() {
                updateNotification.classList.add('hidden');
                updateNotification.classList.remove('error');
            }, 300); // Время для анимации исчезновения
        }, 3000);
    }

    // Обработчик для кнопки "Обновить"
    const refreshButton = document.getElementById('refresh-button');

    refreshButton.addEventListener('click', function() {
        if (navigator.onLine) {
            // Если есть интернет
            showUpdateNotification('Обновляю...');

            // Обновляем страницу после короткой задержки, чтобы показать уведомление
            setTimeout(function() {
                location.reload(true);
            }, 1000); // Настройте задержку по необходимости
        } else {
            // Если нет интернета
            showUpdateNotification('Нет сети', true);
        }
    });

    // Ваш остальной код...
});

// Инициализация при загрузке страницы
window.dispatchEvent(new Event('resize'));