import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute - Bảo vệ route yêu cầu authentication
 * 
 * Nếu user chưa đăng nhập, redirect về /login
 * Nếu đang loading, hiển thị loading spinner
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Đang kiểm tra auth state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Đang kiểm tra phiên đăng nhập...</p>
                </div>
            </div>
        );
    }

    // Chưa đăng nhập -> redirect to login
    if (!isAuthenticated) {
        // Lưu location để redirect về sau khi login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Đã đăng nhập -> render children
    return children;
};

export default ProtectedRoute;
