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

// Simulated database (localStorage)
const db = {
    users: JSON.parse(localStorage.getItem('users')) || [],
    
    addUser(username, email, password) {
        const user = {
            id: Date.now(),
            username,
            email,
            password: this.hashPassword(password),
            licenseKey: this.generateLicenseKey(),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            premium: true
        };
        this.users.push(user);
        this.save();
        return user;
    },
    
    findUser(username) {
        return this.users.find(u => u.username === username);
    },
    
    findUserByEmail(email) {
        return this.users.find(u => u.email === email);
    },
    
    updateLastLogin(username) {
        const user = this.findUser(username);
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.save();
        }
    },
    
    hashPassword(password) {
        // Simple hash (in production use bcrypt or similar)
        return btoa(password);
    },
    
    verifyPassword(password, hash) {
        return btoa(password) === hash;
    },
    
    generateLicenseKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 5; j++) {
                key += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if (i < 3) key += '-';
        }
        return key;
    },
    
    save() {
        localStorage.setItem('users', JSON.stringify(this.users));
    },
    
    getUserCount() {
        return this.users.length;
    }
};

// Load user count
function loadUserCount() {
    document.getElementById('userCount').textContent = db.getUserCount();
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
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('loginError');
    
    const user = db.findUser(username);
    
    if (!user) {
        errorMsg.textContent = 'Пользователь не найден';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (!db.verifyPassword(password, user.password)) {
        errorMsg.textContent = 'Неверный пароль';
        errorMsg.style.display = 'block';
        return;
    }
    
    // Login successful
    db.updateLastLogin(username);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    closeLogin();
    showUserPanel(user);
    updateNavigation(user);
    
    // Clear form
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// Handle register
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const errorMsg = document.getElementById('registerError');
    
    // Validation
    if (username.length < 3) {
        errorMsg.textContent = 'Имя пользователя должно быть не менее 3 символов';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (db.findUser(username)) {
        errorMsg.textContent = 'Пользователь с таким именем уже существует';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (db.findUserByEmail(email)) {
        errorMsg.textContent = 'Email уже зарегистрирован';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (password !== passwordConfirm) {
        errorMsg.textContent = 'Пароли не совпадают';
        errorMsg.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorMsg.textContent = 'Пароль должен быть не менее 6 символов';
        errorMsg.style.display = 'block';
        return;
    }
    
    // Create user
    const user = db.addUser(username, email, password);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    closeRegister();
    showUserPanel(user);
    updateNavigation(user);
    loadUserCount();
    
    // Clear form
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerPasswordConfirm').value = '';
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
function logout() {
    localStorage.removeItem('currentUser');
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
    alert('Админ панель: ' + db.users.length + ' пользователей в системе');
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
