let selectedHistoryItem = null;
let keyboardShow = false;

// Обновление отображаемого баланса
function updateBalanceDisplay() {
    const balanceElement = document.querySelector('.balance-amount');
    const history = JSON.parse(localStorage.getItem('history')) || [];
    let balance = 0.0;

    history.forEach(entry => {
        if (entry.action === 'Тренировка') {
            balance += parseFloat(entry.spt);
        } else if (entry.action === 'Вкусное') {
            balance -= parseFloat(entry.spt);
        }
    });

    balanceElement.textContent = `SPT ${parseFloat(balance).toFixed(2)}`;
    if (balance > 0) {
        balanceElement.style.color = '#66BB6A'; // Зеленый цвет для положительного баланса
    } else if (balance < 0) {
        balanceElement.style.color = '#F06260'; // Красный цвет для отрицательного баланса
    } else {
        balanceElement.style.color = ''; // Черный цвет для нулевого баланса
    }
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
        alertMessage.textContent = `Удалить запись: ${action} (${calories}, ${spt})?`;
        alertWindow.classList.remove('hidden');
        alertWindow.classList.add('show');
    }

    // Функция для скрытия алерта
    function hideAlert() {
        alertWindow.classList.remove('show');
        alertWindow.classList.add('hidden');
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
    const inputField = document.getElementById('calories-input');

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

    function showNotification(message, spend) {
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

    function handleResult(result, defaultValue = '-') {
        // Проверяем на null, undefined, или любые другие "ложные" значения
        if (result == null || typeof result === 'undefined' || result === '' || isNaN(result)) {
            return defaultValue; // Возвращаем пустую строку в случае ошибки
        } else {
            return result; // Возвращаем Result, если всё нормально
        }
    }

    function convertToSPT(ccal, validate = false) {
        const result = (parseFloat(ccal) * exchangeRateToSPT).toFixed(2);
        if (validate) {
            return handleResult(result);
        }
        return result;
    }

    function convertToCcal(spt, validate = false) {
        const result =  (parseFloat(spt) / exchangeRateToSPT).toFixed(2);
        if (validate) {
            return handleResult(result);
        }
        return result;
    }

    function inputDigit(digit) {
        let value = inputField.value.replace(/\D/g, ''); // удаляем все нецифровые символы
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
            inputField.value = '';
        } else {
            inputField.value = `${value} ккал`; // добавляем маску
        }
        outputLabel.textContent = `SPT ${convertToSPT(value, true)}`;
    }

    function deleteDigit() {
        let value = inputField.value.replace(/\D/g, ''); // удаляем все нецифровые символы
        if (value.length > 0) {
            value = value.slice(0, -1); // удаляем последнюю цифру
            inputField.value = value.length === 0 ? '' : `${value} ккал`;
            outputLabel.textContent = `SPT ${convertToSPT(value, true)}`;
        } else {
            outputLabel.textContent = `SPT -`;
        }
    }

    caloriesResetButton.addEventListener('click', function() {
        caloriesInput.value = '';
        outputLabel.textContent = `SPT -`;
    });

    // Обработка добавления калорий к балансу
    document.querySelector('.add-btn').addEventListener('click', function() {
        let calories = parseFloat(caloriesInput.value.replace(/\D/g, ''));
        if (!isNaN(calories)) {
            let spt = convertToSPT(calories);
            caloriesInput.value = '';
            outputLabel.textContent = `SPT -`;
            showNotification(`+ SPT ${spt}`, false);

            // Сохраняем запись в истории
            saveHistoryEntry('Тренировка', calories, spt);
            updateBalanceDisplay();
            hideKeyboard();
        }
    });

    // Обработка траты калорий (вычитание из баланса)
    document.querySelector('.spend-btn').addEventListener('click', function() {
        let calories = parseFloat(caloriesInput.value.replace(/\D/g, ''));
        if (!isNaN(calories)) {
            let spt = convertToSPT(calories);
            caloriesInput.value = '';
            outputLabel.textContent = `SPT -`;
            showNotification(`- SPT ${spt}`, true);

            // Сохраняем запись в истории
            saveHistoryEntry('Вкусное', calories, spt);
            updateBalanceDisplay();
            hideKeyboard();
        }
    });

    function saveHistoryEntry(actionType, calories, spt) {
        const history = JSON.parse(localStorage.getItem('history')) || [];
        const now = new Date();
        const formattedDate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;

        const entry = {
            action: actionType, // "Тренировка" или "Вкусное"
            calories: calories,
            spt: spt,
            date: formattedDate
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

            historyItem.innerHTML = `
                <div class="history-left">
                    <img src="assets/${entry.action === 'Тренировка' ? 'workout' : 'tasty'}.svg" alt="${entry.action}">
                    <div>
                        <div class="history-text">${entry.action}</div>
                        <div class="history-text-small">${entry.calories} ккал</div>
                    </div>
                </div>
                <div class="history-status-wrapper">
                    <div class="history-status">SPT ${parseFloat(entry.spt).toFixed(2)}</div>
                    <div class="history-label ${entry.action === 'Тренировка' ? 'positive' : 'negative'}">${entry.action === 'Тренировка' ? 'Накопление' : 'Списание'}</div>
                    <div class="history-date">${entry.date}</div>
                </div>
            `;

            historySection.appendChild(historyItem);
        });
    }

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

// Инициализация при загрузке страницы
window.dispatchEvent(new Event('resize'));