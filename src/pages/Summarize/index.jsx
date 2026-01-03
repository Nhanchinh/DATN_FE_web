import { useState } from 'react';
import { Button } from '@/components/common';
import { summarizeService } from '@/services';

/**
 * Summarize Page - Trang tóm tắt và đánh giá văn bản
 */
const Summarize = () => {
    const [originalText, setOriginalText] = useState('');
    const [referenceText, setReferenceText] = useState('');
    const [summaryResult, setSummaryResult] = useState('');
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('summarize'); // 'summarize' | 'evaluate'

    // Đếm số từ
    const countWords = (text) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    // Tính tỷ lệ nén
    const getCompressionRatio = () => {
        if (!originalText || !summaryResult) return 0;
        const originalWords = countWords(originalText);
        const summaryWords = countWords(summaryResult);
        return originalWords > 0 ? ((1 - summaryWords / originalWords) * 100).toFixed(1) : 0;
    };

    // Xử lý tóm tắt
    const handleSummarize = async () => {
        if (!originalText.trim()) {
            setError('Vui lòng nhập văn bản cần tóm tắt');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Mock data cho demo
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockSummary = `Đây là bản tóm tắt mẫu của văn bản. Hệ thống sẽ tự động tóm tắt nội dung chính từ văn bản gốc bạn nhập vào. Kết quả sẽ ngắn gọn và súc tích hơn.`;

            setSummaryResult(mockSummary);

            // Mock metrics
            setMetrics({
                rouge1: { precision: 0.72, recall: 0.68, f1: 0.70 },
                rouge2: { precision: 0.45, recall: 0.42, f1: 0.43 },
                rougeL: { precision: 0.65, recall: 0.61, f1: 0.63 },
                bleu: 0.38,
                compressionRatio: getCompressionRatio(),
            });

        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi khi tóm tắt');
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý đánh giá bản tóm tắt có sẵn
    const handleEvaluate = async () => {
        if (!originalText.trim() || !referenceText.trim()) {
            setError('Vui lòng nhập đầy đủ văn bản gốc và bản tóm tắt cần đánh giá');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Mock response
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSummaryResult(referenceText);
            setMetrics({
                rouge1: { precision: 0.75, recall: 0.71, f1: 0.73 },
                rouge2: { precision: 0.48, recall: 0.45, f1: 0.46 },
                rougeL: { precision: 0.68, recall: 0.64, f1: 0.66 },
                bleu: 0.42,
            });

        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi khi đánh giá');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setOriginalText('');
        setReferenceText('');
        setSummaryResult('');
        setMetrics(null);
        setError('');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">📝 Tóm tắt & Đánh giá Văn bản</h1>
                <p className="text-slate-500 text-lg">
                    Tóm tắt tự động hoặc đánh giá chất lượng bản tóm tắt với các metrics ROUGE, BLEU
                </p>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm mb-6 max-w-md mx-auto">
                <button
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'summarize'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    onClick={() => setActiveTab('summarize')}
                >
                    ⚡ Tóm tắt tự động
                </button>
                <button
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'evaluate'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    onClick={() => setActiveTab('evaluate')}
                >
                    📊 Đánh giá bản tóm tắt
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center border border-red-100">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {/* Input Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="font-semibold text-slate-700 flex items-center gap-2">
                                    📄 Văn bản gốc
                                </label>
                                <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-500 font-medium">
                                    {countWords(originalText)} từ
                                </span>
                            </div>
                            <textarea
                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
                                placeholder="Nhập hoặc dán văn bản cần tóm tắt vào đây..."
                                value={originalText}
                                onChange={(e) => setOriginalText(e.target.value)}
                                rows={8}
                            />
                        </div>

                        {activeTab === 'evaluate' && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="font-semibold text-slate-700 flex items-center gap-2">
                                        📋 Bản tóm tắt cần đánh giá
                                    </label>
                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-500 font-medium">
                                        {countWords(referenceText)} từ
                                    </span>
                                </div>
                                <textarea
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
                                    placeholder="Nhập bản tóm tắt bạn muốn đánh giá..."
                                    value={referenceText}
                                    onChange={(e) => setReferenceText(e.target.value)}
                                    rows={6}
                                />
                            </div>
                        )}

                        <div className="flex gap-4 justify-center pt-4">
                            <Button
                                onClick={activeTab === 'summarize' ? handleSummarize : handleEvaluate}
                                loading={isLoading}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 shadow-lg shadow-blue-500/30 border-0"
                            >
                                {activeTab === 'summarize' ? '⚡ Tóm tắt ngay' : '📊 Đánh giá'}
                            </Button>
                            <Button variant="outline" onClick={handleReset} size="lg">
                                🔄 Làm mới
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                {(summaryResult || metrics) && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Result */}
                        {summaryResult && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
                                <h3 className="flex justify-between items-center text-lg font-semibold mb-4 text-slate-800">
                                    <span>✨ Kết quả tóm tắt</span>
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-500 font-medium">
                                        {countWords(summaryResult)} từ
                                    </span>
                                </h3>
                                <div className="prose prose-slate max-w-none p-4 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                                    {summaryResult}
                                </div>
                                {originalText && (
                                    <div className="mt-4 text-sm text-slate-500 flex items-center gap-2">
                                        📉 Tỷ lệ nén: <strong className="text-slate-700">{getCompressionRatio()}%</strong>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Metrics */}
                        {metrics && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-xl font-semibold mb-6 text-center text-slate-800">📊 Điểm đánh giá</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl text-center border-t-4 border-blue-500 hover:-translate-y-1 transition-transform">
                                        <span className="block text-sm font-semibold text-slate-500 mb-1">ROUGE-1</span>
                                        <span className="block text-3xl font-bold text-slate-800 mb-1">{(metrics.rouge1.f1 * 100).toFixed(1)}%</span>
                                        <div className="text-xs text-slate-400">
                                            P: {(metrics.rouge1.precision * 100).toFixed(0)}% | R: {(metrics.rouge1.recall * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-center border-t-4 border-blue-500 hover:-translate-y-1 transition-transform">
                                        <span className="block text-sm font-semibold text-slate-500 mb-1">ROUGE-2</span>
                                        <span className="block text-3xl font-bold text-slate-800 mb-1">{(metrics.rouge2.f1 * 100).toFixed(1)}%</span>
                                        <div className="text-xs text-slate-400">
                                            P: {(metrics.rouge2.precision * 100).toFixed(0)}% | R: {(metrics.rouge2.recall * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-center border-t-4 border-blue-500 hover:-translate-y-1 transition-transform">
                                        <span className="block text-sm font-semibold text-slate-500 mb-1">ROUGE-L</span>
                                        <span className="block text-3xl font-bold text-slate-800 mb-1">{(metrics.rougeL.f1 * 100).toFixed(1)}%</span>
                                        <div className="text-xs text-slate-400">
                                            P: {(metrics.rougeL.precision * 100).toFixed(0)}% | R: {(metrics.rougeL.recall * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-center border-t-4 border-emerald-500 hover:-translate-y-1 transition-transform">
                                        <span className="block text-sm font-semibold text-slate-500 mb-1">BLEU Score</span>
                                        <span className="block text-3xl font-bold text-emerald-600 mb-1">{(metrics.bleu * 100).toFixed(1)}%</span>
                                        <div className="text-xs text-slate-400">
                                            Độ chính xác n-gram
                                        </div>
                                    </div>
                                </div>

                                {/* Metric Explanation */}
                                <div className="mt-8 bg-slate-50 p-4 rounded-xl">
                                    <details className="group">
                                        <summary className="cursor-pointer font-medium text-slate-600 list-none flex items-center justify-between">
                                            <span className="flex items-center gap-2">ℹ️ Giải thích chi tiết các metrics</span>
                                            <span className="text-slate-400 transition group-open:rotate-180">▼</span>
                                        </summary>
                                        <div className="mt-4 pl-4 border-l-2 border-slate-200 text-sm text-slate-600 space-y-2">
                                            <p><strong>ROUGE-1:</strong> Đo lường sự trùng khớp unigram (từ đơn) giữa bản tóm tắt và văn bản gốc.</p>
                                            <p><strong>ROUGE-2:</strong> Đo lường sự trùng khớp bigram (cặp từ liên tiếp).</p>
                                            <p><strong>ROUGE-L:</strong> Đo lường chuỗi con chung dài nhất (Longest Common Subsequence).</p>
                                            <p><strong>BLEU:</strong> Điểm số đánh giá độ chính xác dựa trên n-gram overlap.</p>
                                            <p><strong>P (Precision):</strong> Độ chính xác - Tỷ lệ từ trong bản tóm tắt xuất hiện trong văn bản tham chiếu.</p>
                                            <p><strong>R (Recall):</strong> Độ bao phủ - Tỷ lệ từ trong văn bản tham chiếu được giữ lại trong bản tóm tắt.</p>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Summarize;
