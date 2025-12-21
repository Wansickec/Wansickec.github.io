const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Database initialization
const db = new sqlite3.Database('./temka_users.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            license_key TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            premium BOOLEAN DEFAULT 1,
            downloads_count INTEGER DEFAULT 0
        )
    `, (err) => {
        if (err) console.error('Error creating users table:', err);
        else console.log('Users table ready');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS downloads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            version TEXT NOT NULL,
            downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Error creating downloads table:', err);
        else console.log('Downloads table ready');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Error creating sessions table:', err);
        else console.log('Sessions table ready');
    });
}

// Helper functions
function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) key += '-';
    }
    return key;
}

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
}

// Routes

// Register
app.post('/api/register', (req, res) => {
    const { username, email, password, passwordConfirm } = req.body;

    // Validation
    if (!username || !email || !password || !passwordConfirm) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password !== passwordConfirm) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }

        const licenseKey = generateLicenseKey();

        db.run(
            `INSERT INTO users (username, email, password, license_key) VALUES (?, ?, ?, ?)`,
            [username, email, hashedPassword, licenseKey],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username or email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }

                const token = generateToken(this.lastID);

                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    user: {
                        id: this.lastID,
                        username,
                        email,
                        licenseKey,
                        premium: true
                    },
                    token
                });
            }
        );
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ error: 'Error comparing passwords' });
                }

                if (!isMatch) {
                    return res.status(401).json({ error: 'Invalid password' });
                }

                // Update last login
                db.run(
                    `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
                    [user.id]
                );

                const token = generateToken(user.id);

                res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        licenseKey: user.license_key,
                        premium: user.premium,
                        lastLogin: user.last_login,
                        downloadsCount: user.downloads_count
                    },
                    token
                });
            });
        }
    );
});

// Get user profile
app.get('/api/user/profile', verifyToken, (req, res) => {
    db.get(
        `SELECT id, username, email, license_key, premium, downloads_count, last_login, created_at FROM users WHERE id = ?`,
        [req.userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    licenseKey: user.license_key,
                    premium: user.premium,
                    downloadsCount: user.downloads_count,
                    lastLogin: user.last_login,
                    createdAt: user.created_at
                }
            });
        }
    );
});

// Log download
app.post('/api/download', verifyToken, (req, res) => {
    const { filename, version } = req.body;

    if (!filename || !version) {
        return res.status(400).json({ error: 'Filename and version are required' });
    }

    db.run(
        `INSERT INTO downloads (user_id, filename, version) VALUES (?, ?, ?)`,
        [req.userId, filename, version],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            // Update downloads count
            db.run(
                `UPDATE users SET downloads_count = downloads_count + 1 WHERE id = ?`,
                [req.userId]
            );

            res.json({
                success: true,
                message: 'Download logged successfully'
            });
        }
    );
});

// Get user statistics
app.get('/api/stats', (req, res) => {
    db.get(
        `SELECT COUNT(*) as total_users FROM users`,
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            db.get(
                `SELECT COUNT(*) as total_downloads FROM downloads`,
                (err, downloads) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    res.json({
                        totalUsers: result.total_users,
                        totalDownloads: downloads.total_downloads
                    });
                }
            );
        }
    );
});

// Logout (optional - just for logging purposes)
app.post('/api/logout', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Temka Client server running on http://localhost:${PORT}`);
});
