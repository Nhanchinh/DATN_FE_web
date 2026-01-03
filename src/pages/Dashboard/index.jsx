import { Link } from 'react-router-dom';
import { Button } from '@/components/common';

/**
 * Dashboard Page - Trang thống kê hệ thống tóm tắt văn bản
 */
const Dashboard = () => {
    // Sample stats data
    const stats = [
        { label: 'Tổng văn bản đã xử lý', value: '156', icon: '📄', change: '+12 hôm nay' },
        { label: 'Điểm ROUGE-1 TB', value: '72.5%', icon: '📊', change: '+2.3%' },
        { label: 'Điểm BLEU TB', value: '45.8%', icon: '📈', change: '+1.5%' },
        { label: 'Tỷ lệ nén TB', value: '68%', icon: '📉', change: 'Tối ưu' },
    ];

    // Sample history data
    const history = [
        {
            id: 1,
            title: 'Bài viết về Machine Learning',
            date: '03/01/2026 21:30',
            rouge1: 75.2,
            bleu: 48.5,
            compression: 65,
        },
        {
            id: 2,
            title: 'Tin tức công nghệ AI',
            date: '03/01/2026 20:15',
            rouge1: 82.1,
            bleu: 52.3,
            compression: 72,
        },
        {
            id: 3,
            title: 'Nghiên cứu NLP tiếng Việt',
            date: '03/01/2026 19:00',
            rouge1: 68.7,
            bleu: 41.2,
            compression: 58,
        },
        {
            id: 4,
            title: 'Bài báo khoa học',
            date: '02/01/2026 18:45',
            rouge1: 71.5,
            bleu: 44.8,
            compression: 70,
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">📊 Thống kê hệ thống</h1>
                    <p className="text-slate-500">
                        Tổng quan về các bài tóm tắt và điểm đánh giá
                    </p>
                </div>
                <Link to="/summarize">
                    <Button>+ Tóm tắt mới</Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 flex items-center justify-center bg-blue-50 text-2xl rounded-xl">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            <span className="text-xs font-semibold text-emerald-500">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* History Table */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="p-6 border-b border-slate-100 text-lg font-bold text-slate-800">📝 Lịch sử tóm tắt gần đây</h3>
                    <div className="p-6 overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tiêu đề</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Thời gian</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">ROUGE-1</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">BLEU</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Nén</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-slate-700">{item.title}</td>
                                        <td className="py-3 px-4 text-sm text-slate-500">{item.date}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-block px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-bold">
                                                {item.rouge1}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-bold">
                                                {item.bleu}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{item.compression}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 h-full">
                    <h3 className="p-6 border-b border-slate-100 text-lg font-bold text-slate-800">💡 Mẹo sử dụng</h3>
                    <div className="p-6">
                        <ul className="space-y-4">
                            {[
                                { label: 'ROUGE-1 cao', desc: 'Bản tóm tắt chứa nhiều từ quan trọng từ văn bản gốc' },
                                { label: 'BLEU cao', desc: 'Câu văn trong tóm tắt tự nhiên và mạch lạc' },
                                { label: 'Tỷ lệ nén tốt', desc: 'Thường từ 60-80%, giữ lại ý chính' },
                                { label: 'Đánh giá thủ công', desc: 'Kết hợp metrics với đọc lại để đánh giá toàn diện' }
                            ].map((tip, idx) => (
                                <li key={idx} className="text-sm text-slate-500 leading-relaxed border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                                    <strong className="text-slate-700 block mb-1">{tip.label}</strong>
                                    {tip.desc}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Metrics Overview */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 h-full">
                    <h3 className="p-6 border-b border-slate-100 text-lg font-bold text-slate-800">📈 Phân bố điểm số</h3>
                    <div className="p-6 space-y-6">
                        {[
                            { label: 'ROUGE-1', value: '72.5%', width: '72%', color: 'bg-blue-500' },
                            { label: 'ROUGE-2', value: '48.2%', width: '48%', color: 'bg-blue-500' },
                            { label: 'ROUGE-L', value: '65.1%', width: '65%', color: 'bg-blue-500' },
                            { label: 'BLEU', value: '45.8%', width: '45%', color: 'bg-emerald-500' }
                        ].map((metric, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <span className="w-20 text-xs font-bold text-slate-500">{metric.label}</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${metric.color}`} style={{ width: metric.width }}></div>
                                </div>
                                <span className="w-12 text-sm font-bold text-slate-700 text-right">{metric.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
