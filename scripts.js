document.addEventListener('DOMContentLoaded', function() {
    // Инициализация интерфейса
    initUI();
    
    // Загрузка данных пользователей
    loadUserData();
    
    // Инициализация графиков
    initCharts();
    
    // Обработчики событий
    setupEventListeners();
});

// Переменные для хранения данных
let allUsers = [];
let currentPage = 1;
let itemsPerPage = 10;
let filteredUsers = [];

/**
 * Инициализация интерфейса
 */
function initUI() {
    // Боковое меню
    const sidebarToggle = document.getElementById('sidebarToggle');
    const showSidebar = document.getElementById('showSidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.remove('open');
        });
    }
    
    if (showSidebar) {
        showSidebar.addEventListener('click', function() {
            sidebar.classList.add('open');
        });
    }
    
    // Навигация
    const menuItems = document.querySelectorAll('.menu-item a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Удаление активного класса у всех пунктов меню
            menuItems.forEach(menuItem => {
                menuItem.parentElement.classList.remove('active');
            });
            
            // Добавление активного класса текущему пункту
            this.parentElement.classList.add('active');
            
            // Получение ID страницы
            const pageId = this.getAttribute('data-page');
            
            // Показать соответствующую страницу
            showPage(pageId);
        });
    });
    
    // Обработчик для ссылок внутри страниц
    const pageLinks = document.querySelectorAll('[data-page]');
    
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.tagName.toLowerCase() === 'a' && !this.closest('.menu-item')) {
                e.preventDefault();
                const pageId = this.getAttribute('data-page');
                
                // Обновление активного пункта меню
                menuItems.forEach(menuItem => {
                    const menuPageId = menuItem.getAttribute('data-page');
                    if (menuPageId === pageId) {
                        menuItems.forEach(item => {
                            item.parentElement.classList.remove('active');
                        });
                        menuItem.parentElement.classList.add('active');
                    }
                });
                
                // Показать соответствующую страницу
                showPage(pageId);
            }
        });
    });
    
    // Инициализация модальных окон Bootstrap
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        new bootstrap.Modal(modal);
    });
}

/**
 * Переключение между страницами
 */
function showPage(pageId) {
    // Скрыть все страницы
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Показать выбранную страницу
    const selectedPage = document.getElementById(`page-${pageId}`);
    if (selectedPage) {
        selectedPage.classList.add('active');
        
        // Дополнительные действия при смене страницы
        if (pageId === 'users') {
            renderUsersTable();
        } else if (pageId === 'analytics') {
            updateAnalyticsCharts();
        }
    }
}

/**
 * Загрузка данных пользователей из localStorage
 */
function loadUserData() {
    try {
        // Проверяем наличие данных в localStorage
        const storedUsers = localStorage.getItem('telegramFormUsers');
        allUsers = storedUsers ? JSON.parse(storedUsers) : [];
        
        // Если данных нет, создаем тестовые данные
        if (allUsers.length === 0) {
            generateDemoData();
        }
        
        // Обновляем отфильтрованный список
        filteredUsers = [...allUsers];
        
        // Обновляем отображение статистики
        updateStatistics();
        
        // Обновляем таблицы
        renderUsersTable();
        renderRecentUsers();
        
        // Заполняем список городов для фильтрации
        populateCityFilter();
        
    } catch (error) {
        console.error('Ошибка загрузки данных пользователей:', error);
        showNotification('Ошибка загрузки данных пользователей', 'danger');
    }
}

/**
 * Генерация демонстрационных данных
 */
