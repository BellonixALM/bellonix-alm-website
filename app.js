// ==========================================
// BELLONIX ALM INTERACTIVE JS
// ==========================================

// Global state for sandbox demo simulation
const state = {
    activeTrips: 12,
    deliveredToday: 48,
    fuelExpenses: 12450,
    statusText: 'Норма',
    chartData: [4, 6, 8, 12, 10, 8] // Deliveries over last 6 hours
};

let heroChart = null;
let sandboxChart = null;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCharts();
    initNavigation();
    initMobileNav();
    updateEstimatedCost();
});

// Theme handling
function initTheme() {
    const toggleBtn = document.getElementById('themeToggle');
    const toggleBtnMobile = document.getElementById('themeToggleMobile');
    
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    const initialThemeIsLight = (savedTheme === 'light' || (!savedTheme && systemPrefersLight));
    
    if (initialThemeIsLight) {
        document.body.classList.add('light-theme');
        updateThemeIcons(true);
    } else {
        document.body.classList.remove('light-theme');
        updateThemeIcons(false);
    }

    const handleToggle = () => {
        const isCurrentlyLight = document.body.classList.contains('light-theme');
        const nextThemeIsLight = !isCurrentlyLight;
        
        document.body.classList.toggle('light-theme', nextThemeIsLight);
        localStorage.setItem('theme', nextThemeIsLight ? 'light' : 'dark');
        updateThemeIcons(nextThemeIsLight);
        updateChartTheme(nextThemeIsLight);
    };

    toggleBtn.addEventListener('click', handleToggle);
    toggleBtnMobile.addEventListener('click', handleToggle);
}

function updateThemeIcons(isLight) {
    const toggleIcon = document.querySelector('#themeToggle i');
    const toggleIconMobile = document.querySelector('#themeToggleMobile i');
    
    if (isLight) {
        toggleIcon.className = 'fa-solid fa-moon';
        toggleIconMobile.className = 'fa-solid fa-moon';
    } else {
        toggleIcon.className = 'fa-solid fa-sun';
        toggleIconMobile.className = 'fa-solid fa-sun';
    }
}

function updateChartTheme(isLight) {
    const labelColor = isLight ? '#475569' : '#a0aec0';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)';
    
    if (heroChart) {
        heroChart.options.scales.x.ticks.color = labelColor;
        heroChart.options.scales.y.ticks.color = labelColor;
        heroChart.options.scales.y.grid.color = gridColor;
        heroChart.update();
    }
    
    if (sandboxChart) {
        sandboxChart.options.scales.x.ticks.color = labelColor;
        sandboxChart.options.scales.y.ticks.color = labelColor;
        sandboxChart.options.scales.y.grid.color = gridColor;
        sandboxChart.update();
    }
}

// Navigation scroll active styling
function initNavigation() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        // Sticky Header scroll styling
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link highlighting based on viewport scroll position
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

// Mobile drawer open/close
function initMobileNav() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    const closeBtn = document.querySelector('.drawer-close');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    toggle.addEventListener('click', () => {
        drawer.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
        drawer.classList.remove('open');
    });

    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            drawer.classList.remove('open');
        });
    });
}

// Chart.js configurations
function initCharts() {
    const isLight = document.body.classList.contains('light-theme');
    const labelColor = isLight ? '#475569' : '#a0aec0';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)';

    // Hero preview static chart
    const ctxHero = document.getElementById('heroChart').getContext('2d');
    heroChart = new Chart(ctxHero, {
        type: 'line',
        data: {
            labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
            datasets: [{
                label: 'Ефективність доставки',
                data: [85, 88, 92, 95, 94, 98],
                borderColor: '#008080',
                backgroundColor: 'rgba(0, 128, 128, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: labelColor, font: { size: 10 } } },
                y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 10 } } }
            }
        }
    });

    // Sandbox interactive dynamic chart
    const ctxSandbox = document.getElementById('sandboxChart').getContext('2d');
    sandboxChart = new Chart(ctxSandbox, {
        type: 'bar',
        data: {
            labels: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
            datasets: [{
                label: 'Доставки (од.)',
                data: [...state.chartData],
                backgroundColor: '#0D3B66',
                hoverBackgroundColor: '#008080',
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: labelColor, font: { size: 10 } } },
                y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 10 }, stepSize: 2 } }
            }
        }
    });
}

