import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, RotateCcw, Play, Clock, FileText } from 'lucide-react';
import Button from '@/components/common/Button';
import { summarizeService } from '@/services';

const MODEL_OPTIONS = [
    { id: 'vit5', name: 'ViT5', tag: 'Fast' },
    { id: 'phobert_vit5', name: 'PhoBERT + ViT5', tag: 'Best' },
    { id: 'qwen', name: 'Qwen 7B', tag: 'LLM' }
];

const CompareModels = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [selectedModels, setSelectedModels] = useState(['vit5', 'phobert_vit5', 'qwen']);

    const toggleModel = (modelId) => {
        setSelectedModels(prev =>
            prev.includes(modelId)
                ? prev.filter(m => m !== modelId)
                : [...prev, modelId]
        );
    };

    const handleCompare = async () => {
        if (!text.trim() || text.length < 10) {
            setError('Vui lòng nhập văn bản tối thiểu 10 ký tự');
            return;
        }

        if (selectedModels.length === 0) {
            setError('Vui lòng chọn ít nhất 1 model');
            return;
        }

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const response = await summarizeService.compareModels(text, selectedModels);
            setResults(response);
        } catch (err) {
            console.error('Compare error:', err);
            setError(err.response?.data?.detail || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setText('');
        setResults(null);
        setError('');
    };

    return (
        <div className="h-[calc(100vh-112px)] flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">Models:</span>
                    <div className="flex items-center gap-2">
                        {MODEL_OPTIONS.map((model) => {
                            const isSelected = selectedModels.includes(model.id);
                            return (
                                <button
                                    key={model.id}
                                    onClick={() => toggleModel(model.id)}
                                    disabled={loading}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isSelected
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {model.name}
                                </button>
                            );
                        })}
                    </div>
                    <span className="text-xs text-slate-400 ml-2">
                        {selectedModels.length} selected
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        onClick={handleClear}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <Button
                        size="sm"
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleCompare}
                        disabled={loading || text.length < 10 || selectedModels.length === 0}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5" />
                                So sánh
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
                {/* Input */}
                <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-blue-50 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Văn bản gốc</span>
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none focus:outline-none text-slate-700 text-sm leading-relaxed"
                        placeholder="Dán văn bản tiếng Việt cần so sánh..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                    />
                    <div className="p-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                        {text.split(/\s+/).filter(w => w).length} từ • {text.length} ký tự
                    </div>
                </div>

                {/* Results */}
                <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-emerald-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-slate-700">Kết quả</span>
                        </div>
                        {results && (
                            <span className="text-xs text-slate-400">
                                {results.total_time_s}s tổng
                            </span>
                        )}
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-3" />
                                <p className="text-sm text-slate-500">Đang chạy {selectedModels.length} models...</p>
                            </div>
                        ) : results ? (
                            <div className="space-y-4">
                                {results.results.map((result, idx) => {
                                    const model = MODEL_OPTIONS.find(m => m.id === result.model);
                                    return (
                                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900 text-sm">{model?.name || result.model}</span>
                                                    <span className="text-xs text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">{model?.tag}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {result.inference_time_s}s
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                {result.error ? (
                                                    <p className="text-red-600 text-sm">{result.error}</p>
                                                ) : (
                                                    <p className="text-slate-700 text-sm leading-relaxed">{result.summary}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <p className="text-sm">Nhập văn bản và nhấn "So sánh"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareModels;
