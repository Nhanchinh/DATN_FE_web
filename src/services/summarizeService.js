import axiosClient from './axiosClient';

/**
 * Summarize Service - API endpoints cho tóm tắt văn bản
 */
const summarizeService = {
    /**
     * Tóm tắt văn bản tự động
     * @param {string} text - Văn bản gốc cần tóm tắt
     * @param {object} options - Các tùy chọn (model, max_length, etc.)
     */
    summarize: async (text, options = {}) => {
        const response = await axiosClient.post('/summarize', {
            text,
            ...options
        });
        return response;
    },

    /**
     * Đánh giá chất lượng bản tóm tắt
     * @param {string} original - Văn bản gốc
     * @param {string} summary - Bản tóm tắt cần đánh giá
     * @param {string} reference - Bản tóm tắt tham chiếu (nếu có)
     */
    evaluate: async (original, summary, reference = null) => {
        const response = await axiosClient.post('/evaluate', {
            original,
            summary,
            reference,
        });
        return response;
    },

    /**
     * Tóm tắt và đánh giá cùng lúc
     * @param {string} text - Văn bản gốc
     * @param {string} reference - Bản tóm tắt tham chiếu (tùy chọn)
     */
    summarizeAndEvaluate: async (text, reference = null) => {
        const response = await axiosClient.post('/summarize-evaluate', {
            text,
            reference,
        });
        return response;
    },

    /**
     * Lấy lịch sử tóm tắt
     * @param {number} page - Trang hiện tại
     * @param {number} limit - Số item mỗi trang
     */
    getHistory: async (page = 1, limit = 10) => {
        const response = await axiosClient.get('/summarize/history', {
            params: { page, limit },
        });
        return response;
    },

    /**
     * Lấy thống kê tổng quan
     */
    getStats: async () => {
        const response = await axiosClient.get('/summarize/stats');
        return response;
    },

    /**
     * Lấy chi tiết một bài tóm tắt
     * @param {string} id - ID của bài tóm tắt
     */
    getDetail: async (id) => {
        const response = await axiosClient.get(`/summarize/${id}`);
        return response;
    },
};

export default summarizeService;
