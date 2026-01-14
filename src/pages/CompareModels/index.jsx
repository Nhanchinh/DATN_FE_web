import { useState } from 'react';
import { Zap, Loader2, AlertCircle, CheckCircle, GitCompare, RotateCcw, Sparkles } from 'lucide-react';
import Button from '@/components/common/Button';
import { summarizeService } from '@/services';

const CompareModels = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [selectedModels, setSelectedModels] = useState(['vit5', 'phobert_vit5', 'qwen']); // Mặc định chọn cả 3

    // Model info
    const modelInfo = {
        vit5: {
            name: 'ViT5',
            description: 'ViT5 thuần túy - sinh tóm tắt trực tiếp',
            icon: '⭐',
            color: 'blue',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500',
            textColor: 'text-blue-700',
            checkColor: 'bg-blue-600',
            gradientFrom: 'from-blue-500',
            gradientTo: 'to-blue-600'
        },
        phobert_vit5: {
            name: 'PhoBERT + ViT5',
            description: 'PhoBERT ranking + ViT5 generation',
            icon: '🔥',
            color: 'purple',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-500',
            textColor: 'text-purple-700',
            checkColor: 'bg-purple-600',
            gradientFrom: 'from-purple-500',
            gradientTo: 'to-purple-600'
        },
        qwen: {
            name: 'Qwen 7B',
            description: 'Large Language Model - Qwen 2.5',
            icon: '🚀',
            color: 'orange',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-500',
            textColor: 'text-orange-700',
            checkColor: 'bg-orange-600',
            gradientFrom: 'from-orange-500',
            gradientTo: 'to-orange-600'
        }
    };

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
            setError('Vui lòng chọn ít nhất 1 model để so sánh');
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
            setError(err.response?.data?.detail || 'Có lỗi xảy ra khi so sánh models');
        } finally {
            setLoading(false);
        }
    };

    const handleExample = () => {
        setText('Trí tuệ nhân tạo (AI) đang ngày càng trở nên phổ biến trong cuộc sống hàng ngày. Từ các trợ lý ảo như Siri, Alexa đến các hệ thống gợi ý sản phẩm trên các trang thương mại điện tử, AI đã thay đổi cách chúng ta tương tác với công nghệ. Trong y tế, AI giúp chẩn đoán bệnh chính xác hơn và nhanh hơn. Trong giáo dục, AI cá nhân hóa trải nghiệm học tập cho từng học sinh. Tuy nhiên, sự phát triển của AI cũng đặt ra nhiều thách thức về đạo đức, quyền riêng tư và việc làm của con người.');
        setResults(null);
        setError('');
    };

    const handleClear = () => {
        setText('');
        setResults(null);
        setError('');
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col gap-4">
            {/* Toolbar - Model Selection */}
            <div className="p-4 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <GitCompare className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-bold text-slate-700">Chọn models để so sánh</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600">
                            <span className="font-bold text-slate-800">{selectedModels.length}</span> model{selectedModels.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(modelInfo).map(([id, info]) => {
                        const isSelected = selectedModels.includes(id);
                        return (
                            <button
                                key={id}
                                onClick={() => toggleModel(id)}
                                className={`group relative p-4 rounded-lg border-2 transition-all text-left ${
                                    isSelected
                                        ? `${info.borderColor} ${info.bgColor}`
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                {/* Checkbox */}
                                <div className="absolute top-3 right-3">
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                        isSelected
                                            ? `${info.borderColor} ${info.checkColor}`
                                            : 'border-slate-300 bg-white group-hover:border-slate-400'
                                    }`}>
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="pr-8">
                                    <div className="text-2xl mb-1">{info.icon}</div>
                                    <div className={`font-bold text-sm mb-0.5 ${
                                        isSelected ? info.textColor : 'text-slate-700'
                                    }`}>
                                        {info.name}
                                    </div>
                                    <div className={`text-xs ${
                                        isSelected ? 'text-slate-600' : 'text-slate-500'
                                    }`}>
                                        {info.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
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
                
                {/* Left Panel - Input */}
                <div className="flex flex-col bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden">
                    <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-700">📝 Văn bản gốc</h3>
                        <div className="flex gap-2">
                            <button
                                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                title="Xóa"
                                onClick={handleClear}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                title="Ví dụ"
                                onClick={handleExample}
                            >
                                <Sparkles className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none focus:outline-none text-slate-700 text-sm leading-relaxed"
                        placeholder="Dán văn bản tiếng Việt cần tóm tắt vào đây..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                    />
                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                            {text.split(/\s+/).filter(w => w).length} từ • {text.length} ký tự
                        </span>
                        <Button
                            onClick={handleCompare}
                            disabled={loading || text.length < 10 || selectedModels.length === 0}
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang so sánh...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    So sánh
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right Panel - Results */}
                <div className="flex flex-col bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden">
                    <div className="p-3 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-sm font-semibold text-slate-700">🎯 Kết quả so sánh</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-indigo-900 mb-1">
                                        Đang xử lý...
                                    </p>
                                    <p className="text-xs text-indigo-600">
                                        Chạy qua {selectedModels.length} model{selectedModels.length > 1 ? 's' : ''}: {selectedModels.map(m => modelInfo[m]?.name).join(' → ')}
                                    </p>
                                    <p className="text-xs text-indigo-500 mt-2">
                                        Ước tính: {selectedModels.length * 5}-{selectedModels.length * 10}s
                                    </p>
                                </div>
                            </div>
                        ) : results ? (
                            <div className="space-y-4">
                                {/* Summary Stats */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                        <div>
                                            <h4 className="font-bold text-emerald-900 text-sm">So sánh hoàn tất</h4>
                                            <p className="text-emerald-600 text-xs">
                                                {results.results.length} models • {results.total_time_s}s
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Model Results */}
                                <div className="space-y-3">
                                    {results.results.map((result, idx) => {
                                        const info = modelInfo[result.model] || {};
                                        return (
                                            <div 
                                                key={idx} 
                                                className="border-2 border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                {/* Header */}
                                                <div className={`bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} p-3 text-white`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{info.icon}</span>
                                                            <div>
                                                                <h4 className="font-bold text-sm">{info.name}</h4>
                                                                <p className="text-xs text-white/80">{info.description}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                                            ⏱️ {result.inference_time_s}s
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-3 bg-white">
                                                    {result.error ? (
                                                        <div className="text-red-600 text-xs flex items-start gap-2">
                                                            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                                            <span>{result.error}</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-700 text-sm leading-relaxed">
                                                            {result.summary}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Original Text */}
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                    <h5 className="text-xs font-bold text-slate-600 mb-2">📄 Văn bản gốc:</h5>
                                    <p className="text-slate-700 text-xs leading-relaxed">
                                        {results.original_text}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                                <GitCompare className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-sm">Nhập văn bản và chọn models để bắt đầu</p>
                                <p className="text-xs mt-2">Kết quả sẽ hiển thị tại đây</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CompareModels;
