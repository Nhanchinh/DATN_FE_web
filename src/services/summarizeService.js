import api from './api';

/**
 * Summarize Service - Gọi các API tóm tắt văn bản
 */
const summarizeService = {
    // BART-cnn (English)
    basic: (text, options = {}) =>
        api.post('/summarize', { text, ...options }),

    balanced: (text, options = {}) =>
        api.post('/summarize/balanced', { text, ...options }),

    detailed: (text, options = {}) =>
        api.post('/summarize/detailed', { text, ...options }),

    // ViT5 Finetuned (Vietnamese)
    multilingual: (text, options = {}) =>
        api.post('/summarize/multilingual', { text, ...options }),

    // PhoBERT Extractive
    extractive: (text, options = {}) =>
        api.post('/summarize/extractive', { text, ...options }),

    chunked: (text, options = {}) =>
        api.post('/summarize/chunked', { text, ...options }),

    smart: (text, options = {}) =>
        api.post('/summarize/smart', { text, ...options }),

    // Hybrid models
    hybrid: (text, options = {}) =>
        api.post('/summarize/hybrid', { text, ...options }),

    hybridBartpho: (text, options = {}) =>
        api.post('/summarize/hybrid-bartpho', { text, ...options }),

    hybridVit5: (text, options = {}) =>
        api.post('/summarize/hybrid-vit5', { text, ...options }),

    hybridParaphrase: (text, options = {}) =>
        api.post('/summarize/hybrid-phobert-paraphrase', { text, ...options }),

    // BARTpho
    bartpho: (text, options = {}) =>
        api.post('/summarize/bartpho', { text, ...options }),

    paraphrase: (text, options = {}) =>
        api.post('/summarize/bartpho/paraphrase', { text, ...options }),

    // Model info
    getMultilingualInfo: () => api.get('/summarize/multilingual/info'),
    getExtractiveInfo: () => api.get('/summarize/extractive/info'),
    getHybridInfo: () => api.get('/summarize/hybrid/info'),
};

export default summarizeService;
