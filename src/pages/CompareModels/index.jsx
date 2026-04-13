import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, RotateCcw, Play, Clock, FileText, Sparkles, Trophy, Award, Search } from 'lucide-react';
import Button from '@/components/common/Button';
import { summarizeService } from '@/services';

const MODEL_OPTIONS = [
    { id: 'vit5', name: 'ViT5', tag: 'Fast' },
    { id: 'phobert_vit5', name: 'PhoBERT + ViT5', tag: 'Best' },
    { id: 'vit5_fin', name: 'ViT5 Financial v2', tag: 'Finance' },
    { id: 'qwen', name: 'Qwen 7B', tag: 'LLM' },
    { id: 'phobert_finance', name: 'PhoBERT Finance', tag: 'Extractive' }
];

const CompareModels = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [selectedModels, setSelectedModels] = useState(['vit5', 'phobert_vit5', 'vit5_fin', 'qwen', 'phobert_finance']);

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
                                    <div className="space-y-3">
                                        {/* Overall Winner Card */}
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Trophy className="w-5 h-5 text-amber-600" />
                                                <span className="font-semibold text-amber-900">AI Judge Result</span>
                                                <span className="text-xs text-amber-600 ml-auto">{judgeResult.processing_time_ms}ms</span>
                                            </div>

                                            {/* Rankings */}
                                            <div className="flex gap-2 mb-3">
                                                {judgeResult.rankings.map((r) => (
                                                    <div key={r.model} className={`flex-1 p-2.5 rounded-lg text-center ${r.rank === 1 ? 'bg-amber-100 border border-amber-300' : 'bg-white border border-slate-200'}`}>
                                                        <div className="text-xs text-slate-500 mb-0.5">#{r.rank}</div>
                                                        <div className="font-semibold text-slate-800 text-sm">{getModelName(r.model)}</div>
                                                        <div className={`text-xl font-bold ${r.rank === 1 ? 'text-amber-600' : 'text-slate-500'}`}>{r.score}</div>
                                                        <div className="text-xs text-slate-500 mt-1 leading-snug">{r.reasoning}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Overall Analysis */}
                                            <p className="text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-amber-100 leading-relaxed">
                                                {judgeResult.detailed_analysis}
                                            </p>
                                        </div>

                                        {/* Per-Model Detailed Analysis */}
                                        {judgeResult.model_analyses && judgeResult.model_analyses.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 px-1">
                                                    <Search className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm font-medium text-slate-700">Phân tích chi tiết từng model</span>
                                                </div>

                                                {judgeResult.model_analyses.map((analysis) => {
                                                    const isWinnerModel = judgeResult.winner === analysis.model;
                                                    const ranking = judgeResult.rankings.find(r => r.model === analysis.model);
                                                    const criteria = [
                                                        { label: 'Trôi chảy', score: analysis.fluency_score, color: 'bg-blue-500' },
                                                        { label: 'Mạch lạc', score: analysis.coherence_score, color: 'bg-emerald-500' },
                                                        { label: 'Liên quan', score: analysis.relevance_score, color: 'bg-violet-500' },
                                                        { label: 'Nhất quán', score: analysis.consistency_score, color: 'bg-orange-500' },
                                                    ];

                                                    return (
                                                        <div key={analysis.model} className={`border rounded-lg overflow-hidden ${isWinnerModel ? 'border-amber-300' : 'border-slate-200'}`}>
                                                            {/* Header */}
                                                            <div className={`px-3 py-2 flex items-center justify-between ${isWinnerModel ? 'bg-amber-50' : 'bg-slate-50'}`}>
                                                                <div className="flex items-center gap-2">
                                                                    {isWinnerModel && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                                                                    <span className="font-medium text-sm text-slate-800">{getModelName(analysis.model)}</span>
                                                                    {ranking && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isWinnerModel ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>#{ranking.rank} · {ranking.score}đ</span>}
                                                                </div>
                                                            </div>

                                                            <div className="p-3 space-y-2.5">
                                                                {/* Criteria Scores */}
                                                                <div className="grid grid-cols-4 gap-1.5">
                                                                    {criteria.map((c) => (
                                                                        <div key={c.label} className="text-center">
                                                                            <div className="text-xs text-slate-500 mb-1">{c.label}</div>
                                                                            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-0.5">
                                                                                <div className={`${c.color} h-1.5 rounded-full transition-all`} style={{ width: `${c.score}%` }} />
                                                                            </div>
                                                                            <div className="text-xs font-semibold text-slate-700">{c.score}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Strengths */}
                                                                {analysis.strengths && analysis.strengths.length > 0 && (
                                                                    <div>
                                                                        <div className="text-xs font-medium text-emerald-700 mb-1">✅ Điểm mạnh</div>
                                                                        <ul className="space-y-0.5">
                                                                            {analysis.strengths.map((s, i) => (
                                                                                <li key={i} className="text-xs text-slate-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-emerald-500">{s}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Weaknesses */}
                                                                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                                                                    <div>
                                                                        <div className="text-xs font-medium text-orange-700 mb-1">⚠️ Điểm yếu</div>
                                                                        <ul className="space-y-0.5">
                                                                            {analysis.weaknesses.map((w, i) => (
                                                                                <li key={i} className="text-xs text-slate-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-orange-500">{w}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Missing Points */}
                                                                {analysis.missing_points && analysis.missing_points.length > 0 && (
                                                                    <div className="bg-red-50 rounded p-2">
                                                                        <div className="text-xs font-medium text-red-700 mb-1">❌ Ý quan trọng bị thiếu</div>
                                                                        <ul className="space-y-0.5">
                                                                            {analysis.missing_points.map((m, i) => (
                                                                                <li key={i} className="text-xs text-red-600 pl-3 relative before:content-['•'] before:absolute before:left-0">{m}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Incorrect Points */}
                                                                {analysis.incorrect_points && analysis.incorrect_points.length > 0 && (
                                                                    <div className="bg-yellow-50 rounded p-2">
                                                                        <div className="text-xs font-medium text-yellow-800 mb-1">🔴 Thông tin sai/bóp méo</div>
                                                                        <ul className="space-y-0.5">
                                                                            {analysis.incorrect_points.map((ic, i) => (
                                                                                <li key={i} className="text-xs text-yellow-700 pl-3 relative before:content-['•'] before:absolute before:left-0">{ic}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
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
