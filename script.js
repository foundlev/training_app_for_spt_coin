document.addEventListener("DOMContentLoaded", function() {
    const caloriesInput = document.getElementById('calories-input');
    const caloriesResetButton = document.getElementById('reset');
    const outputLabel = document.getElementById('show-output');
    const balanceElement = document.querySelector('.balance-amount');

    const exchangeRateToSPT = 0.85182;
    const balanceSection = document.querySelector('.balance-section');
    const notification = document.createElement('div');  // Создаем элемент уведомления

    notification.classList.add('notification', 'hidden');
    balanceSection.appendChild(notification);  // Добавляем уведомление в раздел баланса

    // Инициализация баланса из Local Storage
    let balance = parseFloat(localStorage.getItem('balance')) || 0.0;
    updateBalanceDisplay(balance);
    renderHistory();

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

    caloriesInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); // удаляем все нецифровые символы
        const previousLength = value.length;

        // Ограничиваем ввод чисел от 1 до 999
        if (value > 999) {
            value = value.slice(0, 3);
        } else if (value <= 0) {
            value = 1;
        }

        // Если поле пустое, оставляем его пустым, чтобы кнопка удаления работала корректно
        if (value.length === 0) {
            e.target.value = '';
        } else {
            e.target.value = `${value} ккал`; // добавляем маску
        }
        outputLabel.textContent = `SPT ${convertToSPT(value, true)}`;

        // Перемещаем курсор на правильную позицию
        if (previousLength > value.length) {
            e.target.setSelectionRange(value.length, value.length); // курсор ставится сразу после последней цифры
        }
    });

    caloriesInput.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace') {
            let value = e.target.value.replace(/\D/g, ''); // удаляем все нецифровые символы
            if (value.length > 0) {
                value = value.slice(0, -1); // удаляем последнюю цифру
                e.target.value = value.length === 0 ? '' : `${value} ккал`;
                e.preventDefault(); // предотвращаем стандартное поведение backspace
                outputLabel.textContent = `SPT ${convertToSPT(value, true)}`;
            }
        }
    });

    caloriesResetButton.addEventListener('click', function() {
        caloriesInput.value = '';
        outputLabel.textContent = `SPT -`;
    });

    // Обновление отображаемого баланса
    function updateBalanceDisplay(balance) {
        balanceElement.textContent = `SPT ${parseFloat(balance).toFixed(2)}`;
        if (balance < 0) {
            balanceElement.style.color = 'red';
        } else {
            balanceElement.style.color = '';
        }
    }

    // Обработка добавления калорий к балансу
    document.querySelector('.add-btn').addEventListener('click', function() {
        let calories = parseFloat(caloriesInput.value.replace(/\D/g, ''));
        if (!isNaN(calories)) {
            let spt = convertToSPT(calories);
            balance = parseFloat(balance) + parseFloat(spt);
            localStorage.setItem('balance', balance);
            caloriesInput.value = '';
            outputLabel.textContent = `SPT -`;
            updateBalanceDisplay(balance);
            showNotification(`+ SPT ${spt}`, false);

            // Сохраняем запись в истории
            saveHistoryEntry('Тренировка', calories, spt);
        }
    });

    // Обработка траты калорий (вычитание из баланса)
    document.querySelector('.spend-btn').addEventListener('click', function() {
        let calories = parseFloat(caloriesInput.value.replace(/\D/g, ''));
        if (!isNaN(calories)) {
            let spt = convertToSPT(calories);
            balance = parseFloat(balance) - parseFloat(spt);
            localStorage.setItem('balance', balance);
            caloriesInput.value = '';
            outputLabel.textContent = `SPT -`;
            updateBalanceDisplay(balance);
            showNotification(`- SPT ${spt}`, true);

            // Сохраняем запись в истории
            saveHistoryEntry('Вкусное', calories, spt);
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

});