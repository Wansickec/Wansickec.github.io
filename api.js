// API configuration - автоматически определяет URL
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

// Helper function to parse response safely
async function parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response');
    }
}

// API functions
const api = {
    async register(username, email, password, passwordConfirm) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    passwordConfirm
                })
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Save token
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            return data;
        } catch (error) {
            throw error;
        }
    },

    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save token
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getProfile() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get profile');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    async logDownload(filename, version) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${API_URL}/download`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename,
                    version
                })
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to log download');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    async getStats() {
        try {
            const response = await fetch(`${API_URL}/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get stats');
            }

            return data;
        } catch (error) {
            console.error('Stats error:', error);
            return { totalUsers: 0, totalDownloads: 0 };
        }
    },

    async logout() {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
};
