import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">{t('auth.checkingAccess')}</p>
                </div>
            </div>
        );
    }

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('auth.accessDenied')}</h1>
                    <p className="text-slate-500 mb-6">
                        {t('auth.adminOnly')}
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {t('auth.goHome')}
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
