var firebaseConfig = {
    apiKey: "AIzaSyDuF6bdqprddsE871GuOablXPYqXI_HJxc",
    authDomain: "hexahoney-96aed.firebaseapp.com",
    projectId: "hexahoney-96aed",
    storageBucket: "hexahoney-96aed.firebasestorage.app",
    messagingSenderId: "700458850837",
    appId: "1:700458850837:web:0eb4fca98a5f4acc2d0c1c",
    measurementId: "G-MQGKK9709H"
};
const dynamicPage = document.getElementById("dynamicPage");
dynamicPage.style.display = "none";

firebase.initializeApp(firebaseConfig);

// IMPORTANT: expose it globally for fragment scripts
window.db = firebase.firestore();

function loadMessagesPage() {
    const dynamic = document.getElementById("dynamicPage");
    const dashboard = document.getElementById("dashboardBody");

    dashboard.style.display = "none";
    dynamic.style.display = "block";

    fetch("contact-submissions.html")
        .then(r => r.text())
        .then(html => {
            dynamic.innerHTML = html;

            const scripts = [...dynamic.querySelectorAll("script")];

            scripts.forEach(s => {
                const tag = document.createElement("script");

                if (s.src) {
                    tag.src = s.src + "?v=" + Date.now();
                } else {
                    tag.textContent = s.textContent;
                }

                document.body.appendChild(tag);
                s.remove();
            });
        })
        .catch(err => {
            dynamic.innerHTML = "Failed to load Messages page";
        });
}

function showLoadError(pageName, container, error) {
    console.error(error);
    container.innerHTML = `
    <div style="padding:40px;text-align:center;color:#b00020;">
        <i class="fas fa-exclamation-circle" style="font-size:32px;margin-bottom:10px;"></i>
        <h3 style="margin-bottom:10px;">Failed to load ${pageName} page</h3>
        <p style="color:#666;margin-bottom:20px;">${error.message || "Unknown error"}</p>
        <button onclick="location.reload()" 
            style="padding:10px 18px;background:black;color:white;border:none;border-radius:6px;cursor:pointer;">
            Reload Dashboard
        </button>
    </div>`;
}


function loadPromoPage() {
    const dynamic = document.getElementById("dynamicPage");
    const dashboard = document.getElementById("dashboardBody");

    dashboard.style.display = "none";
    dynamic.style.display = "block";

    fetch("promo-codes.html")
        .then(r => r.text())
        .then(html => {
            dynamic.innerHTML = html;

            const scripts = [...dynamic.querySelectorAll("script")];

            scripts.forEach(s => {
                const tag = document.createElement("script");

                if (s.src) {
                    tag.src = s.src + "?v=" + Date.now();
                } else {
                    tag.textContent = s.textContent;
                }

                document.body.appendChild(tag);
                s.remove();
            });
        })
        .catch(err => {
            dynamic.innerHTML = "Failed to load Promo Codes page";
        });
}


function initDashboard() {
    setupEventListeners();
    updateDateWidget();
    initCalendar();
    setupMobileMenu();
    
    const promoItem = document.getElementById("menuPromo");
if (promoItem) promoItem.addEventListener("click", loadPromoPage);

    const msgItem = document.getElementById("menuMessages");
    if (msgItem) msgItem.addEventListener("click", loadMessagesPage);
}

function setupEventListeners() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            if (window.innerWidth <= 992) closeMobileMenu();
        });
    });

    document.getElementById('prev-month').addEventListener('click', function () {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentMonth, currentYear);
    });

    document.getElementById('next-month').addEventListener('click', function () {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentMonth, currentYear);
    });
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    sidebarOverlay.addEventListener('click', closeMobileMenu);
}

function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeMobileMenu() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

function updateDateWidget() {
    const now = new Date();
    document.getElementById('current-day').textContent = now.getDate();
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    document.getElementById('current-day-name').textContent = dayNames[now.getDay()] + ",";
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('current-month-year').textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function initCalendar() {
    renderCalendar(currentMonth, currentYear);
}

function renderCalendar(month, year) {
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById('calendar-month').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';

    for (let i = firstDay - 1; i >= 0; i--) {
        const d = document.createElement('div');
        d.className = 'calendar-day other-month';
        d.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(d);
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const d = document.createElement('div');
        d.className = 'calendar-day';
        d.textContent = i;
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            d.classList.add('today');
        }
        calendarDays.appendChild(d);
    }

    const totalCells = 42;
    const remaining = totalCells - (firstDay + daysInMonth);
    for (let i = 1; i <= remaining; i++) {
        const d = document.createElement('div');
        d.className = 'calendar-day other-month';
        d.textContent = i;
        calendarDays.appendChild(d);
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);