function generateDemoData() {
    const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Краснодар', 'Сочи'];
    const firstNames = ['Иван', 'Александр', 'Дмитрий', 'Сергей', 'Михаил', 'Андрей', 'Максим', 'Алексей'];
    const lastNames = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов'];
    
    // Генерация 50 тестовых пользователей
    for (let i = 0; i < 50; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const middleName = firstNames[Math.floor(Math.random() * firstNames.length)] + 'ович';
        
        // Случайная дата рождения от 18 до 70 лет назад
        const now = new Date();
        const year = now.getFullYear() - Math.floor(Math.random() * 52 + 18);
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const birthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Случайная дата регистрации за последние 90 дней
        const regDate = new Date(now);
        regDate.setDate(now.getDate() - Math.floor(Math.random() * 90));
        
        // Генерация телефона
        const phone = `+7${Math.floor(Math.random() * 999).toString().padStart(3, '0')}${Math.floor(Math.random() * 9999999).toString().padStart(7, '0')}`;
        
        // Создание пользователя
        const user = {
            id: `user_${Date.now()}_${i}`,
            fullName: `${lastName} ${firstName} ${middleName}`,
            city: cities[Math.floor(Math.random() * cities.length)],
            birthDate: birthDate,
            phoneNumber: phone,
            registrationDate: regDate.toISOString()
        };
        
        allUsers.push(user);
    }
    
    // Сортировка по дате регистрации
    allUsers.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    
    // Сохранить в localStorage
    localStorage.setItem('telegramFormUsers', JSON.stringify(allUsers));
}

/**
 * Обновление статистики на дашборде
 */
function updateStatistics() {
    const totalUsersElement = document.getElementById('totalUsers');
    const todayUsersElement = document.getElementById('todayUsers');
    const uniqueCitiesElement = document.getElementById('uniqueCities');
    
    if (totalUsersElement) {
        totalUsersElement.textContent = allUsers.length;
    }
    
    if (todayUsersElement) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayCount = allUsers.filter(user => {
            const regDate = new Date(user.registrationDate);
            return regDate >= today;
        }).length;
        
        todayUsersElement.textContent = todayCount;
    }
    
    if (uniqueCitiesElement) {
        const uniqueCities = new Set(allUsers.map(user => user.city));
        uniqueCitiesElement.textContent = uniqueCities.size;
    }
}

/**
 * Отображение таблицы недавних пользователей
 */
function renderRecentUsers() {
    const recentUsersTable = document.getElementById('recentUsersTable');
    
    if (!recentUsersTable) return;
    
    // Очистка таблицы
    recentUsersTable.innerHTML = '';
    
    // Вывод последних 5 пользователей
    const recentUsers = allUsers.slice(0, 5);
    
    if (recentUsers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" class="text-center">Нет данных о пользователях</td>`;
        recentUsersTable.appendChild(emptyRow);
        return;
    }
    
    recentUsers.forEach(user => {
        const row = document.createElement('tr');
        
        const regDate = new Date(user.registrationDate);
        const formattedRegDate = regDate.toLocaleDateString('ru-RU') + ' ' + 
                                 regDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        row.innerHTML = `
            <td>${user.fullName}</td>
            <td>${user.city}</td>
            <td>${formatDate(user.birthDate)}</td>
            <td>${user.phoneNumber}</td>
            <td>${formattedRegDate}</td>
        `;
        
        recentUsersTable.appendChild(row);
    });
}

/**
 * Отображение таблицы всех пользователей
 */
