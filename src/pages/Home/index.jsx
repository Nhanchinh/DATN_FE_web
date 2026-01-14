import { Button } from '@/components/common';
import { Link } from 'react-router-dom';

/**
 * Home Page - Trang chủ hệ thống đánh giá tóm tắt văn bản
 */
const Home = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-16">
            <section className="text-center py-16 px-4">
                <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm">
                    🎓 Đồ án tốt nghiệp
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-6 leading-tight">
                    Hệ thống <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Đánh giá Tóm tắt</span> Văn bản
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed">
                    Tóm tắt văn bản tự động và đánh giá chất lượng bản tóm tắt với các metrics
                    ROUGE, BLEU. Hỗ trợ văn bản tiếng Việt.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link to="/playground">
                        <Button size="lg" className="shadow-lg shadow-blue-500/30">⚡ Bắt đầu ngay</Button>
                    </Link>
                    <Link to="/analytics">
                        <Button variant="outline" size="lg">📊 Xem thống kê</Button>
                    </Link>
                </div>

                {/* Demo Preview */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12">
                    {/* Original Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-md max-w-sm text-left border border-slate-100 relative group hover:-translate-y-1 transition-transform">
                        <div className="absolute -top-3 left-4 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-semibold">📄 Văn bản gốc</div>
                        <div className="text-slate-700 text-sm leading-relaxed mt-2">
                            Học máy là một nhánh của trí tuệ nhân tạo, tập trung vào việc
                            xây dựng các hệ thống có khả năng học từ dữ liệu...
                        </div>
                    </div>

                    <div className="text-3xl text-blue-500 font-bold rotate-90 md:rotate-0">→</div>

                    {/* Result Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-md max-w-sm text-left border-2 border-blue-500 relative hover:-translate-y-1 transition-transform">
                        <div className="absolute -top-3 left-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">✨ Tóm tắt</div>
                        <div className="text-slate-800 text-sm font-medium leading-relaxed mt-2">
                            Học máy là nhánh AI giúp hệ thống học từ dữ liệu.
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold">ROUGE-1: 85%</span>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold">BLEU: 72%</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-8">
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Tính năng nổi bật</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                    {[
                        { icon: '⚡', title: 'Tóm tắt tự động', desc: 'Sử dụng các mô hình AI tiên tiến để tóm tắt văn bản một cách nhanh chóng và chính xác.' },
                        { icon: '📊', title: 'Đánh giá ROUGE/BLEU', desc: 'Đánh giá chất lượng bản tóm tắt với các metrics chuẩn: ROUGE-1, ROUGE-2, ROUGE-L, BLEU.' },
                        { icon: '🇻🇳', title: 'Hỗ trợ tiếng Việt', desc: 'Được tối ưu hóa để xử lý văn bản tiếng Việt với độ chính xác cao.' },
                        { icon: '📈', title: 'Thống kê chi tiết', desc: 'Xem lịch sử và thống kê các bài tóm tắt đã thực hiện với biểu đồ trực quan.' }
                    ].map((item, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-slate-100">
                            <span className="text-4xl block mb-4">{item.icon}</span>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 mx-4">
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Cách thức hoạt động</h2>
                <div className="flex flex-wrap justify-center gap-12 text-center">
                    {[
                        { step: '1', title: 'Nhập văn bản', desc: 'Dán hoặc nhập văn bản cần tóm tắt' },
                        { step: '2', title: 'Xử lý AI', desc: 'Hệ thống tự động tóm tắt văn bản' },
                        { step: '3', title: 'Xem kết quả', desc: 'Nhận bản tóm tắt và điểm đánh giá' }
                    ].map((item, index) => (
                        <div key={index} className="max-w-[200px] relative">
                            <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-blue-500/30">
                                {item.step}
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
