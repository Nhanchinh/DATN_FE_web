import api from './api';

/**
 * Auth Service - Gọi các API authentication
 * Sử dụng api client wrapper
 */
const authService = {
    login: (email, password) => {
        // Backend dùng OAuth2PasswordRequestForm nên phải gửi form data
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        return api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    },

    register: (userData) =>
        api.post('/auth/register', userData),

    me: () =>
        api.get('/auth/me'),

    refresh: (refreshToken) =>
        api.post('/auth/refresh', { refresh_token: refreshToken }),

    changePassword: (currentPassword, newPassword) =>
        api.post('/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword
        }),

    seedTestUser: () =>
        api.post('/auth/seed-test-user'),

    seedAdmin: () =>
        api.post('/auth/seed-admin'),
};

export default authService;
