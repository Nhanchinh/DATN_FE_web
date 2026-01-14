import api from './api';

/**
 * History Service - Gọi các API quản lý lịch sử tóm tắt
 */
const historyService = {
    /**
     * Lưu lịch sử tóm tắt mới
     * @param {Object} data - { input_text, summary, model_used, input_words, output_words, compression_ratio, processing_time_ms, colab_inference_ms }
     */
    create: (data) =>
        api.post('/history', data),

    /**
     * Lấy danh sách lịch sử với filter và pagination
     * @param {Object} params - { page, page_size, model, rating, has_feedback, from_date, to_date }
     */
    getList: (params = {}) =>
        api.get('/history', { params }),

    /**
     * Lấy chi tiết 1 history entry
     * @param {string} id - History ID
     */
    getById: (id) =>
        api.get(`/history/${id}`),

    /**
     * Thêm/cập nhật feedback cho history entry
     * @param {string} id - History ID
     * @param {Object} feedback - { rating: 'good'|'bad'|'neutral', comment?, corrected_summary? }
     */
    addFeedback: (id, feedback) =>
        api.post(`/history/${id}/feedback`, feedback),

    /**
     * Export các bản tóm tắt tệ (rating = 'bad') để làm dataset training
     * @param {Object} params - { model?, limit? }
     */
    exportBadSummaries: (params = {}) =>
        api.get('/history/export/bad-summaries', { params }),

    /**
     * Xóa 1 history entry
     * @param {string} id - History ID
     */
    delete: (id) =>
        api.delete(`/history/${id}`),

    /**
     * Xóa nhiều entries theo danh sách IDs
     * @param {string[]} ids - Danh sách History IDs
     */
    bulkDelete: (ids) =>
        api.post('/history/bulk-delete', { ids }),

    /**
     * Xóa theo filter (phải có ít nhất 1 filter)
     * @param {Object} params - { model?, rating?, has_feedback? }
     */
    deleteByFilter: (params) =>
        api.delete('/history/by-filter', { params }),

    /**
     * Xóa tất cả (nguy hiểm!)
     */
    deleteAll: () =>
        api.delete('/history/all', { params: { confirm: true } }),
};

export default historyService;