function renderUsersTable() {
    const usersTable = document.getElementById('usersTable');
    const paginationContainer = document.getElementById('usersPagination');
    const shownUsersElement = document.getElementById('shownUsers');
    const totalUsersCountElement = document.getElementById('totalUsersCount');
    
    if (!usersTable) return;
    
    // Очистка таблицы
    usersTable.innerHTML = '';
    
    // Вычисление пагинации
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
    
    // Обновление информации о показанных пользователях
    if (shownUsersElement && totalUsersCountElement) {
        shownUsersElement.textContent = filteredUsers.length > 0 ? `${startIndex + 1}-${endIndex}` : '0';
        totalUsersCountElement.textContent = filteredUsers.length;
    }
    
    if (filteredUsers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" class="text-center">Нет данных о пользователях</td>`;
        usersTable.appendChild(emptyRow);
        
        // Очистка пагинации
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        
        return;
    }
    
    // Отображение текущей страницы пользователей
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    
    currentUsers.forEach(user => {
        const row = document.createElement('tr');
        
        const birthDate = new Date(user.birthDate);
        const age = calculateAge(birthDate);
        
        const regDate = new Date(user.registrationDate);
        const formattedRegDate = regDate.toLocaleDateString('ru-RU') + ' ' + 
                                 regDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        row.innerHTML = `
            <td><input type="checkbox" class="user-checkbox" data-id="${user.id}"></td>
            <td>${user.fullName}</td>
            <td>${user.city}</td>
            <td>${formatDate(user.birthDate)}</td>
            <td>${age}</td>
            <td>${user.phoneNumber}</td>
            <td>${formattedRegDate}</td>
            <td>
                <button class="btn-action edit" data-id="${user.id}" title="Редактировать">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-action delete" data-id="${user.id}" title="Удалить">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        usersTable.appendChild(row);
    });
    
    // Обновление пагинации
    renderPagination(totalPages, paginationContainer);
    
    // Добавление обработчиков событий для кнопок
    addUserActionHandlers();
}

/**
 * Создание пагинации
 */
function renderPagination(totalPages, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Кнопка "Предыдущая"
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">«</a>`;
    container.appendChild(prevItem);
    
    // Страницы
    for (let i = 1; i <= totalPages; i++) {
        // Ограничение количества кнопок
        if (totalPages > 7) {
            // Первая, последняя и ближайшие к текущей
            if (i !== 1 && i !== totalPages && (i < currentPage - 1 || i > currentPage + 1)) {
                // Добавляем многоточие только один раз
                if (i === 2 || i === totalPages - 1) {
                    const ellipsisItem = document.createElement('li');
                    ellipsisItem.className = 'page-item disabled';
                    ellipsisItem.innerHTML = '<span class="page-link">...</span>';
                    container.appendChild(ellipsisItem);
                }
                continue;
            }
        }
        
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        container.appendChild(pageItem);
    }
    
    // Кнопка "Следующая"
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">»</a>`;
    container.appendChild(nextItem);
    
    // Обработчики для пагинации
    const pageLinks = container.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.hasAttribute('data-page')) {
                const pageNum = parseInt(this.getAttribute('data-page'));
                if (pageNum >= 1 && pageNum <= totalPages) {
                    currentPage = pageNum;
                    renderUsersTable();
                }
            }
        });
    });
}

/**
 * Добавление обработчиков для кнопок в таблице пользователей
 */
function addUserActionHandlers() {
    // Редактирование пользователя
    const editButtons = document.querySelectorAll('.btn-action.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openUserEditModal(userId);
        });
    });
    
    // Удаление пользователя
    const deleteButtons = document.querySelectorAll('.btn-action.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openDeleteConfirmation(userId);
        });
    });
    
    // Выбор всех пользователей
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.user-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
}

/**
 * Открытие модального окна редактирования пользователя
 */
function openUserEditModal(userId) {
    const userModal = new bootstrap.Modal(document.getElementById('userModal'));
    
    // Находим пользователя
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) {
        showNotification('Пользователь не найден', 'danger');
        return;
    }
    
    // Заполняем форму данными пользователя
    document.getElementById('userId').value = user.id;
    document.getElementById('editFullName').value = user.fullName;
    document.getElementById('editCity').value = user.city;
    document.getElementById('editBirthDate').value = user.birthDate;
    document.getElementById('editPhoneNumber').value = user.phoneNumber;
    
    // Показываем модальное окно
    userModal.show();
}

/**
 * Открытие подтверждения удаления пользователя
 */
function openDeleteConfirmation(userId) {
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmBtn = document.getElementById('confirmActionBtn');
    const confirmMessage = document.getElementById('confirmMessage');
    
    // Находим пользователя
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) {
        showNotification('Пользователь не найден', 'danger');
        return;
    }
    
    confirmMessage.textContent = `Вы уверены, что хотите удалить пользователя "${user.fullName}"?`;
    
    // Удаляем предыдущие обработчики
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    const newConfirmBtn = document.getElementById('confirmActionBtn');
    
    // Добавляем обработчик для подтверждения удаления
    newConfirmBtn.addEventListener('click', function() {
        deleteUser(userId);
        confirmModal.hide();
    });
    
    // Показываем модальное окно
    confirmModal.show();
}

