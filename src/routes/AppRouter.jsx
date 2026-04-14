import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/layouts';
import { Home, Login, Register, Playground, CompareModels, BatchEval, BatchSummarize, SingleEval, Analytics, History, Settings, UserManagement } from '@/pages';
import { ProtectedRoute } from '@/components/common';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-slate-300">404</h1>
                <p className="text-slate-500 mt-2">{t('auth.pageNotFound')}</p>
                <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                    {t('auth.goHome')}
                </a>
            </div>
        </div>
    );
};

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/" element={<Home />} />
                    <Route path="/playground" element={<Playground />} />
                    <Route path="/compare" element={<CompareModels />} />
                    <Route path="/single-eval" element={<SingleEval />} />
                    <Route path="/batch-eval" element={<BatchEval />} />
                    <Route path="/batch-summarize" element={<BatchSummarize />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
