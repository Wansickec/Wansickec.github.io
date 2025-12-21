import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const db = new sqlite3.Database('./temka_users.db');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        db.get(
            `SELECT * FROM users WHERE username = ?`,
            [username],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'User not found' });
                }

                const isMatch = await bcrypt.compare(password, user.password);

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
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
