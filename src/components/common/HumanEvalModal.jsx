import { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import Button from './Button';

const HumanEvalModal = ({ isOpen, onClose, onSubmit, historyItem }) => {
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

        // Tính average score để auto-set rating
        const validScores = Object.values(scores).filter(s => s !== null);
        if (validScores.length > 0) {
            const avgScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
            if (avgScore >= 4) rating = 'good';
            else if (avgScore <= 2) rating = 'bad';
            else rating = 'neutral';
        }

        onSubmit({
            rating,
            comment,
            human_eval: humanEval
        });

        // Reset form
        setScores({ fluency: null, coherence: null, relevance: null, consistency: null });
        setComment('');
        setRating('neutral');
        onClose();
    };

    const isValid = Object.values(scores).some(s => s !== null);

    const criteriaData = [
        { 
            key: 'fluency', 
            label: 'Fluency (Trôi chảy)', 
            desc: 'Văn phong tự nhiên, không lỗi ngữ pháp',
            icon: '✍️'
        },
        { 
            key: 'coherence', 
            label: 'Coherence (Mạch lạc)', 
            desc: 'Các ý kết nối chặt chẽ, logic rõ ràng',
            icon: '🔗'
        },
        { 
            key: 'relevance', 
            label: 'Relevance (Liên quan)', 
            desc: 'Nội dung đúng trọng tâm, không thừa',
            icon: '🎯'
        },
        { 
            key: 'consistency', 
            label: 'Consistency (Nhất quán)', 
            desc: 'Không mâu thuẫn, thông tin chính xác',
            icon: '✅'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Star className="w-6 h-6" />
                            Human Evaluation Form
                        </h2>
                        <p className="text-indigo-100 mt-1 text-sm">Đánh giá chất lượng tóm tắt theo tiêu chí thủ công</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Summary Preview */}
                    {historyItem && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-600 mb-2">📝 Summary đang đánh giá:</h4>
                            <p className="text-slate-800 text-sm leading-relaxed line-clamp-3">{historyItem.summary}</p>
                        </div>
                    )}

                    {/* Evaluation Criteria */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Tiêu chí đánh giá (1-5 điểm)
                        </h3>

                        {criteriaData.map(({ key, label, desc, icon }) => (
                            <div key={key} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                            <span className="text-xl">{icon}</span>
                                            {label}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1">{desc}</p>
                                    </div>
                                    {scores[key] && (
                                        <span className="text-2xl font-bold text-indigo-600 ml-2">
                                            {scores[key]}
                                        </span>
                                    )}
                                </div>

                                {/* Star Rating */}
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            onClick={() => handleScoreChange(key, value)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                                                scores[key] >= value
                                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md scale-110'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                    {scores[key] && (
                                        <button
                                            onClick={() => handleScoreChange(key, null)}
                                            className="ml-2 px-3 py-1 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Overall Rating */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                        <h4 className="font-semibold text-indigo-900 mb-3">Đánh giá tổng quan</h4>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRating('good')}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                                    rating === 'good'
                                        ? 'bg-green-500 text-white shadow-md'
                                        : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                                }`}
                            >
                                👍 Tốt
                            </button>
                            <button
                                onClick={() => setRating('neutral')}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                                    rating === 'neutral'
                                        ? 'bg-slate-500 text-white shadow-md'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                😐 Trung bình
                            </button>
                            <button
                                onClick={() => setRating('bad')}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                                    rating === 'bad'
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                                }`}
                            >
                                👎 Tệ
                            </button>
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            💬 Nhận xét (tuỳ chọn)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Ghi chú thêm về bản tóm tắt này..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            rows={3}
                            maxLength={500}
                        />
                        <div className="text-xs text-slate-400 mt-1 text-right">
                            {comment.length}/500 ký tự
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 p-6 rounded-b-2xl border-t border-slate-200 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ✨ Lưu đánh giá
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HumanEvalModal;

