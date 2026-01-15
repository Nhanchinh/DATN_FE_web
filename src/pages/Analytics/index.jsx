import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart
} from 'recharts';
import {
    FileText,
    TrendingUp,
    Loader2,
    AlertCircle,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight
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
            setError('Không thể tải dữ liệu thống kê.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const MODEL_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 mb-4">{error}</p>
                    <Button variant="outline" onClick={fetchAnalytics} size="sm">
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    if (!analytics || analytics.total_summaries === 0) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Chưa có dữ liệu thống kê</p>
                </div>
            </div>
        );
    }

    const modelChartData = Object.entries(analytics.model_distribution).map(([model, count]) => ({
        name: model,
        value: count
    }));

    const dailyData = analytics.daily_counts.map(d => ({
        date: d.date.slice(5),
        count: d.count
    }));

    const goodRate = analytics.total_with_feedback > 0
        ? ((analytics.rating_distribution.good / analytics.total_with_feedback) * 100).toFixed(0)
        : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">Thống kê hoạt động hệ thống</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Tổng tóm tắt</span>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            12%
                        </span>
                    </div>
                    <p className="text-3xl font-semibold text-slate-900 mt-2">{analytics.total_summaries.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Có đánh giá</span>
                    </div>
                    <p className="text-3xl font-semibold text-slate-900 mt-2">{analytics.total_with_feedback.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {analytics.total_summaries > 0 ? ((analytics.total_with_feedback / analytics.total_summaries) * 100).toFixed(0) : 0}% tổng số
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Tỉ lệ nén</span>
                    </div>
                    <p className="text-3xl font-semibold text-slate-900 mt-2">{analytics.avg_compression_ratio}%</p>
                    <p className="text-xs text-slate-400 mt-1">Trung bình</p>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Thời gian xử lý</span>
                    </div>
                    <p className="text-3xl font-semibold text-slate-900 mt-2">{analytics.avg_processing_time_ms}<span className="text-lg text-slate-400">ms</span></p>
                    <p className="text-xs text-slate-400 mt-1">Trung bình</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-6">
                {/* Activity Chart */}
                <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-slate-900">Hoạt động 30 ngày</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#colorCount)"
                                    name="Tóm tắt"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Model Distribution */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="text-sm font-medium text-slate-900 mb-6">Phân bố Model</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={modelChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {modelChartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={MODEL_COLORS[index % MODEL_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {modelChartData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: MODEL_COLORS[idx % MODEL_COLORS.length] }}
                                    />
                                    <span className="text-slate-600">{item.name}</span>
                                </div>
                                <span className="text-slate-900 font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-3 gap-6">
                {/* Feedback Summary */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="text-sm font-medium text-slate-900 mb-4">Đánh giá người dùng</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600">Tốt</span>
                                <span className="text-slate-900 font-medium">{analytics.rating_distribution.good}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${analytics.total_with_feedback > 0 ? (analytics.rating_distribution.good / analytics.total_with_feedback) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600">Trung bình</span>
                                <span className="text-slate-900 font-medium">{analytics.rating_distribution.neutral}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-slate-400 rounded-full"
                                    style={{ width: `${analytics.total_with_feedback > 0 ? (analytics.rating_distribution.neutral / analytics.total_with_feedback) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600">Tệ</span>
                                <span className="text-slate-900 font-medium">{analytics.rating_distribution.bad}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${analytics.total_with_feedback > 0 ? (analytics.rating_distribution.bad / analytics.total_with_feedback) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Model Performance */}
                <div className="col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="text-sm font-medium text-slate-900">Hiệu suất Model</h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Model</th>
                                <th className="px-4 py-3 text-right font-medium">Số lượng</th>
                                <th className="px-4 py-3 text-right font-medium">Nén</th>
                                <th className="px-4 py-3 text-right font-medium">Thời gian</th>
                                <th className="px-4 py-3 text-right font-medium">Tỉ lệ tốt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {analytics.model_stats.map((ms, idx) => {
                                const total = ms.good_count + ms.bad_count + ms.neutral_count;
                                const goodPercent = total > 0 ? ((ms.good_count / total) * 100).toFixed(0) : 0;
                                return (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{ms.model}</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{ms.count}</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{ms.avg_compression_ratio}%</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{ms.avg_processing_time_ms}ms</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`${goodPercent >= 70 ? 'text-emerald-600' : goodPercent >= 50 ? 'text-amber-600' : 'text-slate-600'}`}>
                                                {goodPercent}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
