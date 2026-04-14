import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">{t('auth.checkingSession')}</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
