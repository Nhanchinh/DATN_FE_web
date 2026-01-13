import api from './api';

/**
 * Evaluation Service - Gọi các API đánh giá
 * Đã cập nhật để sử dụng backend mới (fastandcolab)
 */
const evaluationService = {
    // Đánh giá một cặp prediction-reference
    single: (data) =>
        api.post('/evaluation/single', data),

    // Đánh giá batch predictions
    batch: (data) =>
        api.post('/evaluation/batch', data),

    // Tóm tắt và đánh giá cùng lúc
    summarizeAndEvaluate: (data) =>
        api.post('/evaluation/summarize-and-evaluate', data),
};

export default evaluationService;
