import api from './api';

/**
 * Summarize Service - Gọi các API tóm tắt văn bản
 * Đã cập nhật để sử dụng backend mới (fastandcolab)
 */
const summarizeService = {
    /**
     * Tóm tắt văn bản với model được chỉ định
     * @param {string} text - Văn bản cần tóm tắt
     * @param {string} model - Model: 'vit5_fin' | 'qwen' | 'phobert_finance'
     * @param {number} maxLength - Độ dài tối đa (50-512)
     */
    summarize: (text, model = 'vit5_fin', maxLength = 256) =>
        api.post('/summarization/summarize', {
            text,
            model,
            max_length: maxLength
        }),

    // Health check - kiểm tra kết nối Colab GPU server
    health: () =>
        api.get('/summarization/health'),

    // Lấy danh sách models có sẵn
    models: () =>
        api.get('/summarization/models'),

    /**
     * So sánh kết quả từ nhiều models
     * @param {string} text - Văn bản cần tóm tắt
     * @param {Array<string>} models - Danh sách models (mặc định: ['vit5_fin', 'qwen', 'phobert_finance'])
     * @param {number} maxLength - Độ dài tối đa (50-512)
     */
    compareModels: (text, models = ['vit5_fin', 'qwen', 'phobert_finance'], maxLength = 256) =>
        api.post('/summarization/compare', {
            text,
            models,
            max_length: maxLength
        }),

    // Batch upload - upload file CSV/Excel để đánh giá dataset
    batchUpload: (file, model = 'vit5_fin', maxLength = 256, textColumn = 'text', referenceColumn = null) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', model);
        formData.append('max_length', maxLength);
        formData.append('text_column', textColumn);
        if (referenceColumn) {
            formData.append('reference_column', referenceColumn);
        }
        return api.post('/summarization/batch-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * AI Judge - Sử dụng Gemini để so sánh và đánh giá các bản tóm tắt
     * @param {string} originalText - Văn bản gốc
     * @param {Array<{model: string, summary: string}>} summaries - Các bản tóm tắt cần so sánh
     */
    aiJudge: (originalText, summaries) =>
        api.post('/summarization/ai-judge', {
            original_text: originalText,
            summaries
        }),

    /**
     * Sinh bản tóm tắt gold bằng AI (Gemini)
     * @param {string} text - Văn bản gốc
     */
    generateReference: (text) =>
        api.post('/summarization/generate-reference', { text }),
};

export default summarizeService;
