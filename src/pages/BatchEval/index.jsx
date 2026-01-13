
import { useState, useRef } from 'react';
import { UploadCloud, FileText, Database, Settings2, Loader2, AlertCircle, CheckCircle, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/common';
import { summarizeService } from '@/services';

const BatchEval = () => {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [model, setModel] = useState('vit5');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

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
        const csvContent = "\uFEFFtext,reference\n\"Trí tuệ nhân tạo đang thay đổi thế giới...\",\"AI đang đổi mới...\"\n\"Deep learning là một phần của AI...\",\"Deep learning là tập con của AI...\"";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sample_dataset.csv');
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
            const response = await summarizeService.batchUpload(file, model);
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
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dataset Evaluation</h1>
                    <p className="text-slate-500 mt-2 text-lg">Run batch summarization on large datasets to benchmark performance.</p>
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
                {/* Left Column: Configuration & Help */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Config Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-6 text-lg">
                            <Settings2 className="w-5 h-5 text-slate-500" /> Configuration
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Model</label>
                                <div className="relative">
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        disabled={isLoading}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 p-3 pr-8"
                                    >
                                        <option value="phobert_vit5">PhoBERT + ViT5 Hybrid (Best)</option>
                                        <option value="vit5">ViT5 Fine-tuned (Fast)</option>
                                        <option value="qwen">Qwen 2.5-7B (LLM)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Choose the underlying model for summarization tasks.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Guidelines Card */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" /> Data Format
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                                <span>File extension: <strong>.csv</strong> or <strong>.xlsx</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                                <div>Column 1 header: <code className="bg-white border border-blue-200 px-1 py-0.5 rounded text-xs font-mono">text</code> <span className="text-xs opacity-75">(required)</span></div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                                <div>Column 2 header: <code className="bg-white border border-blue-200 px-1 py-0.5 rounded text-xs font-mono">reference</code> <span className="text-xs opacity-75">(optional)</span></div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: Upload & Results */}
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
                                    <UploadCloud className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">Drag & Drop or Click to Upload</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Upload your dataset to start the automatic evaluation process.</p>
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
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
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
                                    className="min-w-[120px] h-11 border-slate-300 hover:bg-slate-50"
                                >
                                    Choose Different
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    loading={isLoading}
                                    disabled={isLoading}
                                    className="min-w-[160px] h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20 border-0"
                                >
                                    {isLoading ? 'Processing...' : 'Run Evaluation'}
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
                                    <CheckCircle className="w-5 h-5 text-green-500" /> Evaluation Complete
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">Successfully processed your dataset.</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                <Loader2 className="w-4 h-4" />
                                Time taken: <span className="font-mono font-bold text-slate-900">{result.processing_time_seconds}s</span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center hover:shadow-md transition-shadow">
                                    <div className="text-4xl font-black text-blue-600 mb-2">{result.total_items}</div>
                                    <div className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Total Items</div>
                                </div>
                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center hover:shadow-md transition-shadow">
                                    <div className="text-4xl font-black text-emerald-600 mb-2">{result.successful_items}</div>
                                    <div className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Successful</div>
                                </div>
                                <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center hover:shadow-md transition-shadow">
                                    <div className="text-4xl font-black text-red-600 mb-2">{result.failed_items}</div>
                                    <div className="text-sm font-semibold text-red-800 uppercase tracking-wide">Failed</div>
                                </div>
                            </div>

                            <div className="mt-8 text-center bg-slate-50 rounded-xl p-8 border border-dashed border-slate-200">
                                <p className="text-slate-600 mb-4 font-medium">Detailed report analysis is ready.</p>
                                <Button disabled className="bg-slate-200 text-slate-400 cursor-not-allowed">
                                    Download Full Report (Coming Soon)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchEval;
