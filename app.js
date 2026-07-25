// ==========================================
// BELLONIX ALM INTERACTIVE JS
// ==========================================

// Global state for sandbox demo simulation
const state = {
    // Logistics mode variables
    activeTrips: 12,
    deliveredToday: 48,
    fuelExpenses: 12450,
    statusText: 'Норма',
    chartData: [4, 6, 8, 12, 10, 8], // Deliveries over last 6 hours
    
    // FOP Invoicing mode variables
    invoicesCount: 24,
    unpaidInvoices: 3,
    totalBilled: 142800,
    fopStatusText: 'Норма',
    fopChartData: [45000, 32000, 65000, 48000, 20000, 52000], // Billed amount over last 6 months
    
    // Simulation configurations
    mode: 'logistics' // 'logistics' or 'fop'
};

let heroChart = null;
let sandboxChart = null;

// Sandbox mode switcher
function setSandboxMode(mode) {
    state.mode = mode;
    const isEn = document.documentElement.lang === 'en';
    const btnLogistics = document.getElementById('simModeLogistics');
    const btnFop = document.getElementById('simModeFop');
    
    // Panel elements
    const phoneContainer = document.getElementById('phoneMockupContainer');
    const fopControlPanel = document.getElementById('fopControlPanelContainer');
    const logisticsDashboard = document.getElementById('logisticsDashboardMockup');
    const fopDashboard = document.getElementById('fopDashboardMockup');
    
    // Toggle active class style on switcher buttons
    if (mode === 'logistics') {
        btnLogistics.className = 'btn-primary';
        btnFop.className = 'btn-secondary';
        
        // Toggle view containers visibility
        phoneContainer.style.display = 'flex';
        fopControlPanel.style.display = 'none';
        logisticsDashboard.style.display = 'flex';
        fopDashboard.style.display = 'none';
        
        // Reset state
        const chatContainer = document.getElementById('chatMessages');
        const logContent = document.getElementById('logContent');
        chatContainer.innerHTML = '';
        logContent.innerHTML = '';
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'chat-date';
        dateDiv.innerText = isEn ? 'Today' : 'Сьогодні';
        chatContainer.appendChild(dateDiv);
        
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'message incoming';
        welcomeDiv.innerText = isEn 
            ? "Hello! You are connected to the Bellonix ALM ecosystem. Choose an action on the keyboard below to start the demo."
            : "Вітаю! Ви на зв'язку з системою Bellonix ALM. Оберіть дію на панелі нижче для початку роботи.";
        chatContainer.appendChild(welcomeDiv);
        
        // Reset stats values
        document.getElementById('dashTripsVal').innerText = isEn ? `${state.activeTrips} active` : `${state.activeTrips} активних`;
        document.getElementById('dashDeliveredVal').innerText = isEn ? `${state.deliveredToday} orders` : `${state.deliveredToday} замовлень`;
        document.getElementById('dashFuelVal').innerText = `${state.fuelExpenses.toLocaleString()} ₴`;
        
        const statusEl = document.getElementById('dashStatusVal');
        statusEl.innerText = isEn ? 'Normal' : 'Норма';
        statusEl.className = 'val text-green';
        
        const initialLog = document.createElement('div');
        initialLog.className = 'log-row info';
        initialLog.innerText = isEn ? '[SYSTEM] Dashboard initialized. Awaiting requests from bots...' : '[SYSTEM] Дашборд ініціалізовано. Очікування запитів від ботів...';
        logContent.appendChild(initialLog);
        
        // Rebuild Chart
        sandboxChart.data.datasets[0].label = isEn ? 'Deliveries (units)' : 'Доставки (од.)';
        sandboxChart.data.labels = ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        sandboxChart.data.datasets[0].data = [...state.chartData];
        sandboxChart.update();
        
    } else {
        btnLogistics.className = 'btn-secondary';
        btnFop.className = 'btn-primary';
        
        // Toggle view containers visibility
        phoneContainer.style.display = 'none';
        fopControlPanel.style.display = 'flex';
        logisticsDashboard.style.display = 'none';
        fopDashboard.style.display = 'flex';
        
        // Refresh FOP statistics metrics
        updateFopDashboardUI();
        
        const fopLogContent = document.getElementById('fopLogContent');
        fopLogContent.innerHTML = `<div class="log-row info" style="color: #64748b;">${isEn ? '[PORTAL] FOP Billing portal initialized. Awaiting api sync command triggers...' : '[PORTAL] Систему обліку активовано. Очікування дій від користувача...'}</div>`;
    }
}

