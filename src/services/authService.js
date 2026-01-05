import api from './api';

/**
 * Auth Service - Gọi các API authentication
 * Sử dụng api client wrapper
 */
const authService = {
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    register: (userData) =>
        api.post('/auth/register', userData),

    logout: () =>
        api.post('/auth/logout'),

    me: () =>
        api.get('/auth/me'),

    refresh: (refreshToken) =>
        api.post('/auth/refresh', { refresh_token: refreshToken }),

    seedTestUser: () =>
        api.post('/auth/seed-test-user'),
};

export default authService;
