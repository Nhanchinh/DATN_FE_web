import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, RotateCcw, Play, Clock, FileText, Sparkles, Trophy, Award } from 'lucide-react';
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

    // AI Judge state
    const [judging, setJudging] = useState(false);
    const [judgeResult, setJudgeResult] = useState(null);
    const [judgeError, setJudgeError] = useState('');

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
        setJudgeResult(null);
        setJudgeError('');

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

    const handleAIJudge = async () => {
        if (!results || results.results.length < 2) {
            setJudgeError('Cần ít nhất 2 bản tóm tắt để AI đánh giá');
            return;
        }

        setJudging(true);
        setJudgeError('');
        setJudgeResult(null);

        try {
            const summaries = results.results
                .filter(r => !r.error)
                .map(r => ({ model: r.model, summary: r.summary }));

            if (summaries.length < 2) {
                setJudgeError('Cần ít nhất 2 bản tóm tắt thành công để AI đánh giá');
                return;
            }

            const response = await summarizeService.aiJudge(text, summaries);
            setJudgeResult(response);
        } catch (err) {
            console.error('AI Judge error:', err);
            setJudgeError(err.response?.data?.detail || 'Lỗi AI Judge. Kiểm tra GEMINI_API_KEY.');
        } finally {
            setJudging(false);
        }
    };

    const handleClear = () => {
        setText('');
        setResults(null);
        setError('');
        setJudgeResult(null);
        setJudgeError('');
    };

    const getModelName = (modelId) => {
        const model = MODEL_OPTIONS.find(m => m.id === modelId);
        return model?.name || modelId;
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
                        <div className="flex items-center gap-2">
                            {results && (
                                <>
                                    <span className="text-xs text-slate-400">
                                        {results.total_time_s}s
                                    </span>
                                    <Button
                                        size="sm"
                                        className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs px-2 py-1"
                                        onClick={handleAIJudge}
                                        disabled={judging || results.results.filter(r => !r.error).length < 2}
                                    >
                                        {judging ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3" />
                                        )}
                                        AI Judge
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-3" />
                                <p className="text-sm text-slate-500">Đang chạy {selectedModels.length} models...</p>
                            </div>
                        ) : results ? (
                            <div className="space-y-4">
                                {/* AI Judge Result */}
                                {judgeError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                                        {judgeError}
                                    </div>
                                )}

                                {judgeResult && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Trophy className="w-5 h-5 text-amber-600" />
                                            <span className="font-semibold text-amber-900">AI Judge Result</span>
                                            <span className="text-xs text-amber-600 ml-auto">{judgeResult.processing_time_ms}ms</span>
                                        </div>

                                        {/* Winner */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <Award className="w-4 h-4 text-amber-600" />
                                            <span className="text-sm text-slate-700">Winner:</span>
                                            <span className="font-semibold text-amber-900">{getModelName(judgeResult.winner)}</span>
                                        </div>

                                        {/* Rankings */}
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            {judgeResult.rankings.map((r) => (
                                                <div key={r.model} className={`p-2 rounded text-center ${r.rank === 1 ? 'bg-amber-100' : 'bg-white'}`}>
                                                    <div className="text-xs text-slate-500">#{r.rank}</div>
                                                    <div className="font-medium text-slate-800 text-sm">{getModelName(r.model)}</div>
                                                    <div className="text-lg font-bold text-amber-600">{r.score}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Analysis */}
                                        <p className="text-sm text-slate-700 bg-white p-2 rounded border border-amber-100">
                                            {judgeResult.detailed_analysis}
                                        </p>
                                    </div>
                                )}

                                {/* Model Results */}
                                {results.results.map((result, idx) => {
                                    const model = MODEL_OPTIONS.find(m => m.id === result.model);
                                    const isWinner = judgeResult?.winner === result.model;
                                    return (
                                        <div key={idx} className={`border rounded-lg overflow-hidden ${isWinner ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'}`}>
                                            <div className={`px-4 py-3 border-b flex items-center justify-between ${isWinner ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                                                <div className="flex items-center gap-2">
                                                    {isWinner && <Trophy className="w-4 h-4 text-amber-500" />}
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
