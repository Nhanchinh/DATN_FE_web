import api from './api';

/**
 * Admin Service - Gọi các API quản trị
 */
const adminService = {
    // Lấy danh sách tất cả users
    getAllUsers: () => api.get('/admin/users'),

    // Xóa user
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

export default adminService;
