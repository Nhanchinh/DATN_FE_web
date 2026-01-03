import axios from 'axios';
import { APP_CONFIG, HTTP_STATUS } from '@/config/constants';

// Tạo instance axios với cấu hình mặc định
const axiosClient = axios.create({
    baseURL: APP_CONFIG.API_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Tự động đính kèm token vào header
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - Xử lý lỗi chung
axiosClient.interceptors.response.use(
    (response) => {
        // Trả về data trực tiếp để không cần .data khi sử dụng
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Xử lý lỗi 401 - Token hết hạn
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Thử refresh token (nếu có endpoint)
                const refreshToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);

                if (refreshToken) {
                    // Gọi API refresh token
                    // const response = await axios.post(`${APP_CONFIG.API_URL}/auth/refresh`, { refreshToken });
                    // localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
                    // return axiosClient(originalRequest);
                }

                // Nếu không có refresh token hoặc refresh thất bại, đá ra trang login
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);
                window.location.href = APP_CONFIG.ROUTES.LOGIN;
            } catch (refreshError) {
                // Refresh token thất bại, đá ra trang login
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);
                window.location.href = APP_CONFIG.ROUTES.LOGIN;
                return Promise.reject(refreshError);
            }
        }

        // Xử lý các lỗi khác
        const errorMessage = error.response?.data?.message || error.message || 'Đã xảy ra lỗi';
        console.error('API Error:', errorMessage);

        return Promise.reject(error);
    }
);

export default axiosClient;