/**
 * Удаление пользователя
 */
function deleteUser(userId) {
    // Находим индекс пользователя
    const index = allUsers.findIndex(user => user.id === userId);
    
    if (index === -1) {
        showNotification('Пользователь не найден', 'danger');
        return;
    }
    
    // Удаляем пользователя
    allUsers.splice(index, 1);
    
    // Обновляем отфильтрованный список
    applyFilters();
    
    // Сохраняем изменения
    localStorage.setItem('telegramFormUsers', JSON.stringify(allUsers));
    
    // Обновляем UI
    updateStatistics();
    renderUsersTable();
    renderRecentUsers();
    updateCharts();
    
    showNotification('Пользователь успешно удален', 'success');
}

/**
 * Сохранение отредактированного пользователя
 */
function saveUser() {
    const userId = document.getElementById('userId').value;
    const fullName = document.getElementById('editFullName').value;
    const city = document.getElementById('editCity').value;
    const birthDate = document.getElementById('editBirthDate').value;
    const phoneNumber = document.getElementById('editPhoneNumber').value;
    
    // Валидация
    if (!fullName || !city || !birthDate || !phoneNumber) {
        showNotification('Все поля обязательны для заполнения', 'danger');
        return false;
    }
    
    // Находим индекс пользователя
    const index = allUsers.findIndex(user => user.id === userId);
    
    if (index === -1) {
        showNotification('Пользователь не найден', 'danger');
        return false;
    }
    
    // Обновляем пользователя
    allUsers[index] = {
        ...allUsers[index],
        fullName,
        city,
        birthDate,
        phoneNumber
    };
    
    // Обновляем отфильтрованный список
    applyFilters();
    
    // Сохраняем изменения
    localStorage.setItem('telegramFormUsers', JSON.stringify(allUsers));
    
    // Обновляем UI
    renderUsersTable();
    renderRecentUsers();
    populateCityFilter();
    updateCharts();
    
    showNotification('Пользователь успешно обновлен', 'success');
    return true;
}

/**
 * Применение фильтров
 */
function applyFilters() {
    const cityFilter = document.getElementById('filterCity')?.value || '';
    const ageRangeFilter = document.getElementById('filterAgeRange')?.value || '';
    const dateFilter = document.getElementById('filterDate')?.value || '';
    const searchQuery = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    
    // Сбрасываем на первую страницу при изменении фильтров
    currentPage = 1;
    
    // Применяем фильтры
    filteredUsers = allUsers.filter(user => {
        // Фильтр по городу
        if (cityFilter && user.city !== cityFilter) {
            return false;
        }
        
        // Фильтр по возрасту
        if (ageRangeFilter) {
            const age = calculateAge(new Date(user.birthDate));
            const [minAge, maxAge] = ageRangeFilter.split('-');
            
            if (minAge && maxAge) {
                if (age < parseInt(minAge) || age > parseInt(maxAge)) {
                    return false;
                }
            } else if (minAge === '51+') {
                if (age < 51) {
                    return false;
                }
            }
        }
        
        // Фильтр по дате регистрации
        if (dateFilter) {
            const regDate = new Date(user.registrationDate);
            const filterDate = new Date(dateFilter);
            
            // Сброс часов для корректного сравнения дат
            regDate.setHours(0, 0, 0, 0);
            filterDate.setHours(0, 0, 0, 0);
            
            if (regDate.getTime() !== filterDate.getTime()) {
                return false;
            }
        }
        
        // Поиск
        if (searchQuery) {
            const searchValues = [
                user.fullName.toLowerCase(),
                user.city.toLowerCase(),
                user.phoneNumber.toLowerCase()
            ];
            
            return searchValues.some(value => value.includes(searchQuery));
        }
        
        return true;
    });
    
    // Обновляем таблицу
    renderUsersTable();
}

/**
 * Заполнение списка городов для фильтрации
 */
