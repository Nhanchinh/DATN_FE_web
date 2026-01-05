import axios from 'axios';
import { APP_CONFIG, HTTP_STATUS } from '@/config/constants';

/**
 * API Client Instance (HTTP Client Wrapper)
 * 
 * Config sẵn baseURL, headers, interceptors
 * Các service sẽ import và gọi: api.get(), api.post()
 * 
 * Usage:
 *   import api from '@/services/api';
 *   api.get('/users');
 *   api.post('/auth/login', { email, password });
 */

// Flag để tránh multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

// Process queue khi refresh thành công/thất bại
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Tạo axios instance
const api = axios.create({
    baseURL: APP_CONFIG.API_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Tự động đính kèm token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - Auto-refresh token khi 401
api.interceptors.response.use(
    (response) => response.data, // Trả về data trực tiếp
    async (error) => {
        const originalRequest = error.config;

        // Xử lý 401 - Token hết hạn
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);

            if (refreshToken) {
                try {
                    // Gọi refresh trực tiếp axios để tránh loop
                    const response = await axios.post(
                        `${APP_CONFIG.API_URL}/auth/refresh`,
                        { refresh_token: refreshToken },
                        { headers: { 'Content-Type': 'application/json' } }
                    );

                    const { access_token, refresh_token: newRefreshToken } = response.data;

                    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, access_token);
                    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    processQueue(null, access_token);
                    isRefreshing = false;

                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    isRefreshing = false;

                    // Clear storage và redirect
                    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
                    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
                    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);

                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = APP_CONFIG.ROUTES.LOGIN;
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = APP_CONFIG.ROUTES.LOGIN;
                }
            }
        }

        console.error('API Error:', error.response?.data?.detail || error.message);
        return Promise.reject(error);
    }
);

export default api;
