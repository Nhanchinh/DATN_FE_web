import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';

const Analytics = () => {
    const barData = [
        { name: 'ViT5', rouge1: 72, rougeL: 65, bleu: 45 },
        { name: 'PhoBERT', rouge1: 68, rougeL: 60, bleu: 40 },
        { name: 'BART', rouge1: 75, rougeL: 68, bleu: 48 },
        { name: 'Gemini', rouge1: 85, rougeL: 78, bleu: 72 },
    ];

    const radarData = [
        { subject: 'Fluency', A: 120, B: 110, fullMark: 150 },
        { subject: 'Accuracy', A: 98, B: 130, fullMark: 150 },
        { subject: 'Coherence', A: 86, B: 130, fullMark: 150 },
        { subject: 'Consistency', A: 99, B: 100, fullMark: 150 },
        { subject: 'Relevance', A: 85, B: 90, fullMark: 150 },
        { subject: 'Brevity', A: 65, B: 85, fullMark: 150 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Model Analytics</h1>
                <p className="text-slate-500 mt-1">Comparative analysis of summarization models.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 mb-6">Performance Comparison (ROUGE/BLEU)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Legend />
                                <Bar dataKey="rouge1" name="ROUGE-1" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="rougeL" name="ROUGE-L" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 mb-6">Qualitative Analysis</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#cbd5e1" />
                                <Radar name="ViT5" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <Radar name="BART" dataKey="B" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