// Helper to refresh FOP Dashboard data
function updateFopDashboardUI() {
    const isEn = document.documentElement.lang === 'en';
    
    // Total sum values
    document.getElementById('fopInvoicedVal').innerText = `${state.totalBilled.toLocaleString('uk-UA')},00 ${isEn ? 'UAH' : 'грн'}`;
    document.getElementById('fopActsVal').innerText = `${(state.totalBilled - (state.unpaidInvoices * 12500)).toLocaleString('uk-UA')},00 ${isEn ? 'UAH' : 'грн'}`;
    
    // Sub labels counts
    document.getElementById('fopInvoicedSub').innerText = isEn 
        ? `↗ Total ${state.invoicesCount} invoices` 
        : `↗ Всього ${state.invoicesCount} рахунків`;
        
    document.getElementById('fopActsSub').innerText = isEn 
        ? `⚏ Total ${state.invoicesCount - state.unpaidInvoices} acts` 
        : `⚏ Всього ${state.invoicesCount - state.unpaidInvoices} актів`;
        
    // Left side counts
    document.getElementById('fopClientsVal').innerText = "1";
    document.getElementById('fopServicesVal').innerText = "2";
}

// Interactive Sandbox Actions Simulator
function simulateBotAction(action) {
    const isEn = document.documentElement.lang === 'en';
    const logContent = document.getElementById('logContent');
    const fopLogContent = document.getElementById('fopLogContent');
    
    let outgoingMsg = '';
    let responseMsg = '';
    let logMsg = '';
    let logType = 'info';

    if (state.mode === 'logistics') {
        const chatContainer = document.getElementById('chatMessages');
        switch (action) {
            case 'new_trip':
                state.activeTrips += 1;
                outgoingMsg = isEn ? "🚀 Start trip #1043" : "🚀 Розпочати рейс #1043";
                responseMsg = isEn 
                    ? "✅ Trip #1043 activated. GPS tracking online. Waybill data dispatched to navigator."
                    : "✅ Рейс #1043 активовано. GPS трекінг розпочато. Маршрутний лист надіслано в навігатор.";
                logMsg = isEn
                    ? "[BOT_API] Driver Alexander started trip #1043. CRM database synced."
                    : "[BOT_API] Водій Олександр розпочав рейс #1043. База даних CRM оновлена.";
                logType = 'info';
                document.getElementById('dashTripsVal').innerText = isEn ? `${state.activeTrips} active` : `${state.activeTrips} активних`;
                break;
                
            case 'delivered':
                state.activeTrips = Math.max(0, state.activeTrips - 1);
                state.deliveredToday += 1;
                state.chartData[state.chartData.length - 1] += 1;
                
                outgoingMsg = isEn ? "📦 Order delivered successfully. Signature captured." : "📦 Замовлення доставлено! Отримано підпис.";
                responseMsg = isEn
                    ? "🎉 Delivery registered. Customer feedback request SMS dispatched."
                    : "🎉 Вітаємо! Доставка зареєстрована. Клієнту надіслано SMS із запитом на оцінку сервісу.";
                logMsg = isEn
                    ? `[CRM] Delivery success. Today total: ${state.deliveredToday}. Hourly deliveries chart updated.`
                    : `[CRM] Доставка успішна. Загальна кількість сьогодні: ${state.deliveredToday}. Оновлено графік доставок.`;
                logType = 'success';
                
                document.getElementById('dashTripsVal').innerText = isEn ? `${state.activeTrips} active` : `${state.activeTrips} активних`;
                document.getElementById('dashDeliveredVal').innerText = isEn ? `${state.deliveredToday} orders` : `${state.deliveredToday} замовлень`;
                sandboxChart.data.datasets[0].data = [...state.chartData];
                sandboxChart.update();
                break;
                
            case 'refuel':
                const fuelCost = 2400;
                state.fuelExpenses += fuelCost;
                outgoingMsg = isEn ? `⛽ Refuel ${fuelCost} ₴. Dispatched invoice receipt photo...` : `⛽ Заправка на ${fuelCost} ₴. Надсилаю фото чеку...`;
                responseMsg = isEn
                    ? `📥 Receipt captured. Fuel expense of 2,400 ₴ appended to current trip cost log.`
                    : "📥 Чек отримано. Суму 2 400 ₴ автоматично додано у витрати по рейсу. Звіт сформовано.";
                logMsg = isEn
                    ? `[FINANCE] Refueling ticket approved. Fleet daily fuel costs: ${state.fuelExpenses.toLocaleString()} ₴`
                    : `[FINANCE] Отримано чек заправки. Поточні витрати палива за день: ${state.fuelExpenses.toLocaleString()} ₴`;
                logType = 'success';
                document.getElementById('dashFuelVal').innerText = `${state.fuelExpenses.toLocaleString()} ₴`;
                break;
                
            case 'issue':
                state.statusText = isEn ? 'Delayed' : 'Затримка';
                outgoingMsg = isEn ? "⚠️ Traffic jam delay alert" : "⚠️ Затримка в заторі на Кільцевій дорозі";
                responseMsg = isEn
                    ? "🚨 Dispatcher notified. Estimated arrival time recalculated (+40 mins)."
                    : "🚨 Повідомлення передано логісту. Розрахунковий час прибуття оновлено (+40 хв).";
                logMsg = isEn
                    ? "[WARN] Courier warning status on trip #1043. Vehicle metrics changed to 'Warning'."
                    : "[WARN] Увага! Затримка по рейсу #1043. Статус автомобіля змінено на 'Warning'.";
                logType = 'warn';
                
                const statusEl = document.getElementById('dashStatusVal');
                statusEl.innerText = state.statusText;
                statusEl.className = 'val text-red';
                
                setTimeout(() => {
                    state.statusText = isEn ? 'Normal' : 'Норма';
                    const sEl = document.getElementById('dashStatusVal');
                    sEl.innerText = state.statusText;
                    sEl.className = 'val text-green';
                    
                    const returnLog = document.createElement('div');
                    returnLog.className = 'log-row info';
                    returnLog.innerText = isEn ? "[SYSTEM] Traffic issue resolved. Vehicle returned to standard operations." : "[SYSTEM] Трафік нормалізувався. Автомобіль повернувся до штатного режиму.";
                    logContent.appendChild(returnLog);
                    logContent.scrollTop = logContent.scrollHeight;
                }, 6000);
                break;
        }

        // Append driver message layout
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

    } else {
        // FOP INVOICING SIMULATOR LOGIC
        const invoicesContainer = document.getElementById('fopLastInvoicesContainer');
        const actsContainer = document.getElementById('fopLastActsContainer');
        
        switch (action) {
            case 'create_invoice':
                state.invoicesCount += 1;
                state.unpaidInvoices += 1;
                state.totalBilled += 12500;
                
                logMsg = isEn 
                    ? `[BILLING] Drafted Invoice № 00${state.invoicesCount} for Bellonix ALM (Test): 12,500.00 UAH. Marked: 'NEW'.`
                    : `[BILLING] Згенеровано Рахунок № 00${state.invoicesCount} для Bellonix ALM (Тест) на суму 12 500,00 грн. Статус: 'Новий'.`;
                logType = 'info';
                
                // Add invoice html item mockup matching design
                const newInvRow = document.createElement('div');
                newInvRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: #e0f2f1; border-radius: 12px; transition: background 0.3s;";
                newInvRow.innerHTML = `
                    <div>
                        <span style="font-weight: 700; font-size: 0.85rem; color: #0d3b66; display: block;">${isEn ? `Invoice № 00${state.invoicesCount}` : `Рахунок № 00${state.invoicesCount}`}</span>
                        <span style="font-size: 0.75rem; color: #64748b;">${isEn ? 'Bellonix ALM (Test)' : 'Bellonix ALM (Тест)'} • ${new Date().toLocaleDateString('uk-UA')}</span>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-weight: 800; font-size: 0.85rem; color: #0d3b66; display: block;">12 500,00 грн</span>
                        <span style="font-size: 0.65rem; background: #008080; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${isEn ? 'New' : 'Новий'}</span>
                    </div>
                `;
                invoicesContainer.insertBefore(newInvRow, invoicesContainer.firstChild);
                
                // Animate flash background back to slate gray after a second
                setTimeout(() => {
                    newInvRow.style.background = "#f8fafc";
                }, 1000);
                
                updateFopDashboardUI();
                break;
                
            case 'simulate_payment':
                if (state.unpaidInvoices > 0) {
                    state.unpaidInvoices -= 1;
                    
                    logMsg = isEn 
                        ? `[MONOBANK_API] Inflow transaction detected. UAH 12,500.00 received. Automatically matching outstanding invoice INV-00${state.invoicesCount - state.unpaidInvoices}.`
                        : `[MONOBANK_API] Отримано оплату за випискою банку: +12 500,00 грн від Bellonix ALM (Тест). Рахунок № 00${state.invoicesCount - state.unpaidInvoices} закрито автоматично.`;
                    logType = 'success';
                    
                    // Update visual label on first pending item badge inside invoicesContainer
                    const firstBadge = invoicesContainer.querySelector('span[style*="background: #008080"]') || invoicesContainer.querySelector('span[style*="background: rgb(226, 232, 240)"]');
                    if (firstBadge) {
                        firstBadge.innerText = isEn ? 'Paid' : 'Оплачено';
                        firstBadge.style.background = '#e0f2f1';
                        firstBadge.style.color = '#008080';
                    }
                    
                    updateFopDashboardUI();
                } else {
                    logMsg = isEn
                        ? "[SYSTEM] payment synchronization triggered. All invoices are currently paid."
                        : "[SYSTEM] Звірка оплат завершена. Неоплачених рахунків у системі не знайдено.";
                    logType = 'warn';
                }
                break;
                
            case 'bank_sync':
                logMsg = isEn 
                    ? "[BANK_API] Monobank statement sync active. Connection test: 200 OK. Transactions verified."
                    : "[BANK_API] Синхронізація виписок Monobank виконана. З'єднання активне (200 OK). Транзакцій не виявлено.";
                logType = 'info';
                break;
                
            case 'generate_act':
                const paidActsCount = state.invoicesCount - state.unpaidInvoices;
                logMsg = isEn
                    ? `[PORTAL] Generated service performance Act № 00${paidActsCount} linked to Invoice INV-00${paidActsCount}.`
                    : `[PORTAL] Створено Акт виконаних робіт № 00${paidActsCount} для Bellonix ALM (Тест) на суму 12 500,00 грн.`;
                logType = 'success';
                
                // Add act html item mockup matching design
                const newActRow = document.createElement('div');
                newActRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: #e0f2f1; border-radius: 12px; transition: background 0.3s;";
                newActRow.innerHTML = `
                    <div>
                        <span style="font-weight: 700; font-size: 0.85rem; color: #0d3b66; display: block;">${isEn ? `Act № 00${paidActsCount}` : `Акт № 00${paidActsCount}`}</span>
                        <span style="font-size: 0.75rem; color: #64748b;">${isEn ? `for Invoice № 00${paidActsCount}` : `до Рахунку № 00${paidActsCount}`} • ${new Date().toLocaleDateString('uk-UA')}</span>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-weight: 800; font-size: 0.85rem; color: #0d3b66; display: block;">12 500,00 грн</span>
                        <span style="font-size: 0.7rem; color: #008080; font-weight: 600;">${isEn ? 'Bellonix ALM (Test)' : 'Bellonix ALM (Тест)'}</span>
                    </div>
                `;
                actsContainer.insertBefore(newActRow, actsContainer.firstChild);
                
                setTimeout(() => {
                    newActRow.style.background = "#f8fafc";
                }, 1000);
                
                updateFopDashboardUI();
                break;
        }

        // Append FOP log row
        const logDiv = document.createElement('div');
        logDiv.className = `log-row ${logType}`;
        
        let color = '#3b82f6'; // info
        if (logType === 'success') color = '#22c55e';
        if (logType === 'warn') color = '#eab308';
        
        logDiv.style.cssText = `color: ${color}; margin-bottom: 0.4rem;`;
        logDiv.innerText = logMsg;
        fopLogContent.appendChild(logDiv);
        fopLogContent.scrollTop = fopLogContent.scrollHeight;
    }
}

