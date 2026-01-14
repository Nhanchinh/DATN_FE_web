import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';
import { 
    FileText, 
    MessageSquare, 
    ThumbsUp, 
    ThumbsDown, 
    Minus, 
    Clock, 
    TrendingUp,
    Loader2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/common';
import historyService from '@/services/historyService';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await historyService.getAnalytics();
            setAnalytics(response);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    // Colors
    const RATING_COLORS = {
        good: '#22c55e',
        bad: '#ef4444',
        neutral: '#94a3b8'
    };

    const MODEL_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Đang tải thống kê...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-slate-700 mb-4">{error}</p>
                    <Button onClick={fetchAnalytics} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    if (!analytics || analytics.total_summaries === 0) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
                    <p className="text-slate-500 mt-1">Thống kê hoạt động tóm tắt văn bản.</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có dữ liệu</h3>
                    <p className="text-slate-500">Hãy sử dụng tính năng tóm tắt để có dữ liệu thống kê.</p>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const modelChartData = Object.entries(analytics.model_distribution).map(([model, count]) => ({
        name: model,
        value: count
    }));

    const ratingChartData = [
        { name: 'Tốt', value: analytics.rating_distribution.good, fill: RATING_COLORS.good },
        { name: 'Tệ', value: analytics.rating_distribution.bad, fill: RATING_COLORS.bad },
        { name: 'Trung bình', value: analytics.rating_distribution.neutral, fill: RATING_COLORS.neutral },
    ].filter(d => d.value > 0);

    const modelStatsData = analytics.model_stats.map(ms => ({
        name: ms.model,
        'Compression %': ms.avg_compression_ratio,
        'Time (ms)': ms.avg_processing_time_ms,
        count: ms.count,
        good: ms.good_count,
        bad: ms.bad_count
    }));

    // Fill missing dates for daily chart
    const dailyData = analytics.daily_counts.map(d => ({
        date: d.date.slice(5), // MM-DD format
        count: d.count
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
                    <p className="text-slate-500 mt-1">Thống kê hoạt động tóm tắt văn bản.</p>
                </div>
                <Button variant="outline" onClick={fetchAnalytics} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{analytics.total_summaries}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Tổng tóm tắt</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{analytics.total_with_feedback}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Có đánh giá</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{analytics.avg_compression_ratio}%</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Nén TB</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{analytics.avg_processing_time_ms}ms</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Xử lý TB</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                        <ThumbsUp className="w-6 h-6 text-green-600" />
                        <div>
                            <p className="text-3xl font-bold text-green-700">{analytics.rating_distribution.good}</p>
                            <p className="text-sm text-green-600">Đánh giá tốt</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-xl border border-red-100">
                    <div className="flex items-center gap-3">
                        <ThumbsDown className="w-6 h-6 text-red-600" />
                        <div>
                            <p className="text-3xl font-bold text-red-700">{analytics.rating_distribution.bad}</p>
                            <p className="text-sm text-red-600">Đánh giá tệ</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                        <Minus className="w-6 h-6 text-slate-500" />
                        <div>
                            <p className="text-3xl font-bold text-slate-700">{analytics.rating_distribution.neutral}</p>
                            <p className="text-sm text-slate-500">Trung bình</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Model Distribution Pie */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Phân bố theo Model</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={modelChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    labelLine={false}
                                >
                                    {modelChartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={MODEL_COLORS[index % MODEL_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Rating Distribution Pie */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Phân bố đánh giá</h3>
                    <div className="h-64">
                        {ratingChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ratingChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        labelLine={false}
                                    >
                                        {ratingChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Chưa có đánh giá
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Daily Activity Chart */}
            {dailyData.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Hoạt động 30 ngày gần nhất</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                    }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#6366f1" 
                                    strokeWidth={2}
                                    fill="url(#colorCount)" 
                                    name="Số tóm tắt"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Model Performance Comparison */}
            {modelStatsData.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">So sánh Model</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={modelStatsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    width={120}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px' 
                                    }} 
                                />
                                <Legend />
                                <Bar dataKey="count" name="Số lượng" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="good" name="Đánh giá tốt" fill="#22c55e" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="bad" name="Đánh giá tệ" fill="#ef4444" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Model Stats Table */}
            {analytics.model_stats.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-lg font-semibold text-slate-700">Chi tiết Model</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold">Model</th>
                                    <th className="px-6 py-3 text-center font-semibold">Số lượng</th>
                                    <th className="px-6 py-3 text-center font-semibold">Nén TB (%)</th>
                                    <th className="px-6 py-3 text-center font-semibold">Thời gian (ms)</th>
                                    <th className="px-6 py-3 text-center font-semibold">👍 Tốt</th>
                                    <th className="px-6 py-3 text-center font-semibold">👎 Tệ</th>
                                    <th className="px-6 py-3 text-center font-semibold">😐 TB</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {analytics.model_stats.map((ms, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-800">{ms.model}</td>
                                        <td className="px-6 py-4 text-center">{ms.count}</td>
                                        <td className="px-6 py-4 text-center">{ms.avg_compression_ratio}%</td>
                                        <td className="px-6 py-4 text-center">{ms.avg_processing_time_ms}ms</td>
                                        <td className="px-6 py-4 text-center text-green-600 font-semibold">{ms.good_count}</td>
                                        <td className="px-6 py-4 text-center text-red-600 font-semibold">{ms.bad_count}</td>
                                        <td className="px-6 py-4 text-center text-slate-500">{ms.neutral_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
