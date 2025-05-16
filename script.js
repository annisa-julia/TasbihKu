// // VARIABEL GLOBAL
let count = 0;
let target = 33;
let currentDzikir = "Subhanallah";
let stats = {
    today: 0,
    week: 0,
    total: 0,
    lastDate: '',
    history: []
};

// // ELEMEN DOM
const counterElement = document.getElementById('counter');
const targetInput = document.getElementById('target-input');
const targetDisplay = document.getElementById('target-display');
const progressBar = document.getElementById('progress-bar');
const notification = document.getElementById('notification');
const dhikrWrapper = document.querySelector('.dhikr-wrapper');
const beadsContainer = document.getElementById('beads-container');
const dzikirTypeSelect = document.getElementById('dzikir-type');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const dzikirListContainer = document.getElementById('dzikirListContainer');
const todayCountElement = document.getElementById('todayCount');
const todayDateElement = document.getElementById('todayDate');
const weekCountElement = document.getElementById('weekCount');
const totalCountElement = document.getElementById('totalCount');
const recentHistory = document.getElementById('recentHistory');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-menu a');

// // INISIALISASI APLIKASI
function init() {
    loadFromStorage();
    createBeads();
    setupEventListeners();
    updateDisplay();
    renderDzikirList();
    renderStats();
    setupNavigation();
}

// // BUAT VISUALISASI MANIK-MANIK
function createBeads() {
    beadsContainer.innerHTML = '';
    
    for (let i = 0; i < 33; i++) {
        const bead = document.createElement('div');
        bead.style.setProperty('--i', i);
        bead.dataset.index = i;
        beadsContainer.appendChild(bead);
    }
}

// // SETUP NAVIGASI
function setupNavigation() {
    // Toggle menu mobile
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.innerHTML = navMenu.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Navigasi section
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            showSection(targetId);
            
            // Tutup menu mobile jika terbuka
            navMenu.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('hidden-section');
    });
    
    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden-section');
        targetSection.classList.add('active-section');
    }
}

// // SETUP EVENT LISTENERS
function setupEventListeners() {
    // Klik tasbih
    document.querySelector('.dhikr-container').addEventListener('click', () => {
        if (count < target) {
            incrementCounter();
        }
    });
    
    // Set target
    document.getElementById('set-target').addEventListener('click', setTarget);
    
    // Reset counter
    document.getElementById('reset-btn').addEventListener('click', confirmReset);
    
    // Dropdown dzikir
    dzikirTypeSelect.addEventListener('change', () => {
        currentDzikir = dzikirTypeSelect.value;
        showNotification(`Dzikir diubah ke: ${currentDzikir}`);
        saveToStorage();
    });
}

// // FUNGSI UTAMA PENGHITUNGAN
function incrementCounter() {
    count++;
    
    // Update statistik
    updateStats();
    
    // Animasi putar
    const rotationDegree = count * (360 / 33);
    dhikrWrapper.style.transform = `rotate(${rotationDegree}deg)`;
    
    // Highlight manik aktif
    const activeIndex = (count - 1) % 33;
    document.querySelectorAll('.beads div').forEach((bead, index) => {
        if (index === activeIndex) {
            bead.classList.add('active');
            setTimeout(() => bead.classList.remove('active'), 300);
        }
    });
    
    // Notifikasi jika target tercapai
    if (count === target) {
        showNotification(`Target ${target} ${currentDzikir} telah tercapai!`);
    }
    
    updateDisplay();
    saveToStorage();
}

function setTarget() {
    const newTarget = parseInt(targetInput.value);
    if (newTarget > 0) {
        target = newTarget;
        targetDisplay.textContent = target;
        showNotification(`Target diubah menjadi ${target}`);
        updateDisplay();
        saveToStorage();
    } else {
        showNotification('Target harus lebih dari 0', 'error');
    }
}

function confirmReset() {
    if (confirm('Apakah Anda yakin ingin mereset hitungan?')) {
        count = 0;
        dhikrWrapper.style.transform = 'rotate(0deg)';
        updateDisplay();
        saveToStorage();
        showNotification('Hitungan telah direset');
    }
}

// // FUNGSI STATISTIK
function updateStats() {
    const now = new Date();
    const todayDate = now.toLocaleDateString('id-ID');
    const currentTime = now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Update total
    stats.total++;
    
    // Reset counter harian jika ganti tanggal
    if (stats.lastDate !== todayDate) {
        stats.today = 0;
        stats.lastDate = todayDate;
    }
    stats.today++;
    
    // Update history
    stats.history.push({
        date: todayDate,
        time: currentTime,
        dzikir: currentDzikir,
        count: 1
    });
    
    // Hitung total mingguan
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    stats.week = stats.history
        .filter(entry => {
            const entryDate = new Date(entry.date.split('/').reverse().join('-'));
            return entryDate >= oneWeekAgo;
        })
        .reduce((sum, entry) => sum + entry.count, 0);
    
    renderStats();
}

