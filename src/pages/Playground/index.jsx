import { useState, useRef } from 'react';
import {
    Play,
    Settings2,
    Maximize2,
    Copy,
    RotateCcw,
    Loader2,
    Eye,
    FileText,
    CheckCircle,
    AlertCircle,
    Square
} from 'lucide-react';
import { Button } from '@/components/common';
import { api } from '@/services';

/**
 * Model options mapping to backend endpoints
 */
const MODEL_OPTIONS = [
    {
        value: 'extractive_smart',
        label: 'PhoBERT Smart (Recommended)',
        description: 'Trích xuất thông minh - An toàn 100%',
        endpoint: '/summarize/smart',
        badge: '🔥 Best'
    },
    {
        value: 'hybrid',
        label: 'Hybrid (PhoBERT + mT5)',
        description: 'Trích xuất + Viết lại - Văn phong tự nhiên',
        endpoint: '/summarize/hybrid',
        badge: null
    },
    {
        value: 'hybrid_vit5',
        label: 'Hybrid (PhoBERT + ViT5)',
        description: 'Trích xuất + ViT5 paraphrase',
        endpoint: '/summarize/hybrid-vit5',
        badge: null
    },
    {
        value: 'hybrid_bartpho',
        label: 'Hybrid (PhoBERT + BARTpho)',
        description: 'Trích xuất + BARTpho rewrite',
        endpoint: '/summarize/hybrid-bartpho',
        badge: null
    },
    {
        value: 'vit5',
        label: 'ViT5 (Fine-tuned)',
        description: 'Google ViT5 fine-tuned cho tiếng Việt',
        endpoint: '/summarize/multilingual',
        badge: null
    },
    {
        value: 'bartpho',
        label: 'BARTpho (VinAI)',
        description: 'Seq2Seq tiếng Việt tự nhiên',
        endpoint: '/summarize/bartpho',
        badge: null
    },
    {
        value: 'extractive',
        label: 'PhoBERT Extractive',
        description: 'Chỉ trích xuất câu - Không viết lại',
        endpoint: '/summarize/extractive',
        badge: null
    },
    {
        value: 'extractive_chunked',
        label: 'PhoBERT Chunked',
        description: 'Trích xuất theo chunks - Cân bằng',
        endpoint: '/summarize/chunked',
        badge: null
    },
];

