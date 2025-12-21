import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const db = new sqlite3.Database('./temka_users.db');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
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
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