// Global configuration (fill this with your Google Apps Script URL after deployment)
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxSHbdpQnvhVzTuMZYccwiXx1noQDEdx_Rp08hDEjQVnTJdKVLxSRZ-TCYPKWD7meHyQQ/exec"; 

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCharts();
    initNavigation();
    initMobileNav();
    updateEstimatedCost();
    loadReviews();
    initSiteCounter();
});

function initSiteCounter() {
    const viewsEl = document.getElementById('siteViewsCount');
    if (!viewsEl) return;
    
    fetch('https://api.counterapi.dev/v1/bellonix-alm/total_visits/up')
        .then(res => res.json())
        .then(data => {
            if (data && typeof data.count !== 'undefined') {
                viewsEl.textContent = data.count.toLocaleString();
            }
        })
        .catch(err => {
            console.error('Counter API error:', err);
            const wrapper = document.getElementById('siteViewsWrapper');
            if (wrapper) wrapper.style.display = 'none';
        });
}

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

// Interactive Pricing Cost Calculator
function updateEstimatedCost() {
    let cost = 0;
    let saasCost = 0;
    
    const hasBot = document.getElementById('calcBot').checked;
    const hasBotDb = document.getElementById('calcBotDb').checked;
    const hasDash = document.getElementById('calcDash').checked;
    const hasInt = document.getElementById('calcIntegrate').checked;
    const hasGps = document.getElementById('calcGps').checked;
    const hasFopSaaS = document.getElementById('calcFopSaaS').checked;
    const hasFopCustom = document.getElementById('calcFopCustom').checked;

    if (hasBot) cost += 500;
    if (hasBotDb) cost += 1000;
    if (hasDash) cost += 500;
    if (hasInt) cost += 1000;
    if (hasGps) cost += 1000;
    if (hasFopCustom) cost += 500;
    if (hasFopSaaS) saasCost += 199;

    let resultText = "";
    if (cost > 0 && saasCost > 0) {
        resultText = `${cost} $ + ${saasCost} ${isEn ? 'UAH/mo' : 'грн/міс'}`;
    } else if (saasCost > 0) {
        resultText = `${saasCost} ${isEn ? 'UAH/mo' : 'грн/міс'}`;
    } else {
        resultText = `${cost} $`;
    }
    
    document.getElementById('estimatedCost').innerText = resultText;
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
    const hasFopSaaS = document.getElementById('calcFopSaaS').checked ? "Так" : "Ні";
    const hasFopCustom = document.getElementById('calcFopCustom').checked ? "Так" : "Ні";
    
    const cost = document.getElementById('estimatedCost').innerText;
    
    const payload = {
        type: 'lead',
        name: name,
        phone: phone,
        hasBot: hasBot,
        hasBotDb: hasBotDb,
        hasDash: hasDash,
        hasInt: hasInt,
        hasGps: hasGps,
        hasFopSaaS: hasFopSaaS,
        hasFopCustom: hasFopCustom,
        cost: cost
    };
    
    const isEn = document.documentElement.lang === 'en';
    
    if (WEBAPP_URL) {
        fetch(WEBAPP_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const msg = isEn 
                    ? `Thank you, ${name}! Your request has been successfully submitted. We will contact you soon.`
                    : `Дякуємо, ${name}! Заявку успішно відправлено. Ми зв'яжемося з вами найближчим часом.`;
                showToast(msg);
            } else {
                const msg = isEn ? "Submission failed. Please try again later." : "Помилка надсилання. Спробуйте пізніше.";
                showToast(msg);
            }
        })
        .catch(err => {
            console.error("Error sending lead to WebApp:", err);
            const msg = isEn ? "Submission failed. Please try again later." : "Помилка надсилання. Спробуйте пізніше.";
            showToast(msg);
        });
    } else {
        const msg = isEn ? "Simulation mode: Request saved locally." : "Режим симуляції: Заявку збережено локально.";
        showToast(msg);
    }
    
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

