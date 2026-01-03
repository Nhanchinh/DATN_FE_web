import axiosClient from './axiosClient';

// Auth API endpoints
const authService = {
    // Đăng nhập
    login: async (email, password) => {
        const response = await axiosClient.post('/auth/login', { email, password });
        return response;
    },

    // Đăng ký
    register: async (userData) => {
        const response = await axiosClient.post('/auth/register', userData);
        return response;
    },

    // Đăng xuất
    logout: async () => {
        const response = await axiosClient.post('/auth/logout');
        return response;
    },

    // Lấy thông tin user hiện tại
    getCurrentUser: async () => {
        const response = await axiosClient.get('/auth/me');
        return response;
    },

    // Đổi mật khẩu
    changePassword: async (oldPassword, newPassword) => {
        const response = await axiosClient.post('/auth/change-password', {
            oldPassword,
            newPassword,
        });
        return response;
    },

    // Quên mật khẩu
    forgotPassword: async (email) => {
        const response = await axiosClient.post('/auth/forgot-password', { email });
        return response;
    },

    // Reset mật khẩu
    resetPassword: async (token, newPassword) => {
        const response = await axiosClient.post('/auth/reset-password', {
            token,
            newPassword,
        });
        return response;
    },
};

export default authService;
