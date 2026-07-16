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
    const logContent = document.getElementById('logContent');
    const chatContainer = document.getElementById('chatMessages');
    const btnLogistics = document.getElementById('simModeLogistics');
    const btnFop = document.getElementById('simModeFop');
    
    // Toggle active class style on switcher buttons
    if (mode === 'logistics') {
        btnLogistics.className = 'btn-primary';
        btnFop.className = 'btn-secondary';
    } else {
        btnLogistics.className = 'btn-secondary';
        btnFop.className = 'btn-primary';
    }
    
    // Clear chat and logs
    chatContainer.innerHTML = '';
    logContent.innerHTML = '';
    
    const dateDiv = document.createElement('div');
    dateDiv.className = 'chat-date';
    dateDiv.innerText = isEn ? 'Today' : 'Сьогодні';
    chatContainer.appendChild(dateDiv);
    
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'message incoming';
    
    // Configure markup based on mode
    if (mode === 'logistics') {
        // Logistics Mode
        welcomeDiv.innerText = isEn 
            ? "Hello! You are connected to the Bellonix ALM ecosystem. Choose an action on the keyboard below to start the demo."
            : "Вітаю! Ви на зв'язку з системою Bellonix ALM. Оберіть дію на панелі нижче для початку роботи.";
        chatContainer.appendChild(welcomeDiv);
        
        // Update stats labels
        document.getElementById('sandboxStat1Lbl').innerText = isEn ? 'Active Trips' : 'Статус рейсів';
        document.getElementById('sandboxStat2Lbl').innerText = isEn ? 'Completed Today' : 'Виконано за день';
        document.getElementById('sandboxStat3Lbl').innerText = isEn ? 'Fuel Spend' : 'Витрати на паливо';
        document.getElementById('sandboxStat4Lbl').innerText = isEn ? 'System Alerts' : 'Сповіщення';
        
        // Update stats values
        document.getElementById('dashTripsVal').innerText = isEn ? `${state.activeTrips} active` : `${state.activeTrips} активних`;
        document.getElementById('dashDeliveredVal').innerText = isEn ? `${state.deliveredToday} orders` : `${state.deliveredToday} замовлень`;
        document.getElementById('dashFuelVal').innerText = `${state.fuelExpenses.toLocaleString()} ₴`;
        
        const statusEl = document.getElementById('dashStatusVal');
        statusEl.innerText = isEn ? 'Normal' : 'Норма';
        statusEl.className = 'val text-green';
        
        // Update chart header and log header
        document.getElementById('sandboxChartHeader').innerText = isEn ? 'Hourly Deliveries Performance' : 'Статистика доставок за годинами';
        document.getElementById('sandboxLogHeader').innerText = isEn ? 'Real-time Event Stream (Telegram API Logs)' : 'Живий лог подій системи (Telegram API)';
        
        // Re-inject keyboard buttons
        const keyboard = document.querySelector('.bot-keyboard');
        keyboard.innerHTML = `
            <button class="kbd-btn" onclick="simulateBotAction('new_trip')"><i class="fa-solid fa-route"></i> ${isEn ? 'Start Trip' : 'Почати рейс'}</button>
            <button class="kbd-btn" onclick="simulateBotAction('delivered')"><i class="fa-solid fa-clipboard-check"></i> ${isEn ? 'Delivered!' : 'Доставлено!'}</button>
            <button class="kbd-btn" onclick="simulateBotAction('refuel')"><i class="fa-solid fa-gas-pump"></i> ${isEn ? 'Refuel' : 'Заправка'}</button>
            <button class="kbd-btn" onclick="simulateBotAction('issue')"><i class="fa-solid fa-triangle-exclamation"></i> ${isEn ? 'Issue Alert' : 'Проблема'}</button>
        `;
        
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
        // FOP Invoicing Mode
        welcomeDiv.innerText = isEn 
            ? "FOP Billing Portal initialized. Generate document draft below or trigger bank sync test."
            : "Кабінет ФОП активовано. Створіть чернетку документа нижче або запустіть синхронізацію з банком.";
        chatContainer.appendChild(welcomeDiv);
        
        // Update stats labels
        document.getElementById('sandboxStat1Lbl').innerText = isEn ? 'Unpaid Invoices' : 'Неоплачено рахунків';
        document.getElementById('sandboxStat2Lbl').innerText = isEn ? 'Total Bills Generated' : 'Всього рахунків';
        document.getElementById('sandboxStat3Lbl').innerText = isEn ? 'Billed Amount (YTD)' : 'Загальний обіг';
        document.getElementById('sandboxStat4Lbl').innerText = isEn ? 'Portal Connection' : 'Зв\'язок з банком';
        
        // Update stats values
        document.getElementById('dashTripsVal').innerText = isEn ? `${state.unpaidInvoices} pending` : `${state.unpaidInvoices} очікують`;
        document.getElementById('dashDeliveredVal').innerText = isEn ? `${state.invoicesCount} invoices` : `${state.invoicesCount} документів`;
        document.getElementById('dashFuelVal').innerText = `${state.totalBilled.toLocaleString()} ₴`;
        
        const statusEl = document.getElementById('dashStatusVal');
        statusEl.innerText = isEn ? 'Synced' : 'Синхронізовано';
        statusEl.className = 'val text-green';
        
        // Update chart header and log header
        document.getElementById('sandboxChartHeader').innerText = isEn ? 'Monthly Sales Invoicing (₴)' : 'Динаміка виставлених рахунків (₴)';
        document.getElementById('sandboxLogHeader').innerText = isEn ? 'Sole Trader System Transaction Log (Bank APIs)' : 'Системний лог транзакцій ФОП (API Банків)';
        
        // Re-inject keyboard buttons
        const keyboard = document.querySelector('.bot-keyboard');
        keyboard.innerHTML = `
            <button class="kbd-btn" onclick="simulateBotAction('create_invoice')"><i class="fa-solid fa-file-signature"></i> ${isEn ? 'Create Invoice' : 'Створити Рахунок'}</button>
            <button class="kbd-btn" onclick="simulateBotAction('simulate_payment')"><i class="fa-solid fa-money-bill-transfer"></i> ${isEn ? 'Log Payment' : 'Оплата рахунку'}</button>
            <button class="kbd-btn" onclick="simulateBotAction('bank_sync')"><i class="fa-solid fa-rotate"></i> ${isEn ? 'Sync Monobank' : 'Синхронізувати ФОП'}</button>
            <button class="kbd-btn" onclick="simulateBotAction('generate_act')"><i class="fa-solid fa-file-contract"></i> ${isEn ? 'Create Act' : 'Зробити Акт'}</button>
        `;
        
        const initialLog = document.createElement('div');
        initialLog.className = 'log-row info';
        initialLog.innerText = isEn ? '[PORTAL] Billing portal initialized. Awaiting API trigger commands...' : '[PORTAL] Систему обліку активовано. Очікування дій від користувача...';
        logContent.appendChild(initialLog);
        
        // Rebuild Chart
        sandboxChart.data.datasets[0].label = isEn ? 'Invoiced Revenue (₴)' : 'Сума рахунків (₴)';
        sandboxChart.data.labels = isEn ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] : ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'];
        sandboxChart.data.datasets[0].data = [...state.fopChartData];
        sandboxChart.update();
    }
}

