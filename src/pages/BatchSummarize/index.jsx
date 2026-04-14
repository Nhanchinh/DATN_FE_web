import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
    { value: 'vit5_fin', label: 'ViT5 Financial v2', tagKey: 'modelTags.financial', color: 'bg-teal-100 text-teal-700' },
    { value: 'qwen', label: 'Qwen 2.5-7B', tagKey: 'modelTags.llm', color: 'bg-orange-100 text-orange-700' },
    { value: 'phobert_finance', label: 'PhoBERT Finance', tagKey: 'modelTags.extractive', color: 'bg-rose-100 text-rose-700' },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BatchSummarize = () => {
    const fileInputRef = useRef(null);
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // Config
    const [model, setModel] = useState('vit5_fin');
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
        const csvContent = "\uFEFFcontent,reference\n\"Nhập văn bản cần tóm tắt ở đây...\",\"Mô tả kỳ vọng/tóm tắt chuẩn để đánh giá\"\n\"Văn bản thứ hai cần tóm tắt...\",\"Reference cho dòng thứ hai\"\n\"Mỗi dòng trong cột content sẽ được tóm tắt tự động bằng model bạn chọn.\",\"Cột reference là tùy chọn nhưng nên có nếu dùng BatchEval\"";
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
                setError(t('common.invalidFileType'));
                setFile(null);
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError(t('common.fileTooLarge'));
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
                throw new Error(errData.detail || t('batchSum.startError'));
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
                setError(t('batchSum.cancelledMsg'));
            } else {
                console.error('Batch error:', err);
                setError(err.message || t('batchSum.batchError'));
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

        const headers = ['content', 'summary', 'reference', 'model', 'inference_time_s'];
        const rows = results.map((r, i) => [
            `"${(r.original_text || '').replace(/"/g, '""')}"`,
            `"${(r.summary || '').replace(/"/g, '""')}"`,
            `"${(r.reference || '').replace(/"/g, '""')}"`,
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('batchSum.title')}</h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        <span dangerouslySetInnerHTML={{ __html: t('batchSum.description') }} />
                        <br />
                        <span dangerouslySetInnerHTML={{ __html: t('batchSum.needColab') }} />
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2 bg-white border-slate-300 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm transition-all"
                    onClick={handleDownloadTemplate}
                >
                    <Download className="w-4 h-4" />
                    <span>{t('common.downloadTemplate')}</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Config & Guidelines */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Config Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-6 text-lg">
                            <Settings2 className="w-5 h-5 text-slate-500" /> {t('common.config')}
                        </h3>

                        <div className="space-y-5">
                            {/* Model Select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t('batchSum.modelLabel')}</label>
                                <div className="relative">
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                                    >
                                        {MODEL_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label} ({t(opt.tagKey)})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {selectedModel && (
                                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-lg font-medium ${selectedModel.color}`}>
                                        {t(selectedModel.tagKey)}
                                    </span>
                                )}
                            </div>

                            {/* Max Length */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {t('batchSum.maxLength')}: <span className="text-blue-600 font-bold">{maxLength}</span>
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
                            <FileSpreadsheet className="w-4 h-4" /> {t('common.guidelines')}
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                                <span dangerouslySetInnerHTML={{ __html: t('batchSum.guide1') }} />
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                                <span dangerouslySetInnerHTML={{ __html: t('batchSum.guide2') }} />
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                                <span dangerouslySetInnerHTML={{ __html: t('batchSum.guide3') }} />
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                                <span dangerouslySetInnerHTML={{ __html: t('batchSum.guide4') }} />
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-700" dangerouslySetInnerHTML={{ __html: t('batchSum.timeNote') }} />
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
                                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">{t('common.dragDropUpload')}</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto" dangerouslySetInnerHTML={{ __html: t('batchSum.uploadDesc') }} />
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-xs font-medium text-slate-600">
                                    <FileText className="w-3 h-3" /> {t('common.fileFormats')} • {t('common.maxSize')}
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
                                            {t('batchSum.summarizing')}
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
                                        ✅ {successCount} {t('common.success')} • ❌ {failCount} {t('common.failed')}
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
                                    {t('common.selectAgain')}
                                </Button>
                                {isProcessing ? (
                                    <Button
                                        onClick={handleCancel}
                                        className="min-w-[160px] h-11 bg-red-600 hover:bg-red-700 text-white border-0 gap-2"
                                    >
                                        <Square className="w-4 h-4" />
                                        {t('common.cancelProcess')}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleStart}
                                        disabled={!!stats}
                                        className="min-w-[160px] h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20 border-0 gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        {stats ? t('batchSum.completed') : t('batchSum.runSummarize')}
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
                                    {stats ? t('batchSum.sumComplete') : t('common.processing')}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Model: <strong>{selectedModel?.label}</strong>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {stats && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                        <Clock className="w-4 h-4" />
                                        {t('batchSum.totalTime')}: <span className="font-mono font-bold text-slate-900">{stats.total_time_s}s</span>
                                        <span className="text-slate-300 mx-1">|</span>
                                        {t('batchSum.avgPerItem')}: <span className="font-mono font-bold text-slate-900">{stats.avg_time_s}s</span>
                                    </div>
                                )}
                                {results.length > 0 && (
                                    <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                        onClick={handleExportCSV}
                                    >
                                    <FileDown className="w-4 h-4" />
                                    {t('common.exportCsv')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                                    <div className="text-2xl font-black text-slate-700 mb-1">{total || results.length}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('common.total')}</div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                    <div className="text-2xl font-black text-emerald-600 mb-1">{successCount}</div>
                                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{t('common.success')}</div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                                    <div className="text-2xl font-black text-red-600 mb-1">{failCount}</div>
                                    <div className="text-xs font-bold text-red-800 uppercase tracking-wider">{t('common.failed')}</div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                                    <div className="text-2xl font-black text-blue-600 mb-1">{stats?.total_time_s || '...'}</div>
                                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">{t('batchSum.totalTime')}</div>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                                    <div className="text-2xl font-black text-amber-600 mb-1">{stats?.avg_time_s || '...'}</div>
                                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">{t('batchSum.avgPerItem')}</div>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="border rounded-xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                                        <tr>
                                            <th className="p-4 w-12">#</th>
                                            <th className="p-4">{t('batchSum.originalCol')}</th>
                                            <th className="p-4">{t('batchSum.summaryCol')}</th>
                                            <th className="p-4 w-20 text-center">{t('batchSum.timeCol')}</th>
                                            <th className="p-4 w-24 text-center">{t('batchSum.statusCol')}</th>
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
                                                            <CheckCircle className="w-3 h-3" /> {t('common.done')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                            <XCircle className="w-3 h-3" /> {t('common.failed')}
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
                                                    <EyeOff className="w-3.5 h-3.5" /> {t('batchSum.collapse')}
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-3.5 h-3.5" /> {t('batchSum.viewAll', { count: results.length })}
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