// Interactive Sandbox Actions Simulator
function simulateBotAction(action) {
    const chatContainer = document.getElementById('chatMessages');
    const logContent = document.getElementById('logContent');
    
    let outgoingMsg = '';
    let responseMsg = '';
    let logMsg = '';
    let logType = 'info';

    switch (action) {
        case 'new_trip':
            state.activeTrips += 1;
            outgoingMsg = "🚀 Розпочати рейс #1043";
            responseMsg = "✅ Рейс #1043 активовано. GPS трекінг розпочато. Маршрутний лист надіслано в навігатор.";
            logMsg = "[BOT_API] Водій Олександр розпочав рейс #1043. База даних CRM оновлена.";
            logType = 'info';
            
            // UI updating
            document.getElementById('dashTripsVal').innerText = `${state.activeTrips} активних`;
            break;
            
        case 'delivered':
            state.activeTrips = Math.max(0, state.activeTrips - 1);
            state.deliveredToday += 1;
            // Update last hour chart bar
            state.chartData[state.chartData.length - 1] += 1;
            
            outgoingMsg = "📦 Замовлення доставлено! Отримано підпис.";
            responseMsg = "🎉 Вітаємо! Доставка зареєстрована. Клієнту надіслано SMS із запитом на оцінку сервісу.";
            logMsg = `[CRM] Доставка успішна. Загальна кількість сьогодні: ${state.deliveredToday}. Оновлено графік доставок.`;
            logType = 'success';
            
            // UI updating
            document.getElementById('dashTripsVal').innerText = `${state.activeTrips} активних`;
            document.getElementById('dashDeliveredVal').innerText = `${state.deliveredToday} замовлень`;
            
            // Refresh chart view
            sandboxChart.data.datasets[0].data = [...state.chartData];
            sandboxChart.update();
            break;
            
        case 'refuel':
            const fuelCost = 2400;
            state.fuelExpenses += fuelCost;
            outgoingMsg = `⛽ Заправка на ${fuelCost} ₴. Надсилаю фото чеку...`;
            responseMsg = "📥 Чек отримано. Суму 2 400 ₴ автоматично додано у витрати по рейсу. Звіт сформовано.";
            logMsg = `[FINANCE] Отримано чек заправки. Поточні витрати палива за день: ${state.fuelExpenses.toLocaleString()} ₴`;
            logType = 'success';
            
            // UI updating
            document.getElementById('dashFuelVal').innerText = `${state.fuelExpenses.toLocaleString()} ₴`;
            break;
            
        case 'issue':
            state.statusText = 'Затримка';
            outgoingMsg = "⚠️ Затримка в заторі на Кільцевій дорозі";
            responseMsg = "🚨 Повідомлення передано логісту. Розрахунковий час прибуття оновлено (+40 хв).";
            logMsg = "[WARN] Увага! Затримка по рейсу #1043. Статус автомобіля змінено на 'Warning'.";
            logType = 'warn';
            
            // UI updating
            const statusEl = document.getElementById('dashStatusVal');
            statusEl.innerText = state.statusText;
            statusEl.className = 'val text-red';
            
            // Reset to normal after 5 seconds automatically to simulate real operation flow
            setTimeout(() => {
                state.statusText = 'Норма';
                const sEl = document.getElementById('dashStatusVal');
                sEl.innerText = state.statusText;
                sEl.className = 'val text-green';
                
                const returnLog = document.createElement('div');
                returnLog.className = 'log-row info';
                returnLog.innerText = "[SYSTEM] Трафік нормалізувався. Автомобіль повернувся до штатного режиму.";
                logContent.appendChild(returnLog);
                logContent.scrollTop = logContent.scrollHeight;
            }, 6000);
            break;
    }

    // Append driver message
    const outDiv = document.createElement('div');
    outDiv.className = 'message outgoing';
    outDiv.innerText = outgoingMsg;
    chatContainer.appendChild(outDiv);

    // Append system bot response message with delay
    setTimeout(() => {
        const inDiv = document.createElement('div');
        inDiv.className = 'message incoming';
        inDiv.innerText = responseMsg;
        chatContainer.appendChild(inDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 450);

    // Append Dashboard Log row
    const logDiv = document.createElement('div');
    logDiv.className = `log-row ${logType}`;
    logDiv.innerText = logMsg;
    logContent.appendChild(logDiv);
    
    // Auto-scroll elements
    chatContainer.scrollTop = chatContainer.scrollHeight;
    logContent.scrollTop = logContent.scrollHeight;
}

// Interactive Pricing Cost Calculator
function updateEstimatedCost() {
    let cost = 0;
    const hasBot = document.getElementById('calcBot').checked;
    const hasBotDb = document.getElementById('calcBotDb').checked;
    const hasDash = document.getElementById('calcDash').checked;
    const hasInt = document.getElementById('calcIntegrate').checked;
    const hasGps = document.getElementById('calcGps').checked;

    if (hasBot) cost += 500;
    if (hasBotDb) cost += 1000;
    if (hasDash) cost += 1500;
    if (hasInt) cost += 1000;
    if (hasGps) cost += 1000;

    document.getElementById('estimatedCost').innerText = `${cost} $`;
}

// Handle client requests contact form submissions
function handleFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    
    const hasBot = document.getElementById('calcBot').checked ? "Так" : "Ні";
    const hasBotDb = document.getElementById('calcBotDb').checked ? "Так" : "Ні";
    const hasDash = document.getElementById('calcDash').checked ? "Так" : "Ні";
    const hasInt = document.getElementById('calcIntegrate').checked ? "Так" : "Ні";
    const hasGps = document.getElementById('calcGps').checked ? "Так" : "Ні";
    
    const cost = document.getElementById('estimatedCost').innerText;
    
    // Construct pre-formatted message
    const message = `🔔 Нова заявка з сайту Bellonix ALM!\n\n👤 Ім'я: ${name}\n📞 Контакт: ${phone}\n\n🛠 Обрані рішення:\n- Telegram / Viber Бот (базовий): ${hasBot}\n- Бот із хмарною БД (Google / SQL): ${hasBotDb}\n- Дашборд з аналітикою: ${hasDash}\n- Інтеграція з CRM / 1С: ${hasInt}\n- Інтеграція з GPS-трекінгом: ${hasGps}\n\n💵 Розрахункова вартість: ${cost}`;
    
    // Use official Telegram share link to pass pre-filled message
    const telegramShareUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(message)}`;
    
    // Open sharing dialog
    window.open(telegramShareUrl, '_blank');
    
    showToast(`Дякуємо, ${name}! Заявку сформовано. Надішліть її контакту @BellonixALM у відкритому вікні Telegram.`);
    
    // Reset inputs
    document.getElementById('leadForm').reset();
    updateEstimatedCost();
}

// Track file download actions
function trackDownload(event, fileName) {
    showToast(`Завантаження файлу "${fileName}" розпочато!`);
}

// Helper Toast popup
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    
    toastMsg.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4500);
}
