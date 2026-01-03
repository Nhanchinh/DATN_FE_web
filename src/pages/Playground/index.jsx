import { useState } from 'react';
import {
    Play,
    Settings2,
    Maximize2,
    Copy,
    RotateCcw,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/common';

const Playground = () => {
    const [model, setModel] = useState('vit5');
    const [input, setInput] = useState('');

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

                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Play className="w-4 h-4" /> Run
                </Button>
            </div>

            {/* Main Content - Split View */}
            <div className="flex-1 grid grid-cols-2 gap-4 h-full overflow-hidden">

                {/* Input Panel */}
                <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-700">Input Text</h3>
                        <div className="flex gap-2">
                            <button className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Clear">
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
                    <div className="p-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                        <span>{input.split(/\s+/).filter(w => w).length} words</span>
                        <span>UTF-8</span>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-slate-700">Model Output</h3>
                            <button className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Copy">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 p-4 bg-slate-50 text-slate-500 italic text-sm flex items-center justify-center">
                            Press "Run" to generate summary...
                        </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Real-time Metrics</h4>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'ROUGE-1', val: '-', color: 'text-slate-400' },
                                { label: 'ROUGE-L', val: '-', color: 'text-slate-400' },
                                { label: 'BLEU', val: '-', color: 'text-slate-400' },
                                { label: 'Time', val: '-', color: 'text-slate-400' }
                            ].map((m, i) => (
                                <div key={i} className="text-center">
                                    <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
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
