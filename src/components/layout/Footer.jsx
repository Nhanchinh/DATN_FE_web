import { Link } from 'react-router-dom';
import { APP_CONFIG } from '@/config/constants';

/**
 * Footer component - Tailwind CSS
 */
const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors">
                            📝 {APP_CONFIG.APP_NAME}
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                            Hệ thống đánh giá tóm tắt văn bản tự động hỗ trợ tiếng Việt với các metrics chuẩn khoa học.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-4">Liên kết</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link></li>
                            <li><Link to="/summarize" className="hover:text-blue-600 transition-colors">Tóm tắt & Đánh giá</Link></li>
                            <li><Link to="/dashboard" className="hover:text-blue-600 transition-colors">Thống kê</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-4">Liên hệ</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li>Email: contact@textsum-eval.vn</li>
                            <li>Hotline: 0123.456.789</li>
                            <li>Địa chỉ: Đại học ABC, Hà Nội</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
