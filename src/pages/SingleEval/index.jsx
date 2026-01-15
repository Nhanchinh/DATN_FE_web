import { useState } from 'react';
import {
    Play,
    RotateCcw,
    Loader2,
    FileText,
    CheckCircle,
    AlertCircle,
    Copy,
    Clock,
    Sparkles
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
            setError('Vui lòng nhập Summary');
            return;
        }
        if (!reference.trim()) {
            setError('Vui lòng nhập Reference');
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
            console.error('Evaluation error:', err);
            setError(err.response?.data?.detail || 'Có lỗi xảy ra');
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
        <div className="h-[calc(100vh-112px)] flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700">Single Evaluation</span>
                    <div className="h-5 w-px bg-slate-200" />
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={calculateBert}
                            onChange={(e) => setCalculateBert(e.target.checked)}
                            disabled={isLoading}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">BERTScore</span>
                        <span className="text-xs text-slate-400">(chậm hơn)</span>
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    {isLoading && (
                        <span className="text-sm text-slate-500 font-mono">{elapsedTime}s</span>
                    )}
                    <button
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={loadExample}
                        disabled={isLoading}
                    >
                        <Sparkles className="w-4 h-4" />
                        Ví dụ
                    </button>
                    <button
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        onClick={handleClear}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <Button
                        size="sm"
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleEvaluate}
                        disabled={isLoading || !summary.trim() || !reference.trim()}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Đang chấm...
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5" />
                                Đánh giá
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
                {/* Summary */}
                <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-blue-50 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Summary</span>
                        <span className="text-xs text-slate-400">Prediction</span>
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none focus:outline-none text-slate-700 text-sm leading-relaxed"
                        placeholder="Nhập văn bản tóm tắt cần đánh giá..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="p-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                        {summary.split(/\s+/).filter(w => w).length} từ
                    </div>
                </div>

                {/* Reference */}
                <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-emerald-50 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">Reference</span>
                        <span className="text-xs text-slate-400">Ground Truth</span>
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none focus:outline-none text-slate-700 text-sm leading-relaxed"
                        placeholder="Nhập văn bản tham chiếu..."
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="p-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                        {reference.split(/\s+/).filter(w => w).length} từ
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-700">Scores</span>
                    {result && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {result.processing_time_ms}ms
                            </span>
                            <button
                                className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors ${copied ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                onClick={handleCopyResult}
                            >
                                <Copy className="w-3 h-3" />
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    )}
                </div>
                <div className={`grid gap-4 ${calculateBert ? 'grid-cols-5' : 'grid-cols-4'}`}>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-semibold text-slate-900">{result ? (result.rouge1 * 100).toFixed(1) : '-'}</p>
                        <p className="text-xs text-slate-500 mt-1">ROUGE-1</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-semibold text-slate-900">{result ? (result.rouge2 * 100).toFixed(1) : '-'}</p>
                        <p className="text-xs text-slate-500 mt-1">ROUGE-2</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-semibold text-slate-900">{result ? (result.rougeL * 100).toFixed(1) : '-'}</p>
                        <p className="text-xs text-slate-500 mt-1">ROUGE-L</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-semibold text-slate-900">{result ? (result.bleu * 100).toFixed(1) : '-'}</p>
                        <p className="text-xs text-slate-500 mt-1">BLEU</p>
                    </div>
                    {calculateBert && (
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-2xl font-semibold text-slate-900">{result?.bert_score ? (result.bert_score * 100).toFixed(1) : '-'}</p>
                            <p className="text-xs text-slate-500 mt-1">BERT</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleEval;