const Playground = () => {
    const [model, setModel] = useState('extractive_smart');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDiff, setShowDiff] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    // AbortController để cancel request
    const abortControllerRef = useRef(null);
    const timerRef = useRef(null);

    const handleRun = async () => {
        if (!input.trim()) return;

        // Cancel request cũ nếu có
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Tạo AbortController mới
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setOutput('');
        setError('');
        setMetrics(null);
        setElapsedTime(0);

        const startTime = Date.now();

        // Timer để hiển thị thời gian đang chờ
        timerRef.current = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        try {
            const selectedModel = MODEL_OPTIONS.find(m => m.value === model);

            const response = await api.post(
                selectedModel.endpoint,
                { text: input },
                { signal: abortControllerRef.current.signal }
            );

            clearInterval(timerRef.current);
            const endTime = Date.now();
            const timeSeconds = ((endTime - startTime) / 1000).toFixed(1);

            // Handle different response formats
            const summaryText = response.summary ||
                response.final_summary ||
                response.rewritten_text ||
                response.text ||
                (typeof response === 'string' ? response : JSON.stringify(response));

            setOutput(summaryText);

            // Calculate basic metrics
            const inputWords = input.split(/\s+/).filter(w => w).length;
            const outputWords = summaryText.split(/\s+/).filter(w => w).length;
            const compressionRatio = ((1 - outputWords / inputWords) * 100).toFixed(1);

            setMetrics({
                compression: parseFloat(compressionRatio),
                inputWords,
                outputWords,
                time: `${timeSeconds}s`
            });
        } catch (err) {
            clearInterval(timerRef.current);

            if (err.name === 'CanceledError' || err.message === 'canceled') {
                setError('Đã hủy yêu cầu');
            } else {
                console.error('Summarization error:', err);
                setError(err.response?.data?.detail || err.message || 'Đã xảy ra lỗi khi tóm tắt');
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
    };

    const selectedModel = MODEL_OPTIONS.find(m => m.value === model);

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-slate-500" />
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            disabled={isLoading}
                            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[220px] disabled:opacity-50"
                        >
                            {MODEL_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.badge ? `${opt.badge} ` : ''}{opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedModel && (
                        <span className="text-xs text-slate-500 hidden md:block">
                            {selectedModel.description}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isLoading && (
                        <span className="text-sm text-slate-500 font-mono">
                            {elapsedTime}s
                        </span>
                    )}

                    {isLoading ? (
                        <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white gap-2"
                            onClick={handleCancel}
                        >
                            <Square className="w-4 h-4" />
                            Hủy
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                            onClick={handleRun}
                            disabled={!input.trim()}
                        >
                            <Play className="w-4 h-4" />
                            Tóm tắt
                        </Button>
                    )}
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
            <div className="flex-1 grid grid-cols-2 gap-4 h-full overflow-hidden">

                {/* Input Panel */}
                <div className="flex flex-col bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden hover:border-slate-300 transition-colors">
                    <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-700">Văn bản gốc</h3>
                        <div className="flex gap-2">
                            <button
                                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                title="Xóa"
                                onClick={handleClear}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Mở rộng">
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none focus:outline-none text-slate-700 font-mono text-sm leading-relaxed"
                        placeholder="Dán văn bản tiếng Việt cần tóm tắt vào đây..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="p-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                        <span>{input.split(/\s+/).filter(w => w).length} từ • {input.length} ký tự</span>
                        <span>UTF-8</span>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    <div className="flex-1 flex flex-col bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden hover:border-slate-300 transition-colors">
                        <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-700">Bản tóm tắt</h3>
                                {output && (
                                    <button
                                        onClick={() => setShowDiff(!showDiff)}
                                        className="p-1 hover:bg-slate-200 rounded text-slate-500 text-xs flex items-center gap-1"
                                        title="Toggle diff view"
                                    >
                                        <Eye className="w-3 h-3" />
                                        {showDiff ? 'Plain' : 'Mono'}
                                    </button>
                                )}
                            </div>
                            <button
                                className={`p-1 hover:bg-slate-200 rounded flex items-center gap-1 ${copied ? 'text-green-600' : 'text-slate-500'}`}
                                title="Copy"
                                onClick={handleCopy}
                                disabled={!output}
                            >
                                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    <p className="text-sm text-slate-500">
                                        Đang tóm tắt với {selectedModel?.label}...
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Đang chờ: {elapsedTime}s
                                    </p>
                                    <p className="text-xs text-slate-400 italic">
                                        (Lần đầu load model có thể mất 30-60s)
                                    </p>
                                    <div className="w-full max-w-xs space-y-2">
                                        <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                                        <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6"></div>
                                        <div className="h-3 bg-slate-200 rounded animate-pulse w-4/6"></div>
                                    </div>
                                </div>
                            ) : output ? (
                                <div className={showDiff ? 'font-mono text-sm' : 'text-slate-700 leading-relaxed'}>
                                    {output}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <FileText className="w-12 h-12 mb-2 opacity-50" />
                                    <p className="text-sm italic">Nhấn "Tóm tắt" để tạo bản tóm tắt...</p>
                                </div>
                            )}
                        </div>
                        {output && (
                            <div className="p-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                                {metrics?.outputWords} từ • Giảm {metrics?.compression}%
                            </div>
                        )}
                    </div>

                    {/* Quick Metrics */}
                    <div className="bg-white rounded-xl border-2 border-slate-200 shadow-md p-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Thống kê</h4>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Từ gốc', val: metrics?.inputWords || '-', color: 'text-slate-600' },
                                { label: 'Từ tóm tắt', val: metrics?.outputWords || '-', color: 'text-blue-600' },
                                { label: 'Nén', val: metrics?.compression ? `${metrics.compression}%` : '-', color: metrics?.compression ? 'text-emerald-600' : 'text-slate-400' },
                                { label: 'Thời gian', val: metrics?.time || '-', color: metrics?.time ? 'text-purple-600' : 'text-slate-400' }
                            ].map((m, i) => (
                                <div key={i} className="text-center p-2 bg-slate-50 rounded-lg">
                                    <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playground;
