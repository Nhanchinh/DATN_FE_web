import { useState, useRef } from 'react';
import {
    Play,
    Copy,
    RotateCcw,
    Loader2,
    FileText,
    CheckCircle,
    AlertCircle,
    Square,
    ChevronDown,
    BarChart3,
    Sparkles,
    ChevronUp,
    X
} from 'lucide-react';
import { Button } from '@/components/common';
import { summarizeService, historyService, evaluationService } from '@/services';

const MODEL_OPTIONS = [
    { value: 'vit5_fin', label: 'ViT5 Financial v2', tag: 'Finance' },
    { value: 'qwen', label: 'Qwen 2.5-7B', tag: 'LLM' },
    { value: 'phobert_finance', label: 'PhoBERT Finance', tag: 'Extractive' },
];

const ScoreBar = ({ label, value, color = 'bg-blue-500' }) => (
    <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 w-20 shrink-0">{label}</span>
        <div className="flex-1 bg-slate-100 rounded-full h-2">
            <div
                className={`${color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(value * 100, 100)}%` }}
            />
        </div>
        <span className="text-xs font-semibold text-slate-700 w-12 text-right">
            {(value * 100).toFixed(1)}%
        </span>
    </div>
);

const Playground = () => {
    const [model, setModel] = useState('vit5_fin');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Evaluation state
    const [showEval, setShowEval] = useState(false);
    const [reference, setReference] = useState('');
    const [evalLoading, setEvalLoading] = useState(false);
    const [evalResult, setEvalResult] = useState(null);
    const [evalError, setEvalError] = useState('');
    const [genRefLoading, setGenRefLoading] = useState(false);
    const [calculateBert, setCalculateBert] = useState(true);

    const abortControllerRef = useRef(null);
    const timerRef = useRef(null);

    const handleRun = async () => {
        if (!input.trim()) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setOutput('');
        setError('');
        setMetrics(null);
        setElapsedTime(0);
        setEvalResult(null);

        const startTime = Date.now();

        timerRef.current = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        try {
            const response = await summarizeService.summarize(input, model, 256);

            clearInterval(timerRef.current);
            const endTime = Date.now();
            const timeSeconds = ((endTime - startTime) / 1000).toFixed(1);

            const summaryText = response.summary || '';

            setOutput(summaryText);

            const inputWords = input.split(/\s+/).filter(w => w).length;
            const outputWords = summaryText.split(/\s+/).filter(w => w).length;
            const compressionRatio = ((1 - outputWords / inputWords) * 100).toFixed(1);

            setMetrics({
                compression: parseFloat(compressionRatio),
                inputWords,
                outputWords,
                time: `${timeSeconds}s`,
                modelUsed: response.model_used || model,
                inferenceTime: response.colab_inference_ms ? `${response.colab_inference_ms}ms` : null
            });

            try {
                await historyService.create({
                    input_text: input,
                    summary: summaryText,
                    model_used: response.model_used || model,
                    input_words: inputWords,
                    output_words: outputWords,
                    compression_ratio: parseFloat(compressionRatio),
                    processing_time_ms: Math.round((endTime - startTime)),
                    colab_inference_ms: response.colab_inference_ms || null
                });
            } catch (historyErr) {
                console.warn('Failed to save history:', historyErr);
            }
        } catch (err) {
            clearInterval(timerRef.current);

            if (err.name === 'CanceledError' || err.message === 'canceled') {
                setError('Đã hủy yêu cầu');
            } else {
                console.error('Summarization error:', err);
                setError(err.response?.data?.detail || err.message || 'Đã xảy ra lỗi');
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        clearInterval(timerRef.current);
        setIsLoading(false);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
        setMetrics(null);
        setError('');
        setElapsedTime(0);
        setShowEval(false);
        setReference('');
        setEvalResult(null);
        setEvalError('');
    };

    // Generate reference summary using Gemini
    const handleGenerateReference = async () => {
        if (!input.trim()) return;

        setGenRefLoading(true);
        setEvalError('');

        try {
            const response = await summarizeService.generateReference(input);
            setReference(response.reference_summary);
        } catch (err) {
            console.error('Generate reference error:', err);
            setEvalError(err.response?.data?.detail || 'Lỗi sinh tóm tắt gold. Kiểm tra GEMINI_API_KEY.');
        } finally {
            setGenRefLoading(false);
        }
    };

    // Evaluate summary against reference
    const handleEvaluate = async () => {
        if (!output.trim() || !reference.trim()) {
            setEvalError('Cần có bản tóm tắt và bản tham chiếu để đánh giá');
            return;
        }

        setEvalLoading(true);
        setEvalError('');
        setEvalResult(null);

        try {
            const response = await evaluationService.evaluateSingle(output, reference, calculateBert);
            setEvalResult(response);
        } catch (err) {
            console.error('Evaluation error:', err);
            setEvalError(err.response?.data?.detail || 'Lỗi đánh giá');
        } finally {
            setEvalLoading(false);
        }
    };

    const selectedModel = MODEL_OPTIONS.find(m => m.value === model);

    return (
        <div className="h-[calc(100vh-112px)] flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            disabled={isLoading}
                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                        >
                            {MODEL_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {selectedModel && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {selectedModel.tag}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isLoading && (
                        <span className="text-sm text-slate-500 font-mono">{elapsedTime}s</span>
                    )}
                    <button
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    {isLoading ? (
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={handleCancel}
                        >
                            <Square className="w-3.5 h-3.5" />
                            Hủy
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleRun}
                            disabled={!input.trim()}
                        >
                            <Play className="w-3.5 h-3.5" />
                            Tóm tắt
                        </Button>
                    )}
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
            <div className={`flex-1 grid ${showEval ? 'grid-cols-3' : 'grid-cols-2'} gap-4 overflow-hidden transition-all`}>
                {/* Input */}
                <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-blue-50 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Văn bản gốc</span>
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none focus:outline-none text-slate-700 text-sm leading-relaxed"
                        placeholder="Dán văn bản tiếng Việt cần tóm tắt..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="p-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                        {input.split(/\s+/).filter(w => w).length} từ • {input.length} ký tự
                    </div>
                </div>

                {/* Output */}
                <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-emerald-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-slate-700">Bản tóm tắt</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {output && (
                                <>
                                    <button
                                        className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${copied ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-100'}`}
                                        onClick={handleCopy}
                                    >
                                        {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                    <button
                                        className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${showEval ? 'text-violet-600 bg-violet-50' : 'text-slate-500 hover:bg-slate-100'}`}
                                        onClick={() => setShowEval(!showEval)}
                                        title="Đánh giá chất lượng"
                                    >
                                        <BarChart3 className="w-3.5 h-3.5" />
                                        {showEval ? <ChevronUp className="w-3 h-3" /> : 'Đánh giá'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-3" />
                                <p className="text-sm text-slate-500">Đang xử lý...</p>
                                <p className="text-xs text-slate-400 mt-1">{elapsedTime}s</p>
                            </div>
                        ) : output ? (
                            <p className="text-slate-700 text-sm leading-relaxed">{output}</p>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <FileText className="w-10 h-10 mb-2 opacity-50" />
                                <p className="text-sm">Nhấn "Tóm tắt" để bắt đầu</p>
                            </div>
                        )}
                    </div>
                    {output && (
                        <div className="p-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                            {metrics?.outputWords} từ • Giảm {metrics?.compression}%
                            {metrics?.inferenceTime && ` • GPU: ${metrics.inferenceTime}`}
                        </div>
                    )}
                </div>

                {/* Evaluation Panel */}
                {showEval && (
                    <div className="flex flex-col bg-white rounded-lg border border-violet-200 overflow-hidden">
                        <div className="p-3 border-b border-violet-100 bg-violet-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-violet-600" />
                                <span className="text-sm font-medium text-slate-700">Đánh giá chất lượng</span>
                            </div>
                            <button
                                className="p-1 hover:bg-violet-100 rounded text-slate-400 transition-colors"
                                onClick={() => setShowEval(false)}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                            {/* Reference Input */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-medium text-slate-600">Tóm tắt tham chiếu (Gold)</label>
                                    <button
                                        className="text-xs flex items-center gap-1 text-violet-600 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        onClick={handleGenerateReference}
                                        disabled={genRefLoading || !input.trim()}
                                        title="Dùng AI (Gemini) để tự động sinh bản tóm tắt gold"
                                    >
                                        {genRefLoading ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3" />
                                        )}
                                        {genRefLoading ? 'Đang sinh...' : 'AI sinh tự động'}
                                    </button>
                                </div>
                                <textarea
                                    className="w-full h-28 p-2.5 text-xs border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 text-slate-700 leading-relaxed"
                                    placeholder="Nhập bản tóm tắt tham chiếu hoặc nhấn 'AI sinh tự động'..."
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                />
                            </div>

                            {/* BERTScore toggle + Evaluate button */}
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={calculateBert}
                                        onChange={(e) => setCalculateBert(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                    />
                                    BERTScore
                                </label>
                                <Button
                                    size="sm"
                                    className="flex-1 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs py-1.5"
                                    onClick={handleEvaluate}
                                    disabled={evalLoading || !output.trim() || !reference.trim()}
                                >
                                    {evalLoading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <BarChart3 className="w-3 h-3" />
                                    )}
                                    {evalLoading ? 'Đang chấm...' : 'Chấm điểm'}
                                </Button>
                            </div>

                            {/* Eval Error */}
                            {evalError && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-2 rounded-lg text-xs flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {evalError}
                                </div>
                            )}

                            {/* Eval Results */}
                            {evalResult && (
                                <div className="space-y-2.5 bg-slate-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-700">Kết quả đánh giá</span>
                                        <span className="text-xs text-slate-400">{evalResult.processing_time_ms}ms</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <ScoreBar label="ROUGE-1" value={evalResult.rouge1} color="bg-blue-500" />
                                        <ScoreBar label="ROUGE-2" value={evalResult.rouge2} color="bg-sky-500" />
                                        <ScoreBar label="ROUGE-L" value={evalResult.rougeL} color="bg-cyan-500" />
                                        <ScoreBar label="BLEU" value={evalResult.bleu} color="bg-emerald-500" />
                                        {calculateBert && (
                                            <ScoreBar label="BERTScore" value={evalResult.bert_score} color="bg-violet-500" />
                                        )}
                                    </div>

                                    {/* Summary scores */}
                                    <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200">
                                        <div className="text-center p-2 bg-white rounded-lg">
                                            <div className="text-xs text-slate-500">ROUGE-L</div>
                                            <div className="text-lg font-bold text-cyan-600">
                                                {(evalResult.rougeL * 100).toFixed(1)}
                                            </div>
                                        </div>
                                        <div className="text-center p-2 bg-white rounded-lg">
                                            <div className="text-xs text-slate-500">
                                                {calculateBert ? 'BERTScore' : 'BLEU'}
                                            </div>
                                            <div className={`text-lg font-bold ${calculateBert ? 'text-violet-600' : 'text-emerald-600'}`}>
                                                {calculateBert
                                                    ? (evalResult.bert_score * 100).toFixed(1)
                                                    : (evalResult.bleu * 100).toFixed(1)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Bar */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="grid grid-cols-4 gap-6">
                    <div>
                        <span className="text-xs text-slate-500">Từ gốc</span>
                        <p className="text-xl font-semibold text-slate-900 mt-1">{metrics?.inputWords || '-'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500">Từ tóm tắt</span>
                        <p className="text-xl font-semibold text-blue-600 mt-1">{metrics?.outputWords || '-'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500">Tỉ lệ nén</span>
                        <p className="text-xl font-semibold text-emerald-600 mt-1">{metrics?.compression ? `${metrics.compression}%` : '-'}</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500">Thời gian</span>
                        <p className="text-xl font-semibold text-slate-900 mt-1">{metrics?.time || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playground;
