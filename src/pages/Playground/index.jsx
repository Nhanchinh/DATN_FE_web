import { useState } from 'react';
import {
    Play,
    Settings2,
    Maximize2,
    Copy,
    RotateCcw,
    Loader2,
    Eye,
    FileText
} from 'lucide-react';
import { Button } from '@/components/common';

const Playground = () => {
    const [model, setModel] = useState('vit5');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDiff, setShowDiff] = useState(false);
    const [metrics, setMetrics] = useState(null);

    const handleRun = async () => {
        setIsLoading(true);
        setOutput('');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setOutput('Đây là bản tóm tắt được tạo tự động bởi model ' + model.toUpperCase() + '. Nội dung này ngắn gọn hơn so với văn bản gốc và giữ lại các ý chính.');
        setMetrics({
            rouge1: 75.2,
            rougeL: 68.5,
            bleu: 52.3,
            time: '1.8s'
        });
        setIsLoading(false);
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-slate-500" />
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        >
                            <option value="vit5">ViT5 (Google)</option>
                            <option value="phobert">PhoBERT (VinAI)</option>
                            <option value="bart">BART-Large</option>
                            <option value="gemini">Gemini Pro</option>
                        </select>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button className="px-3 py-1.5 text-xs font-medium bg-white shadow-sm rounded-md text-slate-700">Summarize</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700">Evaluate</button>
                    </div>
                </div>

                <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    onClick={handleRun}
                    disabled={isLoading || !input.trim()}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isLoading ? 'Running...' : 'Run'}
                </Button>
            </div>

            {/* Main Content - Split View */}
            <div className="flex-1 grid grid-cols-2 gap-4 h-full overflow-hidden">

                {/* Input Panel */}
                <div className="flex flex-col bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden hover:border-slate-300 transition-colors">
                    <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-700">Input Text</h3>
                        <div className="flex gap-2">
                            <button
                                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                title="Clear"
                                onClick={() => setInput('')}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Expand">
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none focus:outline-none text-slate-700 font-mono text-sm leading-relaxed"
                        placeholder="Paste your text here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="p-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                        <span>{input.split(/\s+/).filter(w => w).length} words</span>
                        <span>UTF-8</span>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    <div className="flex-1 flex flex-col bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden hover:border-slate-300 transition-colors">
                        <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-700">Model Output</h3>
                                {output && (
                                    <button
                                        onClick={() => setShowDiff(!showDiff)}
                                        className="p-1 hover:bg-slate-200 rounded text-slate-500 text-xs flex items-center gap-1"
                                        title="Toggle diff view"
                                    >
                                        <Eye className="w-3 h-3" />
                                        {showDiff ? 'Plain' : 'Diff'}
                                    </button>
                                )}
                            </div>
                            <button
                                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                title="Copy"
                                onClick={() => navigator.clipboard.writeText(output)}
                                disabled={!output}
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    <p className="text-sm text-slate-500">Generating summary...</p>
                                    <div className="w-full max-w-xs space-y-2">
                                        <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                                        <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6"></div>
                                        <div className="h-3 bg-slate-200 rounded animate-pulse w-4/6"></div>
                                    </div>
                                </div>
                            ) : output ? (
                                <div className={showDiff ? 'font-mono text-sm' : 'text-slate-700 leading-relaxed'}>
                                    {output}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <FileText className="w-12 h-12 mb-2 opacity-50" />
                                    <p className="text-sm italic">Press "Run" to generate summary...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="bg-white rounded-xl border-2 border-slate-200 shadow-md p-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Real-time Metrics</h4>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'ROUGE-1', val: metrics?.rouge1 || '-', color: metrics?.rouge1 ? 'text-blue-600' : 'text-slate-400' },
                                { label: 'ROUGE-L', val: metrics?.rougeL || '-', color: metrics?.rougeL ? 'text-purple-600' : 'text-slate-400' },
                                { label: 'BLEU', val: metrics?.bleu || '-', color: metrics?.bleu ? 'text-emerald-600' : 'text-slate-400' },
                                { label: 'Time', val: metrics?.time || '-', color: metrics?.time ? 'text-slate-600' : 'text-slate-400' }
                            ].map((m, i) => (
                                <div key={i} className="text-center p-2 bg-slate-50 rounded-lg">
                                    <div className={`text-xl font-bold ${m.color}`}>{typeof m.val === 'number' ? m.val.toFixed(1) + '%' : m.val}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playground;
