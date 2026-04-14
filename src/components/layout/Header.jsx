import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { APP_CONFIG } from '@/config/constants';
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-primary hover:text-primary-hover transition-colors">
                    📝 {APP_CONFIG.APP_NAME}
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-gray-500 font-medium hover:text-primary transition-colors">
                        {t('auth.home')}
                    </Link>
                    <Link
                        to="/summarize"
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                    >
                        <span>⚡</span> {t('auth.summarize')}
                    </Link>
                    <Link to="/dashboard" className="text-gray-500 font-medium hover:text-primary transition-colors">
                        📊 {t('auth.statistics')}
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <span className="text-sm text-gray-600 hidden sm:inline-block">
                                👤 {user?.name || user?.email || 'User'}
                            </span>
                            <button
                                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                onClick={handleLogout}
                            >
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
                        >
                            {t('login.submit')}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