// Reviews Management Logic
function openReviewModal() {
    document.getElementById('reviewModal').classList.add('active');
    initStarRating();
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.remove('active');
    document.getElementById('reviewForm').reset();
    resetStarRating();
}

// Default reviews to fallback on (keep empty for real-user-only mode)
const defaultReviews = [];

function loadReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    if (WEBAPP_URL) {
        // Fetch approved reviews from Google Sheets API
        fetch(WEBAPP_URL)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    renderReviewCards(data);
                } else {
                    renderEmptyReviewsPlaceholder();
                }
            })
            .catch(err => {
                console.error("Error loading reviews from database:", err);
                renderEmptyReviewsPlaceholder();
            });
    } else {
        // Local mockup mode: Load locally approved reviews from LocalStorage
        const localApproved = JSON.parse(localStorage.getItem('approved_reviews')) || [];
        if (localApproved.length > 0) {
            renderReviewCards(localApproved);
        } else {
            renderEmptyReviewsPlaceholder();
        }
    }
}

function renderEmptyReviewsPlaceholder() {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = `
        <div class="empty-reviews-placeholder glass-panel" style="grid-column: 1 / -1; text-align: center; padding: 3rem; width: 100%;">
            <div class="icon-box" style="margin: 0 auto 1.5rem auto; font-size: 2.5rem;"><i class="fa-regular fa-comments"></i></div>
            <h3>Тут поки що немає відгуків</h3>
            <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 500px; margin-left: auto; margin-right: auto;">
                Ваш відгук може стати першим! Поділіться своїм досвідом співпраці з BELLONIX ALM.
            </p>
        </div>
    `;
}