function populateCityFilter() {
    const cityFilter = document.getElementById('filterCity');
    
    if (!cityFilter) return;
    
    // Сохраняем текущее значение
    const currentValue = cityFilter.value;
    
    // Очищаем список
    cityFilter.innerHTML = '<option value="">Город (все)</option>';
    
    // Получаем уникальные города
    const cities = [...new Set(allUsers.map(user => user.city))].sort();
    
    // Добавляем города в список
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
    
    // Восстанавливаем выбранное значение
    if (currentValue && cities.includes(currentValue)) {
        cityFilter.value = currentValue;
    }
}

/**
 * Экспорт данных пользователей в CSV
 */
function exportUsersToCSV() {
    const header = ['ФИО', 'Город', 'Дата рождения', 'Возраст', 'Телефон', 'Дата регистрации'];
    
    const rows = filteredUsers.map(user => {
        const age = calculateAge(new Date(user.birthDate));
        const regDate = new Date(user.registrationDate);
        const formattedRegDate = regDate.toLocaleDateString('ru-RU') + ' ' + 
                                 regDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        return [
            user.fullName,
            user.city,
            formatDate(user.birthDate),
            age,
            user.phoneNumber,
            formattedRegDate
        ];
    });
    
    // Формирование CSV строки
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Добавление заголовка
    csvContent += header.join(',') + '\r\n';
    
    // Добавление строк
    rows.forEach(row => {
        // Экранирование кавычек и запятых
        const formattedRow = row.map(cell => {
            // Если ячейка содержит запятую, заключаем в кавычки
            if (String(cell).includes(',')) {
                // Экранируем кавычки
                return `"${String(cell).replace(/"/g, '""')}"`;
            }
            return cell;
        });
        
        csvContent += formattedRow.join(',') + '\r\n';
    });
    
    // Создание ссылки для скачивания
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    
    // Эмуляция клика
    link.click();
    
    // Удаление ссылки
    document.body.removeChild(link);
    
    showNotification('Данные успешно экспортированы', 'success');
}

/**
 * Удаление всех пользователей
 */
function deleteAllUsers() {
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmBtn = document.getElementById('confirmActionBtn');
    const confirmMessage = document.getElementById('confirmMessage');
    
    confirmMessage.textContent = 'Вы уверены, что хотите удалить ВСЕХ пользователей? Это действие нельзя отменить!';
    
    // Удаляем предыдущие обработчики
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    const newConfirmBtn = document.getElementById('confirmActionBtn');
    
    // Добавляем обработчик для подтверждения удаления
    newConfirmBtn.addEventListener('click', function() {
        allUsers = [];
        filteredUsers = [];
        
        // Сохраняем изменения
        localStorage.setItem('telegramFormUsers', JSON.stringify(allUsers));
        
        // Обновляем UI
        updateStatistics();
        renderUsersTable();
        renderRecentUsers();
        populateCityFilter();
        updateCharts();
        
        confirmModal.hide();
        showNotification('Все пользователи успешно удалены', 'success');
    });
    
    // Показываем модальное окно
    confirmModal.show();
}

/**
 * Инициализация графиков
 */
