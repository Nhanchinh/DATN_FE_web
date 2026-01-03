import { UploadCloud, FileText, X, Play } from 'lucide-react';
import { Button } from '@/components/common';

const BatchEval = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dataset Evaluation</h1>
                    <p className="text-slate-500 mt-1">Run models on large datasets (CSV/Excel) to benchmark performance.</p>
                </div>
                <Button className="bg-blue-600 text-white gap-2">
                    <UploadCloud className="w-4 h-4" /> Import Dataset
                </Button>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Drag & Drop your dataset file here</h3>
                <p className="text-slate-500 mt-2 text-sm">Supports .csv, .xlsx (Max 10MB)</p>
            </div>

            {/* Mock Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Recent Runs
                    </h3>
                    <span className="text-xs text-slate-500">No recent evaluations found</span>
                </div>
                <div className="p-8 text-center text-slate-400">
                    Upload a file to start evaluation
                </div>
            </div>
        </div>
    );
};

export default BatchEval;
