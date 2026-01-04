import { UploadCloud, FileText, Database } from 'lucide-react';
import { Button } from '@/components/common';

const BatchEval = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dataset Evaluation</h1>
                    <p className="text-slate-500 mt-1">Run models on large datasets (CSV/Excel) to benchmark performance.</p>
                </div>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer group">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Drag & Drop your dataset file here</h3>
                <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> .csv, .xlsx
                    </span>
                    <span>•</span>
                    <span>Max 10MB</span>
                </div>
            </div>

            {/* Mock Table with Better Empty State */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <Database className="w-4 h-4" /> Recent Runs
                    </h3>
                    <span className="text-xs text-slate-500">0 evaluations</span>
                </div>
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Database className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">No evaluations yet</h4>
                    <p className="text-sm text-slate-400 mb-4">Upload a dataset file to start batch evaluation</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <div className="w-12 h-1 bg-slate-200 rounded"></div>
                        <span>or</span>
                        <div className="w-12 h-1 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Dataset Format Requirements</h4>
                <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                    <li>Column 1: <code className="bg-blue-100 px-1 rounded">original_text</code> - Input document</li>
                    <li>Column 2: <code className="bg-blue-100 px-1 rounded">reference_summary</code> - Ground truth summary (optional)</li>
                    <li>Encoding: UTF-8</li>
                </ul>
            </div>
        </div>
    );
};

export default BatchEval;
