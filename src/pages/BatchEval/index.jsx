import { useState, useRef } from 'react';
import { UploadCloud, FileText, Database, Settings2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
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

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            // Call API
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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dataset Evaluation</h1>
                    <p className="text-slate-500 mt-1">Run models on large datasets (CSV/Excel) to benchmark performance.</p>
                </div>
            </div>

            {/* Config & Upload Zone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Configuration */}
                <div className="md:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <Settings2 className="w-4 h-4" /> Configuration
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                disabled={isLoading}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                            >
                                <option value="phobert_vit5">PhoBERT + ViT5 Hybrid</option>
                                <option value="vit5">ViT5 Fine-tuned</option>
                                <option value="qwen">Qwen 2.5-7B</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="md:col-span-2">
                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer group h-full flex flex-col items-center justify-center"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                            />
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">Click to upload dataset</h3>
                            <p className="text-slate-500 text-sm mb-4">CSV or Excel files (.csv, .xlsx)</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Max 10MB
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl p-6 h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-1">{file.name}</h3>
                            <p className="text-sm text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            {error && (
                                <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-200">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    loading={isLoading}
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLoading ? 'Processing...' : 'Run Evaluation'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Area */}
            {result && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" /> Evaluation Results
                        </h3>
                        <span className="text-xs text-slate-500">
                            Processed {result.total_items} items in {result.processing_time_seconds}s
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                                <div className="text-lg font-bold text-blue-700">{result.total_items}</div>
                                <div className="text-xs text-blue-600 uppercase mt-1">Total Items</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                                <div className="text-lg font-bold text-green-700">{result.successful_items}</div>
                                <div className="text-xs text-green-600 uppercase mt-1">Successful</div>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                                <div className="text-lg font-bold text-red-700">{result.failed_items}</div>
                                <div className="text-xs text-red-600 uppercase mt-1">Failed</div>
                            </div>
                        </div>

                        {/* Download button or details could go here */}
                        <div className="text-center">
                            <p className="text-slate-600 mb-4">Batch processing completed successfully.</p>
                            {/* Feature idea: Download result CSV */}
                            <Button disabled className="opacity-50 cursor-not-allowed">
                                Download Report (Coming Soon)
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Helper Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Dataset Format Requirements</h4>
                <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                    <li>Format: <strong>CSV</strong> or <strong>Excel</strong></li>
                    <li>Column 1: <code className="bg-blue-100 px-1 rounded">text</code> (or similar) - Input document</li>
                    <li>Column 2: <code className="bg-blue-100 px-1 rounded">reference</code> (optional) - Ground truth summary</li>
                    <li>Encoding: UTF-8</li>
                </ul>
            </div>
        </div>
    );
};

export default BatchEval;
