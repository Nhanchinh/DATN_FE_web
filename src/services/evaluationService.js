import api from './api';

/**
 * Evaluation Service - Gọi các API đánh giá
 */
const evaluationService = {
    // Single evaluation
    single: (data) =>
        api.post('/evaluate/single', data),

    // Batch evaluation
    batch: (data) =>
        api.post('/evaluate/batch', data),

    // Get progress
    progress: (evaluationId) =>
        api.get(`/evaluate/progress/${evaluationId}`),

    // Compare models
    compare: (data) =>
        api.post('/evaluate/compare', data),

    // History
    history: (params = {}) =>
        api.get('/evaluate/history', { params }),

    // Datasets
    datasets: () =>
        api.get('/evaluate/datasets'),
};

export default evaluationService;
