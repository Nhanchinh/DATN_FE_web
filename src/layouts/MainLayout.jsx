import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';


/**
 * MainLayout - Layout chính cho các trang đã đăng nhập
 * Bao gồm Header, Sidebar và Footer
 */
const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <div className="flex flex-1 flex-col md:flex-row">
                <aside className="w-full md:w-64 bg-slate-800 text-slate-100 p-6 flex-shrink-0">
                    <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                        <a href="/" className="block px-4 py-2 rounded-lg transition-colors hover:bg-white/10">
                            🏠 Trang chủ
                        </a>
                        <a href="/summarize" className="block px-4 py-2 rounded-lg transition-colors bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-md">
                            ⚡ Tóm tắt
                        </a>
                        <a href="/dashboard" className="block px-4 py-2 rounded-lg transition-colors hover:bg-white/10">
                            📊 Thống kê
                        </a>
                    </nav>
                </aside>
                <main className="flex-1 p-6 md:p-8 bg-slate-50">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