function renderReviewCards(reviews) {
    const container = document.getElementById('reviewsContainer');
    reviews.forEach(rev => {
        const starsHtml = '<i class="fa-solid fa-star"></i>'.repeat(rev.rating) + 
                          '<i class="fa-regular fa-star"></i>'.repeat(5 - rev.rating);
                          
        const card = document.createElement('div');
        card.className = 'review-card glass-panel';
        card.innerHTML = `
            <div class="stars">${starsHtml}</div>
            <p class="review-text">"${rev.text}"</p>
            <div class="reviewer">
                <div class="reviewer-avatar"><i class="fa-solid fa-user-tie"></i></div>
                <div class="reviewer-info">
                    <span class="name">${rev.name}</span>
                    <span class="pos">${rev.company}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('revName').value;
    const company = document.getElementById('revCompany').value;
    const text = document.getElementById('revText').value;
    
    // Get rating value from hidden input
    const rating = parseInt(document.getElementById('revRating').value) || 5;
    
    const payload = { name, company, rating, text };
    
    if (WEBAPP_URL) {
        // Submit review to Google WebApp (which logs it and sends alert to admin bot)
        fetch(WEBAPP_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                showToast("Дякуємо! Ваш відгук надіслано на модерацію. Після схвалення він з'явиться на сайті.");
                closeReviewModal();
            } else {
                showToast("Помилка надсилання. Спробуйте пізніше.");
            }
        })
        .catch(err => {
            console.log("Error submitting review:", err);
            showToast("Помилка надсилання. Спробуйте пізніше.");
        });
    } else {
        // Mockup local mode: Simulate moderation flow using local storage
        const pendingReviews = JSON.parse(localStorage.getItem('pending_reviews')) || [];
        const newId = "rev_" + new Date().getTime();
        pendingReviews.push({ id: newId, ...payload });
        localStorage.setItem('pending_reviews', JSON.stringify(pendingReviews));
        
        // Show success alert
        showToast("Відгук надіслано на модерацію! (Схвалити відгук можна в Telegram-боті).");
        
        // Simulate bot callback internally for sandbox demo integration
        setTimeout(() => {
            if (window.parent && typeof window.parent.simulateBotReviewAlert === 'function') {
                window.parent.simulateBotReviewAlert(newId, name, company, rating, text);
            } else {
                // If not in iframe, simulate bot logic internally
                console.log(`[DEMO_MODE] Новий відгук чекає модерації: ID=${newId}`);
            }
        }, 1000);
        
        closeReviewModal();
    }
}

// Interactive Star Rating Logic
window.setRatingValue = function(clickValue) {
    const ratingInput = document.getElementById('revRating');
    if (ratingInput) ratingInput.value = clickValue;
    
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach(s => {
        const val = parseInt(s.getAttribute('data-value'));
        if (val <= clickValue) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
};

function initStarRating() {
    const stars = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('revRating');
    if (!stars.length || !ratingInput) return;

    stars.forEach(star => {
        // Hover handler
        star.onmouseenter = () => {
            const hoverValue = parseInt(star.getAttribute('data-value'));
            stars.forEach(s => {
                const val = parseInt(s.getAttribute('data-value'));
                if (val <= hoverValue) {
                    s.classList.add('hover-active');
                } else {
                    s.classList.remove('hover-active');
                }
            });
        };

        // Hover leave handler
        star.onmouseleave = () => {
            stars.forEach(s => s.classList.remove('hover-active'));
        };
    });
}

function resetStarRating() {
    const stars = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('revRating');
    if (ratingInput) ratingInput.value = 5;
    
    stars.forEach(s => {
        s.classList.add('active');
        s.classList.remove('hover-active');
    });
}

// Floating contact widget toggles
function toggleContactWidget() {
    const menu = document.getElementById('contactWidgetMenu');
    if (menu) menu.classList.toggle('active');
}

// Close contact widget menu if clicked outside
window.addEventListener('click', (e) => {
    const menu = document.getElementById('contactWidgetMenu');
    const trigger = document.getElementById('contactWidgetTrigger');
    if (menu && menu.classList.contains('active')) {
        if (!menu.contains(e.target) && !trigger.contains(e.target)) {
            menu.classList.remove('active');
        }
    }
});

// --- Invoice Modal & Billing Logic ---
window.openInvoiceModal = function(productKey) {
    const modal = document.getElementById('invoiceModal');
    const prodSelect = document.getElementById('invProductSelect');
    if (prodSelect && productKey) {
        prodSelect.value = productKey;
    }
    updateInvoiceCalculation();
    if (modal) modal.classList.add('active');
};

window.closeInvoiceModal = function() {
    const modal = document.getElementById('invoiceModal');
    if (modal) modal.classList.remove('active');
    resetInvoiceForm();
};

window.updateInvoiceCalculation = function() {
    const periodSelect = document.getElementById('invPeriodSelect');
    const totalSpan = document.getElementById('invTotalAmount');
    if (!periodSelect || !totalSpan) return;

    const val = periodSelect.value;
    let priceText = "100 грн";
    if (val === '1m') priceText = "100 грн";
    if (val === '3m') priceText = "250 грн";
    if (val === '1y') priceText = "850 грн";

    totalSpan.textContent = priceText;
};

window.handleGenerateInvoice = function(e) {
    e.preventDefault();

    const productSelect = document.getElementById('invProductSelect');
    const periodSelect = document.getElementById('invPeriodSelect');
    const payerNameInput = document.getElementById('invPayerName');
    const taxCodeInput = document.getElementById('invTaxCode');

    const prodName = productSelect.value === 'knock-knock' ? 'Командний Бот-Нагадувач' : 'B2B-Лідогенератор';
    const periodText = periodSelect.options[periodSelect.selectedIndex].text.split('—')[0].trim();
    const priceText = document.getElementById('invTotalAmount').textContent;

    const payerName = payerNameInput.value.trim() || 'Приватна особа';
    const taxCode = taxCodeInput.value.trim();
    const taxCodeDisplay = taxCode ? ` (${taxCode})` : '';

    // Date & Bill Number
    const today = new Date();
    const dateStr = today.toLocaleDateString('uk-UA');
    const invNumber = 'SF-' + today.getFullYear() + String(today.getMonth()+1).padStart(2,'0') + String(today.getDate()).padStart(2,'0') + '-' + Math.floor(100 + Math.random()*900);

    // Update Result View Elements
    document.getElementById('resInvNumber').textContent = invNumber;
    document.getElementById('resInvDate').textContent = dateStr;
    document.getElementById('resPayerText').textContent = payerName;
    document.getElementById('resTaxCodeText').textContent = taxCode ? taxCode : 'Фізична особа';
    document.getElementById('resItemName').textContent = `Підписка: ${prodName} (${periodText})`;
    document.getElementById('resItemPrice').textContent = priceText;
    document.getElementById('resPurposeText').textContent = `Призначення: Оплата підписки на ${prodName} (${periodText}), без ПДВ. Платник: ${payerName}${taxCodeDisplay}`;

    // QR Code Generation
    const iban = "UA893220010000026007012345678";
    const amountClean = priceText.replace(/\D/g, '');
    const qrPayload = `ST00012|Name=ФОП Беллонін М.В.|IBAN=${iban}|CB=305299|Sum=${amountClean}00|Purpose=Оплата підписки ${prodName} (${invNumber})`;
    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrPayload)}&size=200`;
    
    document.getElementById('resQrImage').src = qrUrl;

    // Switch view
    document.getElementById('invoiceForm').style.display = 'none';
    document.getElementById('invoiceResultView').style.display = 'block';

    if (typeof showToast === 'function') {
        showToast("Рахунок та QR-код успішно сформовано!");
    }
};

window.resetInvoiceForm = function() {
    const form = document.getElementById('invoiceForm');
    const resView = document.getElementById('invoiceResultView');
    if (form) form.style.display = 'block';
    if (resView) resView.style.display = 'none';
};

window.copyIbanToClipboard = function() {
    const ibanText = document.getElementById('resIbanCode').textContent;
    navigator.clipboard.writeText(ibanText).then(() => {
        if (typeof showToast === 'function') showToast("IBAN скопійовано у буфер обміну!");
    }).catch(() => {
        alert("IBAN: " + ibanText);
    });
};

window.printInvoice = function() {
    window.print();
};

