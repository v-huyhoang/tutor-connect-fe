import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    withCredentials: true, // Required for Laravel Sanctum cookie-based CSRF
    withXSRFToken: true, // Required in Axios >= 1.6 to send CSRF token cross-origin
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

export const csrf = async () => {
    if (typeof window !== 'undefined' && !document.cookie.includes('XSRF-TOKEN')) {
        await api.get('/sanctum/csrf-cookie');
    }
};

// Setup response interceptor to handle 401/419 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined') {
            // 401 Unauthorized or 419 Authentication Timeout (CSRF mismatch)
            if (error.response && [401, 419].includes(error.response.status)) {
                // Clear the XSRF token cookie manually just in case
                document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                // We cannot clear laravel_session via JS because it's HttpOnly, but backend or middleware will handle it.
                
                // Do not redirect if we are already on the login page or checking /me to prevent loops
                if (window.location.pathname !== '/login' && !error.config.url?.includes('/api/me')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
