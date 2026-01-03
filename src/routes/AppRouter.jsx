import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/layouts';
import { Home, Login, Dashboard, Summarize, Playground, BatchEval, Analytics } from '@/pages';

/**
 * AppRouter - Cấu hình routing cho ứng dụng
 * 
 * Cấu trúc:
 * - MainLayout: Các trang có Header + Sidebar (Home, Dashboard)
 * - AuthLayout: Các trang authentication (Login, Register)
 */
const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Các route sử dụng MainLayout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/playground" element={<Playground />} />
                    <Route path="/batch-eval" element={<BatchEval />} />
                    <Route path="/analytics" element={<Analytics />} />

                    {/* Legacy routes kept for reference or removal */}
                    <Route path="/summarize" element={<Summarize />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                {/* Các route sử dụng AuthLayout */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    {/* Thêm route /register khi cần */}
                </Route>

                {/* 404 Page - có thể thêm sau */}
                <Route path="*" element={<div>404 - Trang không tìm thấy</div>} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