function renderStats() {
    // Update tampilan
    todayCountElement.textContent = stats.today;
    todayDateElement.textContent = stats.lastDate || 'Belum ada aktivitas';
    weekCountElement.textContent = stats.week;
    totalCountElement.textContent = stats.total;
    
    // Update riwayat
    recentHistory.innerHTML = '';
    const lastEntries = stats.history.slice(-5).reverse();
    
    lastEntries.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${entry.dzikir}</span>
            <span>${entry.date} ${entry.time}</span>
        `;
        recentHistory.appendChild(li);
    });
}

// // RENDER DAFTAR DZIKIR
function renderDzikirList() {
    dzikirListContainer.innerHTML = '';
    
    const dzikirData = [
        {
            title: "Subhanallah",
            description: "Maha Suci Allah (dibaca 33x)",
            hadith: "Rasulullah SAW bersabda: 'Barangsiapa mengucapkan Subhanallah 100x dalam sehari, maka dihapuskan dosanya meskipun sebanyak buih di lautan.' (HR. Muslim)"
        },
        {
            title: "Alhamdulillah",
            description: "Segala puji bagi Allah (dibaca 33x)",
            hadith: "Rasulullah SAW bersabda: 'Ucapan Alhamdulillah memenuhi timbangan (amal baik).' (HR. Muslim)"
        },
        {
            title: "Allahu Akbar",
            description: "Allah Maha Besar (dibaca 33x)",
            hadith: "Rasulullah SAW bersabda: 'Allahu Akbar adalah penggalan kalimat yang paling dicintai Allah.' (HR. Tirmidzi)"
        },
        {
            title: "Astaghfirullah",
            description: "Aku memohon ampun kepada Allah",
            hadith: "Rasulullah SAW bersabda: 'Barangsiapa yang membiasakan diri beristighfar, Allah akan memberikan jalan keluar dari setiap kesulitan.' (HR. Abu Daud)"
        },
        {
            title: "Laa ilaaha illallah",
            description: "Tiada Tuhan selain Allah",
            hadith: "Rasulullah SAW bersabda: 'Barangsiapa mengucapkan Laa ilaaha illallah dengan ikhlas, maka akan dibukakan baginya pintu-pintu langit.' (HR. Tirmidzi)"
        }
    ];
    
    dzikirData.forEach(dzikir => {
        const card = document.createElement('div');
        card.className = 'dzikir-card';
        card.innerHTML = `
            <h3>${dzikir.title}</h3>
            <p>${dzikir.description}</p>
            <p class="hadith">${dzikir.hadith}</p>
        `;
        dzikirListContainer.appendChild(card);
    });
}

// // UPDATE TAMPILAN
function updateDisplay() {
    counterElement.textContent = count;
    const progress = Math.min((count / target) * 100, 100);
    progressBar.style.width = `${progress}%`;
    
    // Update warna progress bar
    progressBar.style.backgroundColor = progress >= 100 ? '#4caf50' : 'var(--primary)';
    
    // Nonaktifkan klik jika mencapai target
    document.querySelector('.dhikr-container').style.cursor = count >= target ? 'default' : 'pointer';
}

// // NOTIFIKASI
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// // LOCAL STORAGE
function saveToStorage() {
    const data = {
        count,
        target,
        currentDzikir,
        stats
    };
    localStorage.setItem('tasbihKuData', JSON.stringify(data));
}

function loadFromStorage() {
    const savedData = localStorage.getItem('tasbihKuData');
    if (savedData) {
        const data = JSON.parse(savedData);
        count = data.count || 0;
        target = data.target || 33;
        currentDzikir = data.currentDzikir || "Subhanallah";
        stats = data.stats || {
            today: 0,
            week: 0,
            total: 0,
            lastDate: '',
            history: []
        };
        
        // Update UI
        targetInput.value = target;
        targetDisplay.textContent = target;
        dzikirTypeSelect.value = currentDzikir;
        
        // Set rotasi awal
        const rotationDegree = count * (360 / 33);
        dhikrWrapper.style.transform = `rotate(${rotationDegree}deg)`;
    }
}

// // JALANKAN APLIKASI
document.addEventListener('DOMContentLoaded', init);
