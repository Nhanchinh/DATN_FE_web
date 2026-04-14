import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, RotateCcw, Play, Clock, FileText, Sparkles, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/common/Button';
import { summarizeService } from '@/services';
import { useTranslation } from 'react-i18next';

const MODEL_OPTIONS = [
    { id: 'vit5_fin', name: 'ViT5 Financial v2', tagKey: 'modelTags.financial' },
    { id: 'qwen', name: 'Qwen 7B', tagKey: 'modelTags.llm' },
    { id: 'phobert_finance', name: 'PhoBERT Finance', tagKey: 'modelTags.extractive' }
];

const RANK_STYLES = {
    1: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', score: 'text-amber-600' },
    2: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-600', score: 'text-slate-600' },
    3: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-500', score: 'text-slate-500' },
};

const CompareModels = () => {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [selectedModels, setSelectedModels] = useState(['vit5_fin', 'qwen', 'phobert_finance']);

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
            setError(t('compare.minCharsError'));
            return;
        }

        if (selectedModels.length === 0) {
            setError(t('compare.selectModelError'));
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
            setError(err.response?.data?.detail || t('compare.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleAIJudge = async () => {
        if (!results || results.results.length < 2) {
            setJudgeError(t('compare.needTwoSummaries'));
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
                setJudgeError(t('compare.needTwoSuccess'));
                return;
            }

            const response = await summarizeService.aiJudge(text, summaries);
            setJudgeResult(response);
        } catch (err) {
            console.error('AI Judge error:', err);
            setJudgeError(err.response?.data?.detail || t('compare.aiJudgeError'));
        } finally {
            setJudging(false);
        }
    };

    const [expandedModels, setExpandedModels] = useState(new Set());

    const toggleExpand = (modelId) => {
        setExpandedModels(prev => {
            const next = new Set(prev);
            if (next.has(modelId)) {
                next.delete(modelId);
            } else {
                next.add(modelId);
            }
            return next;
        });
    };

    const handleClear = () => {
        setText('');
        setResults(null);
        setError('');
        setJudgeResult(null);
        setJudgeError('');
        setExpandedModels(new Set());
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
                    <span className="text-sm font-medium text-slate-700">{t('common.model')}:</span>
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
                        {t('common.selected')} {selectedModels.length}
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
                                {t('common.processing')}
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5" />
                                {t('compare.compare')}
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
                        <span className="text-sm font-medium text-slate-700">{t('common.original')}</span>
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none focus:outline-none text-slate-700 text-sm leading-relaxed"
                        placeholder={t('compare.placeholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                    />
                    <div className="p-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                        {text.split(/\s+/).filter(w => w).length} {t('common.words')} • {text.length} {t('common.chars')}
                    </div>
                </div>

                {/* Results */}
                <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-emerald-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-slate-700">{t('common.result')}</span>
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
                                        {t('compare.aiJudge')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-3" />
                                <p className="text-sm text-slate-500">{t('compare.runningModels', { count: selectedModels.length })}</p>
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
                                    <div className="mb-2">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{t('compare.evalResult')}</h3>
                                            <span className="text-[11px] text-slate-400 font-mono">{judgeResult.processing_time_ms}ms</span>
                                        </div>

                                        {/* Rankings */}
                                        <div className="space-y-2 mb-4">
                                            {judgeResult.rankings.map((r) => {
                                                const style = RANK_STYLES[r.rank] || RANK_STYLES[3];
                                                return (
                                                    <div key={r.model} className={`flex items-center gap-3 p-3 rounded-lg border ${style.border} ${style.bg}`}>
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${style.badge}`}>
                                                            {r.rank}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-slate-800">{getModelName(r.model)}</span>
                                                                {r.rank === 1 && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-0.5">{r.reasoning}</p>
                                                        </div>
                                                        <div className={`text-lg font-bold tabular-nums ${style.score}`}>{r.score}<span className="text-xs font-normal text-slate-400">/100</span></div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Overall Analysis */}
                                        <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
                                            {judgeResult.detailed_analysis}
                                        </p>

                                        {/* Divider */}
                                        <div className="border-t border-slate-100 mb-3" />

                                        {/* Per-Model Detail - Accordion */}
                                        {judgeResult.model_analyses && judgeResult.model_analyses.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('compare.modelDetail')}</h4>
                                                <div className="space-y-1.5">
                                                    {judgeResult.model_analyses.map((analysis) => {
                                                        const ranking = judgeResult.rankings.find(r => r.model === analysis.model);
                                                        const isExpanded = expandedModels.has(analysis.model);
                                                        const criteria = [
                                                            { label: t('compare.fluency'), score: analysis.fluency_score },
                                                            { label: t('compare.coherence'), score: analysis.coherence_score },
                                                            { label: t('compare.relevance'), score: analysis.relevance_score },
                                                            { label: t('compare.consistency'), score: analysis.consistency_score },
                                                        ];

                                                        const hasIssues = (analysis.missing_points?.length > 0) || (analysis.incorrect_points?.length > 0);

                                                        return (
                                                            <div key={analysis.model} className="border border-slate-200 rounded-lg overflow-hidden">
                                                                <button
                                                                    onClick={() => toggleExpand(analysis.model)}
                                                                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <span className="text-sm font-medium text-slate-700 flex-1 text-left">{getModelName(analysis.model)}</span>

                                                                    {/* Mini score chips */}
                                                                    <div className="hidden sm:flex items-center gap-1">
                                                                        {criteria.map((c) => (
                                                                            <span key={c.label} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                                                                c.score >= 90 ? 'bg-emerald-50 text-emerald-700' :
                                                                                c.score >= 70 ? 'bg-slate-100 text-slate-600' :
                                                                                'bg-red-50 text-red-600'
                                                                            }`}>{c.score}</span>
                                                                        ))}
                                                                    </div>

                                                                    {ranking && (
                                                                        <span className="text-xs font-semibold text-slate-500">{ranking.score}{t('auth.points')}</span>
                                                                    )}
                                                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                                                                </button>

                                                                {isExpanded && (
                                                                    <div className="px-3 pb-3 border-t border-slate-100">
                                                                        {/* Score breakdown */}
                                                                        <div className="grid grid-cols-4 gap-3 py-3">
                                                                            {criteria.map((c) => (
                                                                                <div key={c.label}>
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className="text-[11px] text-slate-500">{c.label}</span>
                                                                                        <span className="text-[11px] font-semibold text-slate-700">{c.score}</span>
                                                                                    </div>
                                                                                    <div className="w-full bg-slate-100 rounded-full h-1">
                                                                                        <div
                                                                                            className={`h-1 rounded-full transition-all duration-500 ${
                                                                                                c.score >= 90 ? 'bg-emerald-500' :
                                                                                                c.score >= 70 ? 'bg-slate-400' :
                                                                                                'bg-red-400'
                                                                                            }`}
                                                                                            style={{ width: `${c.score}%` }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        {/* Strengths */}
                                                                        {analysis.strengths?.length > 0 && (
                                                                            <div className="mb-2">
                                                                                <h5 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('compare.strengths')}</h5>
                                                                                <ul className="space-y-0.5">
                                                                                    {analysis.strengths.map((s, i) => (
                                                                                        <li key={i} className="text-xs text-slate-600 flex gap-2">
                                                                                            <span className="text-emerald-400 mt-0.5 shrink-0">+</span>
                                                                                            <span>{s}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Weaknesses */}
                                                                        {analysis.weaknesses?.length > 0 && (
                                                                            <div className="mb-2">
                                                                                <h5 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('compare.weaknesses')}</h5>
                                                                                <ul className="space-y-0.5">
                                                                                    {analysis.weaknesses.map((w, i) => (
                                                                                        <li key={i} className="text-xs text-slate-600 flex gap-2">
                                                                                            <span className="text-orange-400 mt-0.5 shrink-0">−</span>
                                                                                            <span>{w}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Missing & Incorrect - grouped */}
                                                                        {hasIssues && (
                                                                            <div className="bg-slate-50 rounded-md p-2.5 mt-1 space-y-2">
                                                                                {analysis.missing_points?.length > 0 && (
                                                                                    <div>
                                                                                        <h5 className="text-[11px] font-semibold text-red-500 mb-1">{t('compare.missingPoints')}</h5>
                                                                                        <ul className="space-y-0.5">
                                                                                            {analysis.missing_points.map((m, i) => (
                                                                                                <li key={i} className="text-xs text-slate-600 pl-3 relative before:content-['–'] before:absolute before:left-0 before:text-red-400">{m}</li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                )}
                                                                                {analysis.incorrect_points?.length > 0 && (
                                                                                    <div>
                                                                                        <h5 className="text-[11px] font-semibold text-red-500 mb-1">{t('compare.incorrectPoints')}</h5>
                                                                                        <ul className="space-y-0.5">
                                                                                            {analysis.incorrect_points.map((ic, i) => (
                                                                                                <li key={i} className="text-xs text-slate-600 pl-3 relative before:content-['–'] before:absolute before:left-0 before:text-red-400">{ic}</li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
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
                                                    <span className="text-xs text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">{t(model?.tagKey)}</span>
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
                                <p className="text-sm">{t('compare.inputText')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareModels;
