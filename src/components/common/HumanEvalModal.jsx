import { useState } from 'react';
import { X, Star, MessageSquare, ThumbsUp, ThumbsDown, FileText, Save } from 'lucide-react';
import Button from './Button';
import { useTranslation } from 'react-i18next';

const HumanEvalModal = ({ isOpen, onClose, onSubmit, historyItem }) => {
    const { t } = useTranslation();
    const [scores, setScores] = useState({
        fluency: null,
        coherence: null,
        relevance: null,
        consistency: null
    });
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState('neutral');

    if (!isOpen) return null;

    const handleScoreChange = (criterion, value) => {
        setScores(prev => ({ ...prev, [criterion]: value }));
    };

    const handleSubmit = () => {
        const humanEval = {
            fluency: scores.fluency,
            coherence: scores.coherence,
            relevance: scores.relevance,
            consistency: scores.consistency
        };

        let finalRating = rating;
        const validScores = Object.values(scores).filter(s => s !== null);
        if (validScores.length > 0) {
            const avgScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
            if (avgScore >= 4) finalRating = 'good';
            else if (avgScore <= 2) finalRating = 'bad';
            else finalRating = 'neutral';
        }

        onSubmit({
            rating: finalRating,
            comment,
            human_eval: humanEval
        });

        setScores({ fluency: null, coherence: null, relevance: null, consistency: null });
        setComment('');
        setRating('neutral');
        onClose();
    };

    const isValid = Object.values(scores).some(s => s !== null);

    const criteriaData = [
        { key: 'fluency', label: t('humanEval.fluency'), desc: t('humanEval.fluencyDesc') },
        { key: 'coherence', label: t('humanEval.coherence'), desc: t('humanEval.coherenceDesc') },
        { key: 'relevance', label: t('humanEval.relevance'), desc: t('humanEval.relevanceDesc') },
        { key: 'consistency', label: t('humanEval.consistency'), desc: t('humanEval.consistencyDesc') }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Star className="w-5 h-5 text-slate-600" />
                            {t('humanEval.title')}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">{t('humanEval.subtitle')}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Summary Preview */}
                    {historyItem && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                                <FileText className="w-4 h-4" />
                                {t('humanEval.summaryReview')}
                            </div>
                            <p className="text-slate-800 text-sm leading-relaxed line-clamp-3">{historyItem.summary}</p>
                        </div>
                    )}

                    {/* Evaluation Criteria */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-3">{t('humanEval.criteria')}</h3>
                        <div className="space-y-3">
                            {criteriaData.map(({ key, label, desc }) => (
                                <div key={key} className="bg-white border border-slate-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-medium text-slate-800">{label}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                        </div>
                                        {scores[key] && (
                                            <span className="text-lg font-semibold text-blue-600">
                                                {scores[key]}/5
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <button
                                                key={value}
                                                onClick={() => handleScoreChange(key, value)}
                                                className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium text-sm transition-all ${scores[key] >= value
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                        {scores[key] && (
                                            <button
                                                onClick={() => handleScoreChange(key, null)}
                                                className="ml-2 px-2 py-1 text-xs text-slate-500 hover:text-red-600 rounded transition-colors"
                                            >
                                                {t('humanEval.clear')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Overall Rating */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-3">{t('humanEval.overallRating')}</h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRating('good')}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border ${rating === 'good'
                                        ? 'bg-emerald-500 text-white border-emerald-500'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                    }`}
                            >
                                <ThumbsUp className="w-4 h-4" />
                                {t('common.good')}
                            </button>
                            <button
                                onClick={() => setRating('neutral')}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all border ${rating === 'neutral'
                                        ? 'bg-slate-500 text-white border-slate-500'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                {t('common.neutral')}
                            </button>
                            <button
                                onClick={() => setRating('bad')}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border ${rating === 'bad'
                                        ? 'bg-red-500 text-white border-red-500'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50'
                                    }`}
                            >
                                <ThumbsDown className="w-4 h-4" />
                                {t('common.bad')}
                            </button>
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('humanEval.commentLabel')}
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('humanEval.commentPlaceholder')}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                            rows={3}
                            maxLength={500}
                        />
                        <div className="text-xs text-slate-400 mt-1 text-right">
                            {comment.length}/500
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-200 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {t('humanEval.saveEval')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HumanEvalModal;
