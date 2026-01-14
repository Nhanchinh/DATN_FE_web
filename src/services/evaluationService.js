import api from './api';

/**
 * Evaluation Service - Gọi các API đánh giá
 * Đã cập nhật để sử dụng backend mới (fastandcolab)
 */
const evaluationService = {
    /**
     * Đánh giá một cặp summary-reference (Score Only)
     * @param {string} prediction - Văn bản tóm tắt cần đánh giá
     * @param {string} reference - Văn bản tham chiếu (ground truth)
     * @param {boolean} calculateBert - Có tính BERTScore không (chậm)
     */
    evaluateSingle: (prediction, reference, calculateBert = false) =>
        api.post('/evaluation/single', {
            prediction,
            reference,
            calculate_bert: calculateBert
        }),

    /**
     * Upload file để đánh giá (Score Only)
     * @param {File} file - File CSV/Excel
     * @param {boolean} calculateBert - Có tính BERTScore không
     */
    evaluateFileUpload: (file, calculateBert = false) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('calculate_bert', calculateBert);

        return api.post('/evaluation/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Đánh giá batch predictions
    batch: (data) =>
        api.post('/evaluation/batch', data),

    // Tóm tắt và đánh giá cùng lúc
    summarizeAndEvaluate: (data) =>
        api.post('/evaluation/summarize-and-evaluate', data),
};

export default evaluationService;
