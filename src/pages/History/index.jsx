import { useState, useEffect, useCallback } from 'react';
import {
    History as HistoryIcon,
    ThumbsUp,
    ThumbsDown,
    Download,
    Eye,
    Filter,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit3,
    Save,
    AlertCircle,
    Trash2,
    Star
} from 'lucide-react';
import { Button, HumanEvalModal } from '@/components/common';
import { historyService } from '@/services';

/**
 * History Page - Trang lịch sử tóm tắt với feedback system
 */
const History = () => {
    // State
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        model: '',
        rating: '',
        has_feedback: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Detail modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({
        rating: '',
        comment: '',
        corrected_summary: ''
    });
    const [savingFeedback, setSavingFeedback] = useState(false);

    // Export state
    const [exporting, setExporting] = useState(false);
    const [exportingHumanEval, setExportingHumanEval] = useState(false);

    // Delete state
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleting, setDeleting] = useState(false);

    // Human Evaluation Modal
    const [showHumanEvalModal, setShowHumanEvalModal] = useState(false);
    const [humanEvalItem, setHumanEvalItem] = useState(null);

    // Fetch history list
    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: pagination.page,
                page_size: pagination.pageSize
            };
            if (filters.model) params.model = filters.model;
            if (filters.rating) params.rating = filters.rating;
            if (filters.has_feedback !== '') params.has_feedback = filters.has_feedback === 'true';

            const response = await historyService.getList(params);
            setItems(response.items || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0,
                totalPages: response.total_pages || 0
            }));
        } catch (err) {
            console.error('Fetch history error:', err);
            setError(err.response?.data?.detail || 'Không thể tải lịch sử');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.pageSize, filters]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    // Open detail modal
    const openDetail = (item) => {
        setSelectedItem(item);
        setFeedbackForm({
            rating: item.feedback?.rating || '',
            comment: item.feedback?.comment || '',
            corrected_summary: item.feedback?.corrected_summary || ''
        });
        setShowModal(true);
    };

    // Save feedback
    const saveFeedback = async () => {
        if (!selectedItem || !feedbackForm.rating) return;

        setSavingFeedback(true);
        try {
            await historyService.addFeedback(selectedItem.id, {
                rating: feedbackForm.rating,
                comment: feedbackForm.comment || null,
                corrected_summary: feedbackForm.corrected_summary || null
            });

            // Refresh list
            fetchHistory();
            setShowModal(false);
        } catch (err) {
            console.error('Save feedback error:', err);
            alert('Lỗi lưu feedback: ' + (err.response?.data?.detail || err.message));
        } finally {
            setSavingFeedback(false);
        }
    };

    // Quick feedback (thumbs up/down from table) - Only works if no human_eval
    const quickFeedback = async (item, rating) => {
        // Block if human_eval already exists
        if (item.feedback?.human_eval) {
            return;
        }
        try {
            await historyService.addFeedback(item.id, { rating });
            fetchHistory();
        } catch (err) {
            console.error('Quick feedback error:', err);
        }
    };

    // Open Human Eval Modal
    const openHumanEval = (item) => {
        setHumanEvalItem(item);
        setShowHumanEvalModal(true);
    };

    // Submit Human Evaluation
    const handleHumanEvalSubmit = async (feedbackData) => {
        if (!humanEvalItem) return;

        try {
            await historyService.addFeedback(humanEvalItem.id, feedbackData);
            fetchHistory();
            setShowHumanEvalModal(false);
            setHumanEvalItem(null);
        } catch (err) {
            console.error('Save human eval error:', err);
            alert('Lỗi lưu đánh giá: ' + (err.response?.data?.detail || err.message));
        }
    };

    // Export bad summaries as CSV (respects current filter)
    const exportBadSummaries = async () => {
        setExporting(true);
        try {
            // Pass current model filter to export API
            const params = { limit: 500 };
            if (filters.model) params.model = filters.model;

            const response = await historyService.exportBadSummaries(params);

            if (response.items.length === 0) {
                alert('Chưa có bản tóm tắt nào được đánh giá "Bad" (👎). Hãy đánh giá một số bản tóm tắt trước khi export.');
                setExporting(false);
                return;
            }

            // Convert to CSV
            const headers = ['input_text', 'generated_summary', 'corrected_summary', 'model_used', 'rating', 'comment'];
            const csvRows = [headers.join(',')];

            response.items.forEach(item => {
                const row = [
                    `"${(item.input_text || '').replace(/"/g, '""')}"`,
                    `"${(item.generated_summary || '').replace(/"/g, '""')}"`,
                    `"${(item.corrected_summary || '').replace(/"/g, '""')}"`,
                    `"${item.model_used || ''}"`,
                    `"${item.rating || ''}"`,
                    `"${(item.comment || '').replace(/"/g, '""')}"`
                ];
                csvRows.push(row.join(','));
            });

            // Add BOM for Excel UTF-8 compatibility
            const BOM = '\uFEFF';
            const csvContent = BOM + csvRows.join('\n');

            // Download as CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bad_summaries_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
            alert('Lỗi export: ' + (err.response?.data?.detail || err.message));
        } finally {
            setExporting(false);
        }
    };

    // Export Human Evaluation data as CSV
    const exportHumanEval = async () => {
        setExportingHumanEval(true);
        try {
            const params = { limit: 500 };
            if (filters.model) params.model = filters.model;

            const response = await historyService.exportHumanEval(params);

            if (response.items.length === 0) {
                alert('Chưa có bản tóm tắt nào có Human Evaluation. Hãy đánh giá một số bản tóm tắt bằng ⭐ trước khi export.');
                setExportingHumanEval(false);
                return;
            }

            // Convert to CSV
            const headers = ['Summary', 'Model', 'Date', 'Fluency', 'Coherence', 'Relevance', 'Consistency', 'Average Score', 'Overall Rating', 'Comment'];
            const csvRows = [headers.join(',')];

            response.items.forEach(item => {
                const row = [
                    `"${(item.summary || '').replace(/"/g, '""')}"`,
                    `"${item.model_used || ''}"`,
                    `"${item.created_at || ''}"`,
                    item.fluency || '',
                    item.coherence || '',
                    item.relevance || '',
                    item.consistency || '',
                    item.average_score || '',
                    `"${item.overall_rating || ''}"`,
                    `"${(item.comment || '').replace(/"/g, '""')}"`
                ];
                csvRows.push(row.join(','));
            });

            // Add BOM for Excel UTF-8 compatibility
            const BOM = '\uFEFF';
            const csvContent = BOM + csvRows.join('\n');

            // Download as CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `human_eval_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export human eval error:', err);
            alert('Lỗi export: ' + (err.response?.data?.detail || err.message));
        } finally {
            setExportingHumanEval(false);
        }
    };

    // Toggle select item
    const toggleSelectItem = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(item => item.id));
        }
    };

    // Delete selected items
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;

        if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} mục đã chọn?`)) return;

        setDeleting(true);
        try {
            const response = await historyService.bulkDelete(selectedIds);
            alert(`Đã xóa ${response.deleted_count} mục`);
            setSelectedIds([]);
            fetchHistory();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Lỗi xóa: ' + (err.response?.data?.detail || err.message));
        } finally {
            setDeleting(false);
        }
    };

    // Delete all
    const handleDeleteAll = async () => {
        if (!confirm('⚠️ Bạn có chắc muốn XÓA TẤT CẢ lịch sử? Hành động này không thể hoàn tác!')) return;

        setDeleting(true);
        try {
            const response = await historyService.deleteAll();
            alert(`Đã xóa tất cả ${response.deleted_count} mục`);
            setSelectedIds([]);
            fetchHistory();
        } catch (err) {
            console.error('Delete all error:', err);
            alert('Lỗi xóa: ' + (err.response?.data?.detail || err.message));
        } finally {
            setDeleting(false);
        }
    };

    // Delete single item
    const handleDeleteOne = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa mục này?')) return;

        try {
            await historyService.delete(id);
            fetchHistory();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Lỗi xóa: ' + (err.response?.data?.detail || err.message));
        }
    };

    // Format date
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Truncate text
    const truncate = (text, len = 100) => text?.length > len ? text.slice(0, len) + '...' : text;

    // Model badge colors
    const modelColors = {
        vit5: 'bg-blue-100 text-blue-700',
        phobert_vit5: 'bg-purple-100 text-purple-700',
        qwen: 'bg-orange-100 text-orange-700'
    };

    // Rating badge colors
    const ratingColors = {
        good: 'bg-emerald-100 text-emerald-700',
        bad: 'bg-red-100 text-red-700',
        neutral: 'bg-slate-100 text-slate-600'
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <HistoryIcon className="w-8 h-8 text-blue-600" />
                        Lịch sử Tóm tắt
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Xem lại và đánh giá các bản tóm tắt để cải thiện mô hình
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Button
                        size="sm"
                        className="bg-slate-400 hover:bg-slate-500 text-white gap-2"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                    <Button
                        size="sm"
                        className="bg-red-400 hover:bg-red-500 text-white gap-2"
                        onClick={exportBadSummaries}
                        disabled={exporting}
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export Bad
                    </Button>
                    <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                        onClick={exportHumanEval}
                        disabled={exportingHumanEval}
                    >
                        {exportingHumanEval ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                        Export Human Eval
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button
                            size="sm"
                            className="bg-orange-400 hover:bg-orange-500 text-white gap-2"
                            onClick={handleDeleteSelected}
                            disabled={deleting}
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Xóa ({selectedIds.length})
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="bg-red-400 hover:bg-red-500 text-white gap-2"
                        onClick={handleDeleteAll}
                        disabled={deleting || items.length === 0}
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa tất cả
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
                    <select
                        value={filters.model}
                        onChange={(e) => setFilters(f => ({ ...f, model: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Tất cả Model</option>
                        <option value="vit5">ViT5</option>
                        <option value="phobert_vit5">PhoBERT + ViT5</option>
                        <option value="qwen">Qwen</option>
                    </select>
                    <select
                        value={filters.rating}
                        onChange={(e) => setFilters(f => ({ ...f, rating: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Tất cả Rating</option>
                        <option value="good">👍 Good</option>
                        <option value="bad">👎 Bad</option>
                        <option value="neutral">😐 Neutral</option>
                    </select>
                    <select
                        value={filters.has_feedback}
                        onChange={(e) => setFilters(f => ({ ...f, has_feedback: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Đã đánh giá</option>
                        <option value="false">Chưa đánh giá</option>
                    </select>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setPagination(p => ({ ...p, page: 1 }))}
                    >
                        Áp dụng
                    </Button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === items.length && items.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Văn bản gốc</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tóm tắt</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Model</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Thời gian</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Đánh giá</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                                        <p className="text-slate-500 mt-2">Đang tải...</p>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        Chưa có lịch sử tóm tắt nào
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50' : ''}`}>
                                        <td className="py-3 px-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => toggleSelectItem(item.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600 max-w-[200px]">
                                            {truncate(item.input_text, 80)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-700 max-w-[250px]">
                                            {truncate(item.summary, 100)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${modelColors[item.model_used] || 'bg-slate-100'}`}>
                                                {item.model_used}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-500">
                                            {formatDate(item.created_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {item.feedback ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${item.feedback.human_eval
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : item.feedback.rating === 'good'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : item.feedback.rating === 'bad'
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : 'bg-slate-50 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {item.feedback.human_eval
                                                        ? <Star className="w-3 h-3" />
                                                        : item.feedback.rating === 'good'
                                                            ? <ThumbsUp className="w-3 h-3" />
                                                            : item.feedback.rating === 'bad'
                                                                ? <ThumbsDown className="w-3 h-3" />
                                                                : null
                                                    }
                                                    {item.feedback.rating}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Quick feedback buttons - disabled if human_eval exists */}
                                                <button
                                                    onClick={() => quickFeedback(item, 'good')}
                                                    disabled={!!item.feedback?.human_eval}
                                                    className={`p-1.5 rounded transition-colors ${item.feedback?.human_eval
                                                        ? 'opacity-30 cursor-not-allowed text-slate-300'
                                                        : item.feedback?.rating === 'good'
                                                            ? 'bg-emerald-100 text-emerald-600'
                                                            : 'text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'
                                                        }`}
                                                    title={item.feedback?.human_eval ? 'Đã có Human Eval - sửa qua ⭐' : 'Tốt'}
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => quickFeedback(item, 'bad')}
                                                    disabled={!!item.feedback?.human_eval}
                                                    className={`p-1.5 rounded transition-colors ${item.feedback?.human_eval
                                                        ? 'opacity-30 cursor-not-allowed text-slate-300'
                                                        : item.feedback?.rating === 'bad'
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'text-slate-400 hover:bg-red-100 hover:text-red-600'
                                                        }`}
                                                    title={item.feedback?.human_eval ? 'Đã có Human Eval - sửa qua ⭐' : 'Tệ'}
                                                >
                                                    <ThumbsDown className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openHumanEval(item)}
                                                    className={`p-1.5 rounded hover:bg-amber-100 ${item.feedback?.human_eval ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:text-amber-600'}`}
                                                    title="Human Evaluation"
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDetail(item)}
                                                    className="p-1.5 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600"
                                                    title="Chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOne(item.id)}
                                                    className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-600"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white gap-4">
                    {/* Left: Page size selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">Hiển thị</span>
                        <select
                            value={pagination.pageSize}
                            onChange={(e) => setPagination(p => ({ ...p, pageSize: Number(e.target.value), page: 1 }))}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                        <span className="text-sm text-slate-500">/ trang</span>
                    </div>

                    {/* Center: Info */}
                    <div className="text-sm text-slate-600 font-medium">
                        {pagination.total > 0 ? (
                            <>
                                Hiển thị <span className="text-blue-600">{(pagination.page - 1) * pagination.pageSize + 1}</span>
                                {' - '}
                                <span className="text-blue-600">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span>
                                {' trên '}
                                <span className="font-bold text-slate-800">{pagination.total}</span> kết quả
                            </>
                        ) : (
                            'Không có kết quả'
                        )}
                    </div>

                    {/* Right: Page navigation */}
                    <div className="flex items-center gap-1">
                        {/* First page */}
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={pagination.page <= 1}
                            className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 hover:text-blue-600 transition-colors"
                            title="Trang đầu"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>

                        {/* Previous */}
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 hover:text-blue-600 transition-colors"
                            title="Trang trước"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1 mx-2">
                            {pagination.totalPages <= 5 ? (
                                // Show all pages if 5 or less
                                [...Array(pagination.totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${pagination.page === i + 1
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))
                            ) : (
                                // Show limited pages with ellipsis
                                <>
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${pagination.page === 1
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50'
                                            }`}
                                    >
                                        1
                                    </button>

                                    {pagination.page > 3 && <span className="px-2 text-slate-400">...</span>}

                                    {[pagination.page - 1, pagination.page, pagination.page + 1]
                                        .filter(p => p > 1 && p < pagination.totalPages)
                                        .map(p => (
                                            <button
                                                key={p}
                                                onClick={() => handlePageChange(p)}
                                                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${pagination.page === p
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))
                                    }

                                    {pagination.page < pagination.totalPages - 2 && <span className="px-2 text-slate-400">...</span>}

                                    <button
                                        onClick={() => handlePageChange(pagination.totalPages)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${pagination.page === pagination.totalPages
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50'
                                            }`}
                                    >
                                        {pagination.totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Next */}
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 hover:text-blue-600 transition-colors"
                            title="Trang sau"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => handlePageChange(pagination.totalPages)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 hover:text-blue-600 transition-colors"
                            title="Trang cuối"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Chi tiết & Feedback</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Original text */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 mb-2">Văn bản gốc</h3>
                                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 max-h-40 overflow-y-auto">
                                    {selectedItem.input_text}
                                </div>
                            </div>

                            {/* Generated summary */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 mb-2">Tóm tắt (AI tạo)</h3>
                                <div className="bg-blue-50 p-4 rounded-lg text-sm text-slate-700">
                                    {selectedItem.summary}
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-slate-50 p-3 rounded-lg text-center">
                                    <div className="text-lg font-bold text-slate-700">{selectedItem.metrics?.input_words || 0}</div>
                                    <div className="text-xs text-slate-500">Từ gốc</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg text-center">
                                    <div className="text-lg font-bold text-blue-600">{selectedItem.metrics?.output_words || 0}</div>
                                    <div className="text-xs text-slate-500">Từ tóm tắt</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg text-center">
                                    <div className="text-lg font-bold text-emerald-600">{selectedItem.metrics?.compression_ratio?.toFixed(1) || 0}%</div>
                                    <div className="text-xs text-slate-500">Tỷ lệ nén</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg text-center">
                                    <div className="text-lg font-bold text-purple-600">{selectedItem.metrics?.processing_time_ms || 0}ms</div>
                                    <div className="text-xs text-slate-500">Thời gian</div>
                                </div>
                            </div>

                            {/* Human Evaluation Scores */}
                            {selectedItem.feedback?.human_eval && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                                    <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                                        <Star className="w-4 h-4" />
                                        Human Evaluation Scores
                                    </h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {selectedItem.feedback.human_eval.fluency && (
                                            <div className="bg-white p-3 rounded-lg text-center">
                                                <div className="text-xl font-bold text-amber-600">{selectedItem.feedback.human_eval.fluency}/5</div>
                                                <div className="text-xs text-slate-600">Fluency</div>
                                            </div>
                                        )}
                                        {selectedItem.feedback.human_eval.coherence && (
                                            <div className="bg-white p-3 rounded-lg text-center">
                                                <div className="text-xl font-bold text-amber-600">{selectedItem.feedback.human_eval.coherence}/5</div>
                                                <div className="text-xs text-slate-600">Coherence</div>
                                            </div>
                                        )}
                                        {selectedItem.feedback.human_eval.relevance && (
                                            <div className="bg-white p-3 rounded-lg text-center">
                                                <div className="text-xl font-bold text-amber-600">{selectedItem.feedback.human_eval.relevance}/5</div>
                                                <div className="text-xs text-slate-600">Relevance</div>
                                            </div>
                                        )}
                                        {selectedItem.feedback.human_eval.consistency && (
                                            <div className="bg-white p-3 rounded-lg text-center">
                                                <div className="text-xl font-bold text-amber-600">{selectedItem.feedback.human_eval.consistency}/5</div>
                                                <div className="text-xs text-slate-600">Consistency</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Feedback form */}
                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" />
                                    Đánh giá của bạn
                                </h3>

                                {/* Rating buttons */}
                                <div className="flex gap-3 mb-4">
                                    {['good', 'neutral', 'bad'].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setFeedbackForm(f => ({ ...f, rating: r }))}
                                            className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${feedbackForm.rating === r
                                                ? r === 'good' ? 'bg-emerald-500 text-white'
                                                    : r === 'bad' ? 'bg-red-500 text-white'
                                                        : 'bg-slate-500 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {r === 'good' ? <><ThumbsUp className="w-4 h-4" /> Tốt</> : r === 'bad' ? <><ThumbsDown className="w-4 h-4" /> Tệ</> : 'Trung bình'}
                                        </button>
                                    ))}
                                </div>

                                {/* Comment */}
                                <textarea
                                    value={feedbackForm.comment}
                                    onChange={(e) => setFeedbackForm(f => ({ ...f, comment: e.target.value }))}
                                    placeholder="Ghi chú (tùy chọn)..."
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                {/* Corrected summary (for bad ratings) */}
                                {feedbackForm.rating === 'bad' && (
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-slate-600 block mb-2">
                                            Bản tóm tắt đã sửa (dùng cho training):
                                        </label>
                                        <textarea
                                            value={feedbackForm.corrected_summary}
                                            onChange={(e) => setFeedbackForm(f => ({ ...f, corrected_summary: e.target.value }))}
                                            placeholder="Nhập bản tóm tắt đúng để cải thiện model..."
                                            className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                            <Button
                                size="sm"
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                                onClick={() => setShowModal(false)}
                            >
                                Đóng
                            </Button>
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                onClick={saveFeedback}
                                disabled={!feedbackForm.rating || savingFeedback}
                            >
                                {savingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Lưu đánh giá
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Human Evaluation Modal */}
            <HumanEvalModal
                isOpen={showHumanEvalModal}
                onClose={() => {
                    setShowHumanEvalModal(false);
                    setHumanEvalItem(null);
                }}
                onSubmit={handleHumanEvalSubmit}
                historyItem={humanEvalItem}
            />
        </div>
    );
};

export default History;