function initCharts() {
    // График регистраций
    const registrationsCtx = document.getElementById('registrationsChart')?.getContext('2d');
    if (registrationsCtx) {
        window.registrationsChart = new Chart(registrationsCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Регистрации',
                    data: [],
                    borderColor: '#4570c1',
                    backgroundColor: 'rgba(69, 112, 193, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    // График популярных городов
    const citiesCtx = document.getElementById('citiesChart')?.getContext('2d');
    if (citiesCtx) {
        window.citiesChart = new Chart(citiesCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#4570c1',
                        '#28a745',
                        '#ffc107',
                        '#dc3545',
                        '#17a2b8',
                        '#6c757d',
                        '#fd7e14'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // График распределения по возрастам
    const ageDistributionCtx = document.getElementById('ageDistributionChart')?.getContext('2d');
    if (ageDistributionCtx) {
        window.ageDistributionChart = new Chart(ageDistributionCtx, {
            type: 'bar',
            data: {
                labels: ['18-25', '26-35', '36-50', '51+'],
                datasets: [{
                    label: 'Количество пользователей',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(69, 112, 193, 0.7)',
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(220, 53, 69, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    // График распределения по городам
    const cityDistributionCtx = document.getElementById('cityDistributionChart')?.getContext('2d');
    if (cityDistributionCtx) {
        window.cityDistributionChart = new Chart(cityDistributionCtx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#4570c1',
                        '#28a745',
                        '#ffc107',
                        '#dc3545',
                        '#17a2b8',
                        '#6c757d',
                        '#fd7e14'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // График динамики регистраций
    const registrationTrendsCtx = document.getElementById('registrationTrendsChart')?.getContext('2d');
    if (registrationTrendsCtx) {
        window.registrationTrendsChart = new Chart(registrationTrendsCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Регистрации',
                    data: [],
                    borderColor: '#4570c1',
                    backgroundColor: 'rgba(69, 112, 193, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    // Обновляем данные для графиков
    updateCharts();
}

/**
 * Обновление данных для графиков
 */
function updateCharts() {
    updateRegistrationsChart();
    updateCitiesChart();
    updateAgeDistributionChart();
    updateCityDistributionChart();
    updateRegistrationTrendsChart();
}

/**
 * Обновление графика регистраций
 */
function updateRegistrationsChart() {
    const chart = window.registrationsChart;
    if (!chart) return;
    
    // Получаем данные за последние 7 дней
    const last7Days = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const formattedDate = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        last7Days.push(formattedDate);
        
        // Подсчет регистраций за этот день
        const count = allUsers.filter(user => {
            const regDate = new Date(user.registrationDate);
            regDate.setHours(0, 0, 0, 0);
            return regDate.getTime() === date.getTime();
        }).length;
        
        counts.push(count);
    }
    
    // Обновляем данные
    chart.data.labels = last7Days;
    chart.data.datasets[0].data = counts;
    chart.update();
}

/**
 * Обновление графика популярных городов
 */
function updateCitiesChart() {
    const chart = window.citiesChart;
    if (!chart) return;
    
    // Считаем количество пользователей по городам
    const cityCounts = {};
    allUsers.forEach(user => {
        cityCounts[user.city] = (cityCounts[user.city] || 0) + 1;
    });
    
    // Сортируем города по количеству пользователей
    const sortedCities = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Только топ-5 городов
    
    // Подсчитываем остальных
    const othersCount = allUsers.length - sortedCities.reduce((sum, [, count]) => sum + count, 0);
    
    // Формируем данные для графика
    const labels = sortedCities.map(([city]) => city);
    const data = sortedCities.map(([, count]) => count);
    
    // Добавляем "Другие", если есть
    if (othersCount > 0) {
        labels.push('Другие');
        data.push(othersCount);
    }
    
    // Обновляем данные
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

/**
 * Обновление графика распределения по возрастам
 */
function updateAgeDistributionChart() {
    const chart = window.ageDistributionChart;
    if (!chart) return;
    
    // Подсчет пользователей по возрастным группам
    const ageGroups = [0, 0, 0, 0]; // 18-25, 26-35, 36-50, 51+
    
    allUsers.forEach(user => {
        const age = calculateAge(new Date(user.birthDate));
        
        if (age >= 18 && age <= 25) {
            ageGroups[0]++;
        } else if (age >= 26 && age <= 35) {
            ageGroups[1]++;
        } else if (age >= 36 && age <= 50) {
            ageGroups[2]++;
        } else if (age > 50) {
            ageGroups[3]++;
        }
    });
    
    // Обновляем данные
    chart.data.datasets[0].data = ageGroups;
    chart.update();
}

/**
 * Обновление графика распределения по городам
 */
function updateCityDistributionChart() {
    const chart = window.cityDistributionChart;
    if (!chart) return;
    
    // Считаем количество пользователей по городам
    const cityCounts = {};
    allUsers.forEach(user => {
        cityCounts[user.city] = (cityCounts[user.city] || 0) + 1;
    });
    
    // Сортируем города по количеству пользователей
    const sortedCities = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7); // Только топ-7 городов
    
    // Подсчитываем остальных
    const othersCount = allUsers.length - sortedCities.reduce((sum, [, count]) => sum + count, 0);
    
    // Формируем данные для графика
    const labels = sortedCities.map(([city]) => city);
    const data = sortedCities.map(([, count]) => count);
    
    // Добавляем "Другие", если есть
    if (othersCount > 0) {
        labels.push('Другие');
        data.push(othersCount);
    }
    
    // Обновляем данные
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

/**
 * Обновление графика динамики регистраций
 */
function updateRegistrationTrendsChart() {
    const chart = window.registrationTrendsChart;
    if (!chart) return;
    
    // Получаем данные за последние 30 дней
    const last30Days = [];
    const counts = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const formattedDate = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        last30Days.push(formattedDate);
        
        // Подсчет регистраций за этот день
        const count = allUsers.filter(user => {
            const regDate = new Date(user.registrationDate);
            regDate.setHours(0, 0, 0, 0);
            return regDate.getTime() === date.getTime();
        }).length;
        
        counts.push(count);
    }
    
    // Обновляем данные
    chart.data.labels = last30Days;
    chart.data.datasets[0].data = counts;
    chart.update();
}

/**
 * Обновление графиков на странице аналитики
 */
function updateAnalyticsCharts() {
    // Обновляем возрастное распределение
    if (window.ageDistributionChart) {
        updateAgeDistributionChart();
    }
    
    // Обновляем распределение по городам
    if (window.cityDistributionChart) {
        updateCityDistributionChart();
    }
    
    // Обновляем тренды регистраций
    if (window.registrationTrendsChart) {
        updateRegistrationTrendsChart();
    }
}

/**
 * Настройка обработчиков событий
 */
function setupEventListeners() {
    // Обработчик для сохранения пользователя
    const saveUserBtn = document.getElementById('saveUserBtn');
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', function() {
            if (saveUser()) {
                // Закрываем модальное окно, если сохранение успешно
                const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
                userModal.hide();
            }
        });
    }
    
    // Обработчик для удаления пользователя из модального окна
    const deleteUserBtn = document.getElementById('deleteUserBtn');
    if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', function() {
            const userId = document.getElementById('userId').value;
            
            // Закрываем модальное окно
            const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
            userModal.hide();
            
            // Показываем подтверждение
            openDeleteConfirmation(userId);
        });
    }
    
    // Обработчик для экспорта пользователей
    const exportUsersBtn = document.getElementById('exportUsersBtn');
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', exportUsersToCSV);
    }
    
    // Обработчик для удаления всех пользователей
    const deleteAllUsersBtn = document.getElementById('deleteAllUsersBtn');
    if (deleteAllUsersBtn) {
        deleteAllUsersBtn.addEventListener('click', deleteAllUsers);
    }
    
    // Обработчики для фильтров
    const filterCity = document.getElementById('filterCity');
    const filterAgeRange = document.getElementById('filterAgeRange');
    const filterDate = document.getElementById('filterDate');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            if (filterCity) filterCity.value = '';
            if (filterAgeRange) filterAgeRange.value = '';
            if (filterDate) filterDate.value = '';
            applyFilters();
        });
    }
    
    // Обработчик для поиска
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    // Обработчик для кнопки сохранения настроек
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            showNotification('Настройки успешно сохранены', 'success');
        });
    }
    
    // Обработчик для кнопки выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Простой редирект на страницу входа (в реальном приложении здесь должен быть полноценный logout)
            window.location.href = 'login.html';
        });
    }
}

/**
 * Вспомогательные функции
 */

/**
 * Расчет возраста по дате рождения
 */
function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * Форматирование даты
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

/**
 * Показ уведомления
 */
function showNotification(message, type = 'info') {
    // Проверка существования контейнера для уведомлений
    let notificationContainer = document.getElementById('notificationContainer');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // Создание уведомления
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Добавление в контейнер
    notificationContainer.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
