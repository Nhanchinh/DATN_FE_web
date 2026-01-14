import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Download, Database, FileSpreadsheet, Settings2, FileDown } from 'lucide-react';
import { Button } from '@/components/common';
import evaluationService from '@/services/evaluationService';

const BatchEval = () => {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [calculateBert, setCalculateBert] = useState(false);

    // Export results to CSV
    const handleExportCSV = () => {
        if (!result || !result.results) return;

        // Build CSV headers
        const headers = ['#', 'Summary', 'Reference', 'ROUGE-1', 'ROUGE-2', 'ROUGE-L', 'BLEU'];
        if (calculateBert) headers.push('BERTScore');

        // Build CSV rows
        const rows = result.results.map((item, idx) => {
            const row = [
                idx + 1,
                `"${(item.summary || '').replace(/"/g, '""')}"`,
                `"${(item.reference_summary || '').replace(/"/g, '""')}"`,
                (item.rouge1 * 100).toFixed(2),
                (item.rouge2 * 100).toFixed(2),
                (item.rougeL * 100).toFixed(2),
                (item.bleu * 100).toFixed(2)
            ];
            if (calculateBert) row.push((item.bert_score * 100).toFixed(2));
            return row.join(',');
        });

        // Add average row
        const avgRouge1 = (result.results.reduce((acc, item) => acc + (item.rouge1 || 0), 0) / result.total_items * 100).toFixed(2);
        const avgRouge2 = (result.results.reduce((acc, item) => acc + (item.rouge2 || 0), 0) / result.total_items * 100).toFixed(2);
        const avgRougeL = (result.results.reduce((acc, item) => acc + (item.rougeL || 0), 0) / result.total_items * 100).toFixed(2);
        const avgBleu = (result.results.reduce((acc, item) => acc + (item.bleu || 0), 0) / result.total_items * 100).toFixed(2);
        
        const avgRow = ['AVG', '""', '""', avgRouge1, avgRouge2, avgRougeL, avgBleu];
        if (calculateBert) {
            const avgBert = (result.results.reduce((acc, item) => acc + (item.bert_score || 0), 0) / result.total_items * 100).toFixed(2);
            avgRow.push(avgBert);
        }
        rows.push(avgRow.join(','));

        // Create CSV content with BOM for Excel
        const BOM = '\uFEFF';
        const csvContent = BOM + headers.join(',') + '\n' + rows.join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `evaluation_results_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/)) {
                setError('Vui lòng chọn file CSV hoặc Excel (.xlsx, .xls)');
                setFile(null);
                return;
            }
            // Validate size (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File quá lớn. Vui lòng chọn file < 10MB');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError('');
            setResult(null);
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "\uFEFFsummary,reference\n\"Tóm tắt máy tạo...\",\"Tóm tắt mẫu...\"\n\"Nội dung tóm tắt 2...\",\"Nội dung mẫu 2...\"";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'score_eval_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            // Call Score-Only Evaluation Endpoint (Local, Fast)
            const response = await evaluationService.evaluateFileUpload(file, calculateBert);
            setResult(response);
        } catch (err) {
            console.error('Batch upload error:', err);
            setError(err.response?.data?.detail || 'Có lỗi xảy ra khi xử lý file');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10 px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Batch Evaluation (Score Only)</h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Upload file chứa cặp <strong>summary - reference</strong> để chấm điểm ROUGE/BLEU.
                        <br />
                        Chạy offline, không cần kết nối Colab GPU.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2 bg-white border-slate-300 text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm transition-all"
                    onClick={handleDownloadTemplate}
                >
                    <Download className="w-4 h-4" />
                    <span>Download Template</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Configuration & Help */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Config Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-6 text-lg">
                            <Settings2 className="w-5 h-5 text-slate-500" /> Cấu hình
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <input
                                    type="checkbox"
                                    id="bert-score"
                                    checked={calculateBert}
                                    onChange={(e) => setCalculateBert(e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <label htmlFor="bert-score" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                    Tính BERTScore
                                    <span className="block text-xs text-slate-500 font-normal mt-0.5">Sẽ chậm hơn đáng kể</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Guidelines Card */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
                        <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" /> Định dạng File
                        </h4>
                        <ul className="text-sm text-indigo-800 space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="bg-indigo-100 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                                <span>File extension: <strong>.csv</strong> or <strong>.xlsx</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-indigo-100 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                                <div>Cột tóm tắt máy: <code className="bg-white border border-indigo-200 px-1 py-0.5 rounded text-xs font-mono">summary</code></div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-indigo-100 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                                <div>Cột tóm tắt mẫu: <code className="bg-white border border-indigo-200 px-1 py-0.5 rounded text-xs font-mono">reference</code></div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: Upload & Results */}
                <div className="lg:col-span-8">
                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="h-full min-h-[400px] border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-400 transition-all cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                            />

                            <div className="relative z-10 text-center p-8">
                                <div className="w-20 h-20 bg-white text-indigo-600 rounded-full shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:text-indigo-700 transition-all duration-300">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-700 transition-colors">Drag & Drop or Click to Upload</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Upload dataset để chấm điểm tự động.</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-xs font-medium text-slate-600">
                                    <FileText className="w-3 h-3" /> Max file size: 10MB
                                </div>
                            </div>

                            {/* Decorative Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 h-full flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                            {/* Background Decoration */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">{file.name}</h3>
                            <p className="text-slate-500 mb-8 font-mono text-sm bg-slate-100 px-3 py-1 rounded-full">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>

                            {error && (
                                <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-start gap-3 border border-red-100 max-w-md animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    className="min-w-[120px] h-11 border-slate-300 hover:bg-slate-50 text-slate-700"
                                >
                                    Chọn lại
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={isLoading}
                                    className="min-w-[160px] h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 border-0"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Đang chấm điểm...
                                        </>
                                    ) : 'Chạy Đánh Giá'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {result && (
                <div className="border-t border-slate-200 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" /> Đánh giá hoàn tất
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">Kết quả trung bình trên toàn bộ dataset.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                    <Loader2 className="w-4 h-4" />
                                    Thời gian: <span className="font-mono font-bold text-slate-900">{result.total_time_s}s</span>
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                    onClick={handleExportCSV}
                                >
                                    <FileDown className="w-4 h-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                                    <div className="text-2xl font-black text-slate-700 mb-2">{result.total_items}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mẫu</div>
                                </div>
                                <div className="p-5 bg-red-50 rounded-2xl border border-red-100 text-center">
                                    <div className="text-2xl font-black text-red-600 mb-2">{(result.results.reduce((acc, item) => acc + (item.rouge1 || 0), 0) / result.total_items * 100).toFixed(2)}</div>
                                    <div className="text-xs font-bold text-red-800 uppercase tracking-wider">ROUGE-1</div>
                                </div>
                                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                                    <div className="text-2xl font-black text-blue-600 mb-2">{(result.results.reduce((acc, item) => acc + (item.rougeL || 0), 0) / result.total_items * 100).toFixed(2)}</div>
                                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">ROUGE-L</div>
                                </div>
                                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 text-center">
                                    <div className="text-2xl font-black text-purple-600 mb-2">{(result.results.reduce((acc, item) => acc + (item.bleu || 0), 0) / result.total_items * 100).toFixed(2)}</div>
                                    <div className="text-xs font-bold text-purple-800 uppercase tracking-wider">BLEU</div>
                                </div>
                                {/* BERTScore Card - chỉ hiển thị nếu có tính */}
                                {calculateBert && (
                                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                        <div className="text-2xl font-black text-emerald-600 mb-2">{(result.results.reduce((acc, item) => acc + (item.bert_score || 0), 0) / result.total_items * 100).toFixed(2)}</div>
                                        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">BERTScore</div>
                                    </div>
                                )}
                            </div>

                            {/* Detailed List Preview */}
                            <div className="mt-8 border rounded-xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                                        <tr>
                                            <th className="p-4 w-12">#</th>
                                            <th className="p-4">Summary</th>
                                            <th className="p-4 w-20">R-1</th>
                                            <th className="p-4 w-20">R-L</th>
                                            <th className="p-4 w-20">BLEU</th>
                                            {calculateBert && <th className="p-4 w-20">BERT</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {result.results.slice(0, 5).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="p-4 font-mono text-slate-500">{idx + 1}</td>
                                                <td className="p-4 max-w-md truncate" title={item.summary}>{item.summary}</td>
                                                <td className="p-4 font-bold text-red-600">{(item.rouge1 * 100).toFixed(1)}</td>
                                                <td className="p-4 font-bold text-blue-600">{(item.rougeL * 100).toFixed(1)}</td>
                                                <td className="p-4 font-bold text-purple-600">{(item.bleu * 100).toFixed(1)}</td>
                                                {calculateBert && <td className="p-4 font-bold text-emerald-600">{(item.bert_score * 100).toFixed(1)}</td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {result.results.length > 5 && (
                                    <div className="p-3 text-center bg-slate-50 text-slate-500 text-xs border-t">
                                        ... và {result.results.length - 5} dòng khác
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

export default BatchEval;
