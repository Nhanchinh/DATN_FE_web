import React, { useState, useRef } from 'react';
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Loader2,
    Download,
    FileSpreadsheet,
    Settings2,
    FileDown,
    ChevronDown,
    Clock,
    XCircle,
    Eye,
    EyeOff,
    Square,
    Play,
    BarChart3
} from 'lucide-react';
import { Button } from '@/components/common';

const MODEL_OPTIONS = [
    { value: 'phobert_vit5', label: 'PhoBERT + ViT5', tag: 'Best', color: 'bg-purple-100 text-purple-700' },
    { value: 'vit5', label: 'ViT5', tag: 'Fast', color: 'bg-blue-100 text-blue-700' },
    { value: 'vit5_fin', label: 'ViT5 Financial v2', tag: 'Finance', color: 'bg-teal-100 text-teal-700' },
    { value: 'qwen', label: 'Qwen 2.5-7B', tag: 'LLM', color: 'bg-orange-100 text-orange-700' },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BatchSummarize = () => {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // Config
    const [model, setModel] = useState('vit5');
    const [maxLength, setMaxLength] = useState(256);

    // Progress & Results
    const [progress, setProgress] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [total, setTotal] = useState(0);
    const [results, setResults] = useState([]);
    const [stats, setStats] = useState(null);

    // UI
    const [showAllResults, setShowAllResults] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    // Abort
    const abortControllerRef = useRef(null);

    // ============ Download Template ============
    const handleDownloadTemplate = () => {
        const csvContent = "\uFEFFcontent\n\"Nhập văn bản cần tóm tắt ở đây...\"\n\"Văn bản thứ hai cần tóm tắt...\"\n\"Mỗi dòng trong cột content sẽ được tóm tắt tự động bằng model bạn chọn.\"";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'batch_summarize_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ============ File Selection ============
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/)) {
                setError('Vui lòng chọn file CSV hoặc Excel (.xlsx, .xls)');
                setFile(null);
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File quá lớn. Vui lòng chọn file < 10MB');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError('');
            setResults([]);
            setStats(null);
            setProgress(0);
            setCompleted(0);
            setTotal(0);
        }
    };

    // ============ Reset ============
    const handleReset = () => {
        setFile(null);
        setResults([]);
        setStats(null);
        setError('');
        setProgress(0);
        setCompleted(0);
        setTotal(0);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============ Start Batch ============
    const handleStart = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError('');
        setResults([]);
        setStats(null);
        setProgress(0);
        setCompleted(0);
        setTotal(0);

        abortControllerRef.current = new AbortController();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', model);
        formData.append('max_length', maxLength.toString());
        formData.append('text_column', 'content');

        try {
            const token = localStorage.getItem('access_token');
            const resp = await fetch(`${API_BASE}/batch-summarize/start`, {
                method: 'POST',
                body: formData,
                signal: abortControllerRef.current.signal,
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!resp.ok) {
                const errData = await resp.json();
                throw new Error(errData.detail || 'Lỗi bắt đầu batch');
            }

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event = JSON.parse(line.slice(6));

                            if (event.type === 'start') {
                                setTotal(event.total);
                            } else if (event.type === 'item') {
                                setResults(prev => [...prev, event]);
                                setProgress(event.progress);
                                setCompleted(event.completed);
                            } else if (event.type === 'done') {
                                setStats(event);
                            }
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                setError('Đã hủy quá trình tóm tắt');
            } else {
                console.error('Batch error:', err);
                setError(err.message || 'Lỗi xử lý batch');
            }
        } finally {
            setIsProcessing(false);
            abortControllerRef.current = null;
        }
    };

    // ============ Cancel ============
    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    // ============ Export CSV ============
    const handleExportCSV = () => {
        if (results.length === 0) return;

        const headers = ['content', 'summary', 'model', 'inference_time_s'];
        const rows = results.map((r, i) => [
            `"${(r.original_text || '').replace(/"/g, '""')}"`,
            `"${(r.summary || '').replace(/"/g, '""')}"`,
            model,
            r.inference_time_s || 0,
        ].join(','));

        const BOM = '\uFEFF';
        const csvContent = BOM + headers.join(',') + '\n' + rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `batch_summarize_${model}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const selectedModel = MODEL_OPTIONS.find(m => m.value === model);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const displayedResults = showAllResults ? results : results.slice(0, 10);

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Batch Tóm tắt</h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Upload file Excel/CSV chứa cột <strong>content</strong> → chọn model → tóm tắt tự động hàng loạt.
                        <br />
                        Cần kết nối <strong>Colab GPU Server</strong> để chạy.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2 bg-white border-slate-300 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm transition-all"
                    onClick={handleDownloadTemplate}
                >
                    <Download className="w-4 h-4" />
                    <span>Download Template</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Config & Guidelines */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Config Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-6 text-lg">
                            <Settings2 className="w-5 h-5 text-slate-500" /> Cấu hình
                        </h3>

                        <div className="space-y-5">
                            {/* Model Select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Model tóm tắt</label>
                                <div className="relative">
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                                    >
                                        {MODEL_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label} ({opt.tag})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {selectedModel && (
                                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-lg font-medium ${selectedModel.color}`}>
                                        {selectedModel.tag}
                                    </span>
                                )}
                            </div>

                            {/* Max Length */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Độ dài tối đa: <span className="text-blue-600 font-bold">{maxLength}</span>
                                </label>
                                <input
                                    type="range"
                                    min={50}
                                    max={512}
                                    step={10}
                                    value={maxLength}
                                    onChange={(e) => setMaxLength(Number(e.target.value))}
                                    disabled={isProcessing}
                                    className="w-full accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>50</span>
                                    <span>512</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Guidelines Card */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" /> Hướng dẫn
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                                <span>Nhấn <strong>Download Template</strong> để tải file mẫu</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                                <div>Điền văn bản cần tóm tắt vào cột <code className="bg-white border border-blue-200 px-1 py-0.5 rounded text-xs font-mono">content</code></div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                                <span>Upload file → Chọn model → Nhấn <strong>Chạy Tóm tắt</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                                <span>Export kết quả → dùng luôn cho <strong>Batch Eval</strong></span>
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-700">
                                <strong>⚠️ Lưu ý:</strong> Thời gian xử lý phụ thuộc số bài và model.
                                Model LLM (Qwen) sẽ chậm hơn các model ViT5.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Upload & File Info */}
                <div className="lg:col-span-8">
                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="h-full min-h-[400px] border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-400 transition-all cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                            />

                            <div className="relative z-10 text-center p-8">
                                <div className="w-20 h-20 bg-white text-blue-600 rounded-full shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:text-blue-700 transition-all duration-300">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">Drag & Drop or Click to Upload</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Upload file chứa cột <strong>content</strong> để tóm tắt hàng loạt.</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-xs font-medium text-slate-600">
                                    <FileText className="w-3 h-3" /> .csv, .xlsx, .xls • Max 10MB
                                </div>
                            </div>

                            {/* Decorative Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 h-full flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                            {/* Top accent bar */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                <FileSpreadsheet className="w-10 h-10" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">{file.name}</h3>
                            <p className="text-slate-500 mb-8 font-mono text-sm bg-slate-100 px-3 py-1 rounded-full">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>

                            {error && !isProcessing && !stats && (
                                <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-start gap-3 border border-red-100 max-w-md animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Progress bar while processing */}
                            {isProcessing && (
                                <div className="w-full max-w-md mb-6">
                                    <div className="flex items-center justify-between mb-2 text-sm">
                                        <span className="text-slate-600 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                            Đang tóm tắt...
                                        </span>
                                        <span className="text-blue-600 font-bold">{completed}/{total} ({progress}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 to-blue-400"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 text-center">
                                        ✅ {successCount} thành công • ❌ {failCount} lỗi
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={isProcessing}
                                    className="min-w-[120px] h-11 border-slate-300 hover:bg-slate-50 text-slate-700"
                                >
                                    Chọn lại
                                </Button>
                                {isProcessing ? (
                                    <Button
                                        onClick={handleCancel}
                                        className="min-w-[160px] h-11 bg-red-600 hover:bg-red-700 text-white border-0 gap-2"
                                    >
                                        <Square className="w-4 h-4" />
                                        Hủy xử lý
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleStart}
                                        disabled={!!stats}
                                        className="min-w-[160px] h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20 border-0 gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        {stats ? 'Đã hoàn tất' : 'Chạy Tóm tắt'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {(stats || results.length > 0) && (
                <div className="border-t border-slate-200 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    {stats ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    )}
                                    {stats ? 'Tóm tắt hoàn tất' : 'Đang xử lý...'}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Model: <strong>{selectedModel?.label}</strong>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {stats && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                        <Clock className="w-4 h-4" />
                                        Tổng: <span className="font-mono font-bold text-slate-900">{stats.total_time_s}s</span>
                                        <span className="text-slate-300 mx-1">|</span>
                                        TB: <span className="font-mono font-bold text-slate-900">{stats.avg_time_s}s/bài</span>
                                    </div>
                                )}
                                {results.length > 0 && (
                                    <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                        onClick={handleExportCSV}
                                    >
                                        <FileDown className="w-4 h-4" />
                                        Export CSV
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                                    <div className="text-2xl font-black text-slate-700 mb-1">{total || results.length}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng</div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                    <div className="text-2xl font-black text-emerald-600 mb-1">{successCount}</div>
                                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Thành công</div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                                    <div className="text-2xl font-black text-red-600 mb-1">{failCount}</div>
                                    <div className="text-xs font-bold text-red-800 uppercase tracking-wider">Lỗi</div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                                    <div className="text-2xl font-black text-blue-600 mb-1">{stats?.total_time_s || '...'}</div>
                                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Tổng (s)</div>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                                    <div className="text-2xl font-black text-amber-600 mb-1">{stats?.avg_time_s || '...'}</div>
                                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">TB/bài (s)</div>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="border rounded-xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                                        <tr>
                                            <th className="p-4 w-12">#</th>
                                            <th className="p-4">Văn bản gốc</th>
                                            <th className="p-4">Tóm tắt</th>
                                            <th className="p-4 w-20 text-center">Thời gian</th>
                                            <th className="p-4 w-24 text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {displayedResults.map((r, idx) => (
                                            <tr
                                                key={idx}
                                                className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedRow === idx ? 'bg-blue-50/50' : ''}`}
                                                onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                                            >
                                                <td className="p-4 font-mono text-slate-500">{r.index + 1}</td>
                                                <td className="p-4 max-w-[300px]">
                                                    <div className={expandedRow === idx ? 'whitespace-pre-wrap text-slate-600' : 'truncate text-slate-600'}>
                                                        {r.original_text}
                                                    </div>
                                                </td>
                                                <td className="p-4 max-w-[350px]">
                                                    {r.success ? (
                                                        <div className={expandedRow === idx ? 'whitespace-pre-wrap font-medium text-slate-800' : 'truncate font-medium text-slate-800'}>
                                                            {r.summary}
                                                        </div>
                                                    ) : (
                                                        <span className="text-red-500 text-xs">{r.error}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="text-xs text-slate-500 font-mono">{r.inference_time_s}s</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {r.success ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                            <CheckCircle className="w-3 h-3" /> OK
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                            <XCircle className="w-3 h-3" /> Lỗi
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {results.length > 10 && (
                                    <div className="p-3 text-center bg-slate-50 border-t">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowAllResults(!showAllResults); }}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
                                        >
                                            {showAllResults ? (
                                                <>
                                                    <EyeOff className="w-3.5 h-3.5" /> Thu gọn
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-3.5 h-3.5" /> Xem tất cả {results.length} dòng
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchSummarize;