// Interactive Sandbox Actions Simulator
function simulateBotAction(action) {
    const chatContainer = document.getElementById('chatMessages');
    const logContent = document.getElementById('logContent');
    const isEn = document.documentElement.lang === 'en';
    
    let outgoingMsg = '';
    let responseMsg = '';
    let logMsg = '';
    let logType = 'info';

    switch (action) {
        // LOGISTICS ACTIONS
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

        // FOP INVOICING ACTIONS
        case 'create_invoice':
            state.invoicesCount += 1;
            state.unpaidInvoices += 1;
            outgoingMsg = isEn ? "📝 Create invoice: Client LLC 'Vanguard', amount 12,500 ₴" : "📝 Створити рахунок: Клієнт ТОВ 'Авангард', сума 12,500 ₴";
            responseMsg = isEn
                ? `✅ Invoice #INV-2401 drafted. PDF attachment dispatched to client's Telegram chat.`
                : "✅ Рахунок #INV-2401 згенеровано. PDF-версію надіслано клієнту в Telegram-чат.";
            logMsg = isEn
                ? `[BILLING] Drafted invoice INV-2401. Current unpaid count: ${state.unpaidInvoices}. Database saved.`
                : `[BILLING] Створено рахунок INV-2401. Очікуємо оплати. Загалом рахунків: ${state.invoicesCount}.`;
            logType = 'info';
            
            document.getElementById('dashTripsVal').innerText = isEn ? `${state.unpaidInvoices} pending` : `${state.unpaidInvoices} очікують`;
            document.getElementById('dashDeliveredVal').innerText = isEn ? `${state.invoicesCount} invoices` : `${state.invoicesCount} документів`;
            break;
            
        case 'simulate_payment':
            if (state.unpaidInvoices > 0) {
                state.unpaidInvoices -= 1;
                state.totalBilled += 12500;
                state.fopChartData[state.fopChartData.length - 1] += 12500;
                
                outgoingMsg = isEn ? "💰 Simulate Monobank client payout notification" : "💰 Симуляція сповіщення Monobank про оплату рахунку";
                responseMsg = isEn
                    ? "🎉 Payout of 12,500 ₴ verified. Invoice marked as 'PAID'. Customer thank-you message sent."
                    : "🎉 Отримано оплату 12 500 ₴. Рахунок позначено як 'ОПЛАЧЕНО'. Клієнту надіслано чек.";
                logMsg = isEn
                    ? `[MONOBANK_API] Inflow transactions logged. Net volume: ${state.totalBilled.toLocaleString()} ₴. Chart updated.`
                    : `[MONOBANK_API] Отримано виписку від банку. Оплата зафіксована. Загальний оборот: ${state.totalBilled.toLocaleString()} ₴`;
                logType = 'success';
                
                document.getElementById('dashTripsVal').innerText = isEn ? `${state.unpaidInvoices} pending` : `${state.unpaidInvoices} очікують`;
                document.getElementById('dashFuelVal').innerText = `${state.totalBilled.toLocaleString()} ₴`;
                sandboxChart.data.datasets[0].data = [...state.fopChartData];
                sandboxChart.update();
            } else {
                outgoingMsg = isEn ? "💰 Request payment sync status" : "💰 Запит статусу оплат";
                responseMsg = isEn ? "⚠️ No pending unpaid bills found in database." : "⚠️ Усі виставлені рахунки наразі оплачені.";
                logMsg = "[SYSTEM] Skipped payout trigger. Zero unpaid invoices.";
                logType = 'warn';
            }
            break;
            
        case 'bank_sync':
            outgoingMsg = isEn ? "🔄 Sync Monobank statement log" : "🔄 Синхронізувати транзакції з банком";
            responseMsg = isEn ? "✅ Account statement sync complete. Checked transactions for past 24 hours." : "✅ Виписку оновлено. Звірено транзакції за останні 24 години.";
            logMsg = isEn ? "[BANK_API] Connection to Monobank API active. All status codes returned 200 OK." : "[BANK_API] З'єднання з API банку активне. Всі транзакції синхронізовано.";
            logType = 'info';
            break;
            
        case 'generate_act':
            state.invoicesCount += 1;
            outgoingMsg = isEn ? "📄 Create service act for INV-2401" : "📄 Зробити акт виконаних робіт для INV-2401";
            responseMsg = isEn ? "✅ Service Act compiled. Dispatched to client for digital sign (Diia / Paper)." : "✅ Акт виконаних робіт сформовано та відправлено замовнику на підпис.";
            logMsg = isEn ? "[PORTAL] Created Service Act for Vanguard. Document registered." : "[PORTAL] Згенеровано Акт виконаних робіт для ТОВ 'Авангард'.";
            logType = 'success';
            document.getElementById('dashDeliveredVal').innerText = isEn ? `${state.invoicesCount} invoices` : `${state.invoicesCount} документів`;
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
    if (hasFopSaaS) saasCost += 25;

    let resultText = "";
    if (cost > 0 && saasCost > 0) {
        resultText = `${cost} $ + ${saasCost} $/міс`;
    } else if (saasCost > 0) {
        resultText = `${saasCost} $/міс`;
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
