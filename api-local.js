// Local API - работает без сервера, использует localStorage
const api = {
    // Инициализация БД в localStorage
    initDB() {
        if (!localStorage.getItem('temka_users')) {
            localStorage.setItem('temka_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('temka_downloads')) {
            localStorage.setItem('temka_downloads', JSON.stringify([]));
        }
    },

    // Проверить, авторизован ли пользователь
    isAuthenticated() {
        return !!localStorage.getItem('currentUser') && !!localStorage.getItem('token');
    },

    // Получить текущего пользователя
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    getUsers() {
        return JSON.parse(localStorage.getItem('temka_users') || '[]');
    },

    saveUsers(users) {
        localStorage.setItem('temka_users', JSON.stringify(users));
    },

    getDownloads() {
        return JSON.parse(localStorage.getItem('temka_downloads') || '[]');
    },

    saveDownloads(downloads) {
        localStorage.setItem('temka_downloads', JSON.stringify(downloads));
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

    hashPassword(password) {
        // Простое хеширование (для демо)
        return btoa(password);
    },

    verifyPassword(password, hash) {
        return btoa(password) === hash;
    },

    generateToken() {
        return 'token_' + Math.random().toString(36).substr(2, 9);
    },

    async register(username, email, password, passwordConfirm) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Валидация
                if (!username || !email || !password || !passwordConfirm) {
                    reject(new Error('All fields are required'));
                    return;
                }

                if (username.length < 3) {
                    reject(new Error('Username must be at least 3 characters'));
                    return;
                }

                if (password !== passwordConfirm) {
                    reject(new Error('Passwords do not match'));
                    return;
                }

                if (password.length < 6) {
                    reject(new Error('Password must be at least 6 characters'));
                    return;
                }

                const users = this.getUsers();

                // Проверка уникальности
                if (users.find(u => u.username === username)) {
                    reject(new Error('Username already exists'));
                    return;
                }

                if (users.find(u => u.email === email)) {
                    reject(new Error('Email already exists'));
                    return;
                }

                // Создание пользователя
                const user = {
                    id: Date.now(),
                    username,
                    email,
                    password: this.hashPassword(password),
                    licenseKey: this.generateLicenseKey(),
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    premium: true,
                    downloadsCount: 0
                };

                users.push(user);
                this.saveUsers(users);

                const token = this.generateToken();

                resolve({
                    success: true,
                    message: 'User registered successfully',
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        licenseKey: user.licenseKey,
                        premium: user.premium
                    },
                    token
                });
            }, 500);
        });
    },

    async login(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!username || !password) {
                    reject(new Error('Username and password are required'));
                    return;
                }

                const users = this.getUsers();
                const user = users.find(u => u.username === username);

                if (!user) {
                    reject(new Error('User not found'));
                    return;
                }

                if (!this.verifyPassword(password, user.password)) {
                    reject(new Error('Invalid password'));
                    return;
                }

                // Обновление последнего входа
                user.lastLogin = new Date().toISOString();
                this.saveUsers(users);

                const token = this.generateToken();

                resolve({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        licenseKey: user.licenseKey,
                        premium: user.premium,
                        lastLogin: user.lastLogin,
                        downloadsCount: user.downloadsCount
                    },
                    token
                });
            }, 500);
        });
    },

    async getProfile() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const token = localStorage.getItem('token');
                if (!token) {
                    reject(new Error('No token found'));
                    return;
                }

                const currentUser = localStorage.getItem('currentUser');
                if (!currentUser) {
                    reject(new Error('User not found'));
                    return;
                }

                const user = JSON.parse(currentUser);
                resolve({
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        licenseKey: user.licenseKey,
                        premium: user.premium,
                        downloadsCount: user.downloadsCount,
                        lastLogin: user.lastLogin,
                        createdAt: user.createdAt
                    }
                });
            }, 300);
        });
    },

    async logDownload(filename, version) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const token = localStorage.getItem('token');
                if (!token) {
                    reject(new Error('No token found'));
                    return;
                }

                const currentUser = localStorage.getItem('currentUser');
                if (!currentUser) {
                    reject(new Error('User not found'));
                    return;
                }

                const user = JSON.parse(currentUser);
                const downloads = this.getDownloads();

                downloads.push({
                    id: Date.now(),
                    userId: user.id,
                    filename,
                    version,
                    downloadedAt: new Date().toISOString()
                });

                this.saveDownloads(downloads);

                // Обновление счетчика загрузок
                const users = this.getUsers();
                const userIndex = users.findIndex(u => u.id === user.id);
                if (userIndex !== -1) {
                    users[userIndex].downloadsCount++;
                    this.saveUsers(users);
                    user.downloadsCount++;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }

                resolve({
                    success: true,
                    message: 'Download logged successfully'
                });
            }, 300);
        });
    },

    async getStats() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = this.getUsers();
                const downloads = this.getDownloads();

                resolve({
                    totalUsers: users.length,
                    totalDownloads: downloads.length
                });
            }, 300);
        });
    },

    async logout() {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');

                resolve({
                    success: true,
                    message: 'Logged out successfully'
                });
            }, 300);
        });
    }
};

// Инициализация при загрузке
api.initDB();
