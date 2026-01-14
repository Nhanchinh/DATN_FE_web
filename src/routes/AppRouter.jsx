import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/layouts';
import { Home, Login, Register, Playground, BatchEval, SingleEval, Analytics, History } from '@/pages';
import { ProtectedRoute } from '@/components/common';

/**
 * AppRouter - Cấu hình routing cho ứng dụng
 * 
 * Cấu trúc:
 * - MainLayout: Các trang có Header + Sidebar (protected routes)
 * - AuthLayout: Các trang authentication (Login, Register)
 */
const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Protected routes - yêu cầu đăng nhập */}
                <Route element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/" element={<Home />} />
                    <Route path="/playground" element={<Playground />} />
                    <Route path="/single-eval" element={<SingleEval />} />
                    <Route path="/batch-eval" element={<BatchEval />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/history" element={<History />} />
                </Route>

                {/* Public routes - không cần đăng nhập */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* 404 Page */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-slate-100">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-slate-300">404</h1>
                            <p className="text-slate-500 mt-2">Trang không tìm thấy</p>
                            <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                                Về trang chủ
                            </a>
                        </div>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
