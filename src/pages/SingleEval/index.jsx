import { useState } from 'react';
import {
    Play,
    Settings2,
    RotateCcw,
    Loader2,
    FileText,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Copy,
    Zap
} from 'lucide-react';
import { Button } from '@/components/common';
import evaluationService from '@/services/evaluationService';

const SingleEval = () => {
    const [summary, setSummary] = useState('');
    const [reference, setReference] = useState('');
    const [calculateBert, setCalculateBert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const handleEvaluate = async () => {
        if (!summary.trim()) {
            setError('Vui lòng nhập văn bản tóm tắt (Summary)');
            return;
        }
        if (!reference.trim()) {
            setError('Vui lòng nhập văn bản tham chiếu (Reference)');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);
        setElapsedTime(0);

        const startTime = Date.now();
        const timer = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        try {
            const response = await evaluationService.evaluateSingle(
                summary.trim(),
                reference.trim(),
                calculateBert
            );
            setResult(response);
        } catch (err) {
            console.error('Single evaluation error:', err);
            setError(err.response?.data?.detail || 'Có lỗi xảy ra khi đánh giá');
        } finally {
            clearInterval(timer);
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSummary('');
        setReference('');
        setResult(null);
        setError('');
        setElapsedTime(0);
    };

    const loadExample = () => {
        setSummary('Trí tuệ nhân tạo đang được ứng dụng rộng rãi trong nhiều lĩnh vực như y tế, giáo dục và tài chính, giúp tự động hóa các quy trình và nâng cao hiệu quả công việc.');
        setReference('AI được ứng dụng trong nhiều ngành như y tế, giáo dục, tài chính. Công nghệ này giúp tự động hóa quy trình và tăng năng suất lao động.');
        setResult(null);
        setError('');
    };

    const handleCopyResult = async () => {
        if (!result) return;
        const text = `ROUGE-1: ${(result.rouge1 * 100).toFixed(2)}%\nROUGE-2: ${(result.rouge2 * 100).toFixed(2)}%\nROUGE-L: ${(result.rougeL * 100).toFixed(2)}%\nBLEU: ${(result.bleu * 100).toFixed(2)}%${calculateBert ? `\nBERTScore: ${(result.bert_score * 100).toFixed(2)}%` : ''}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">Single Evaluation</span>
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={calculateBert}
                            onChange={(e) => setCalculateBert(e.target.checked)}
                            disabled={isLoading}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">BERTScore</span>
                        <span className="text-xs text-slate-400">(chậm)</span>
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    {isLoading && (
                        <span className="text-sm text-slate-500 font-mono">{elapsedTime}s</span>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-slate-300"
                        onClick={loadExample}
                        disabled={isLoading}
                    >
                        <Zap className="w-4 h-4" />
                        Ví dụ
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-slate-300"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Xóa
                    </Button>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        onClick={handleEvaluate}
                        disabled={isLoading || !summary.trim() || !reference.trim()}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang chấm...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Đánh giá
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Main Content - Split View */}
            <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
                {/* Left Side - Input Panels */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    {/* Summary Panel */}
                    <div className="flex-1 flex flex-col bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden hover:border-slate-300 transition-colors">
                        <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-indigo-500 to-purple-500">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Văn bản tóm tắt (Summary)
                            </h3>
                        </div>
                        <textarea
                            className="flex-1 p-4 resize-none focus:outline-none text-slate-700 text-sm leading-relaxed"
                            placeholder="Nhập văn bản tóm tắt cần đánh giá..."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            disabled={isLoading}
                        />
                        <div className="p-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                            <span>{summary.split(/\s+/).filter(w => w).length} từ • {summary.length} ký tự</span>
                            <span className="text-indigo-500 font-medium">Prediction</span>
                        </div>
                    </div>

                    {/* Reference Panel */}
                    <div className="flex-1 flex flex-col bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden hover:border-slate-300 transition-colors">
                        <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-emerald-500 to-teal-500">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Văn bản tham chiếu (Reference)
                            </h3>
                        </div>
                        <textarea
                            className="flex-1 p-4 resize-none focus:outline-none text-slate-700 text-sm leading-relaxed"
                            placeholder="Nhập văn bản tham chiếu (ground truth)..."
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            disabled={isLoading}
                        />
                        <div className="p-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                            <span>{reference.split(/\s+/).filter(w => w).length} từ • {reference.length} ký tự</span>
                            <span className="text-emerald-500 font-medium">Ground Truth</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Results */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    {/* Results Panel */}
                    <div className="flex-1 flex flex-col bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden">
                        <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                Kết quả đánh giá
                            </h3>
                            {result && (
                                <button
                                    className={`p-1 hover:bg-slate-200 rounded flex items-center gap-1 text-xs ${copied ? 'text-green-600' : 'text-slate-500'}`}
                                    onClick={handleCopyResult}
                                >
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    <p className="text-sm text-slate-500">Đang tính toán metrics...</p>
                                    <p className="text-xs text-slate-400">Đang chờ: {elapsedTime}s</p>
                                    {calculateBert && (
                                        <p className="text-xs text-amber-500 italic">(BERTScore có thể mất 30-60s)</p>
                                    )}
                                    <div className="w-full max-w-xs space-y-2">
                                        <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                                        <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6"></div>
                                        <div className="h-3 bg-slate-200 rounded animate-pulse w-4/6"></div>
                                    </div>
                                </div>
                            ) : result ? (
                                <div className="space-y-4">
                                    {/* ROUGE Scores */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">ROUGE Scores</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                                                <div className="text-2xl font-black text-red-600">{(result.rouge1 * 100).toFixed(1)}</div>
                                                <div className="text-xs font-semibold text-red-700 mt-1">ROUGE-1</div>
                                            </div>
                                            <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                                                <div className="text-2xl font-black text-orange-600">{(result.rouge2 * 100).toFixed(1)}</div>
                                                <div className="text-xs font-semibold text-orange-700 mt-1">ROUGE-2</div>
                                            </div>
                                            <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                                                <div className="text-2xl font-black text-amber-600">{(result.rougeL * 100).toFixed(1)}</div>
                                                <div className="text-xs font-semibold text-amber-700 mt-1">ROUGE-L</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BLEU Score */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">BLEU Score</h4>
                                        <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                                            <div className="text-3xl font-black text-purple-600">{(result.bleu * 100).toFixed(2)}</div>
                                            <div className="text-xs font-semibold text-purple-700 mt-1">BLEU</div>
                                        </div>
                                    </div>

                                    {/* BERTScore */}
                                    {calculateBert && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">BERTScore (Semantic)</h4>
                                            <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                                                <div className="text-3xl font-black text-emerald-600">{(result.bert_score * 100).toFixed(2)}</div>
                                                <div className="text-xs font-semibold text-emerald-700 mt-1">BERTScore F1</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <Sparkles className="w-12 h-12 mb-2 opacity-50" />
                                    <p className="text-sm italic">Nhấn "Đánh giá" để xem kết quả...</p>
                                </div>
                            )}
                        </div>

                        {result && (
                            <div className="p-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                                Thời gian: {result.processing_time_ms}ms
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Panel */}
                    <div className="bg-white rounded-xl border-2 border-slate-200 shadow-md p-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Giải thích</h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="font-semibold text-slate-700 mb-1">📊 ROUGE</div>
                                <div className="text-slate-500">Overlap từ vựng giữa 2 văn bản</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="font-semibold text-slate-700 mb-1">📐 BLEU</div>
                                <div className="text-slate-500">Độ chính xác n-gram precision</div>
                            </div>
                            {calculateBert && (
                                <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                                    <div className="font-semibold text-slate-700 mb-1">🧠 BERTScore</div>
                                    <div className="text-slate-500">Semantic similarity - đo ý nghĩa tương đồng</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleEval;
