import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Attach auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// A 401 from /auth/login or /auth/register means "those credentials are wrong",
// not "your session expired". Redirecting on those reloads the page and destroys
// the error message before the form can show it.
const CREDENTIAL_ENDPOINTS = ['/auth/login', '/auth/register'];

// Handle expired sessions globally - redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isCredentialCheck = CREDENTIAL_ENDPOINTS.some((path) => url.includes(path));

        if (error.response?.status === 401 && !isCredentialCheck) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
