// Generate random stars
function generateStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    generateStars();
    updateDate();
    loadUserCount();
    checkUserSession();
});

// Update date
function updateDate() {
    const date = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    document.getElementById('updateDate').textContent = date.toLocaleDateString('ru-RU', options);
}

// Database functions using real API

// Load user count from API
async function loadUserCount() {
    try {
        const stats = await api.getStats();
        document.getElementById('userCount').textContent = stats.totalUsers;
    } catch (error) {
        console.error('Error loading user count:', error);
        document.getElementById('userCount').textContent = '0';
    }
}

// Modal functions
function openLogin() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
}

function openRegister() {
    document.getElementById('registerModal').style.display = 'flex';
}

function closeRegister() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('loginError');
    
    try {
        const result = await api.login(username, password);
        
        closeLogin();
        showUserPanel(result.user);
        updateNavigation(result.user);
        
        // Clear form
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    } catch (error) {
        console.error('Login error:', error);
        errorMsg.textContent = error.message || 'Ошибка входа';
        errorMsg.style.display = 'block';
    }
}

// Handle register
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const errorMsg = document.getElementById('registerError');
    
    try {
        const result = await api.register(username, email, password, passwordConfirm);
        
        closeRegister();
        showUserPanel(result.user);
        updateNavigation(result.user);
        loadUserCount();
        
        // Clear form
        document.getElementById('registerUsername').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerPasswordConfirm').value = '';
    } catch (error) {
        console.error('Register error:', error);
        errorMsg.textContent = error.message || 'Ошибка регистрации';
        errorMsg.style.display = 'block';
    }
}

// Show user panel
function showUserPanel(user) {
    const panel = document.getElementById('userPanel');
    document.getElementById('welcomeUser').textContent = user.username;
    document.getElementById('licenseKey').textContent = user.licenseKey;
    
    const lastLogin = new Date(user.lastLogin);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    document.getElementById('lastLogin').textContent = lastLogin.toLocaleDateString('ru-RU', options);
    
    panel.style.display = 'block';
}

// Update navigation
function updateNavigation(user) {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userInfoNav').style.display = 'flex';
    document.getElementById('navUsername').textContent = user.username;
}

// Logout
async function logout() {
    await api.logout();
    document.getElementById('userPanel').style.display = 'none';
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userInfoNav').style.display = 'none';
}

// Check user session
function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        showUserPanel(user);
        updateNavigation(user);
    }
}

// Copy license key
function copyLicense() {
    const licenseKey = document.getElementById('licenseKey').textContent;
    navigator.clipboard.writeText(licenseKey).then(() => {
        alert('Лицензионный ключ скопирован в буфер обмена!');
    });
}

// Handle download
function handleDownload(event) {
    event.preventDefault();
    downloadWakaClient();
}

// Admin panel (placeholder)
function openAdminPanel() {
    const users = api.getUsers();
    const downloads = api.getDownloads();
    alert(`Админ панель:\n${users.length} пользователей\n${downloads.length} загрузок`);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target === loginModal) {
        closeLogin();
    }
    if (event.target === registerModal) {
        closeRegister();
    }
}
