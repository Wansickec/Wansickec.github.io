import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./temka_users.db');

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
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
                            totalUsers: result.total_users || 0,
                            totalDownloads: downloads.total_downloads || 0
                        });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
