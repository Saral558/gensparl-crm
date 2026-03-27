const API_URL = 'http://localhost:5000/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.hash = '#login';
                }
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (err) {
            console.error('API Error:', err);
            throw err;
        }
    },

    auth: {
        login: (credentials) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
        register: (data) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
        getMe: () => api.request('/auth/me')
    },

    users: {
        list: () => api.request('/users'),
        create: (data) => api.request('/users', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => api.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => api.request(`/users/${id}`, { method: 'DELETE' })
    },

    deliveries: {
        list: () => api.request('/deliveries'),
        create: (data) => api.request('/deliveries', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => api.request(`/deliveries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => api.request(`/deliveries/${id}`, { method: 'DELETE' })
    }
};
