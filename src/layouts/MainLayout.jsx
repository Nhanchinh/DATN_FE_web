import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Terminal, Database, ChevronRight, Menu, LogOut, User, Settings, ChevronUp, History, FileCheck } from 'lucide-react';
import { useAuth } from '@/hooks';

/**
 * MainLayout - Research Dashboard Layout
 * Fixed Sidebar with User Dropdown, Header, and Main Content
 */
const MainLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const navItems = [
        { path: '/analytics', label: 'Overview', icon: LayoutDashboard },
        { path: '/playground', label: 'Playground', icon: Terminal },
        { path: '/single-eval', label: 'Single Eval', icon: FileCheck },
        { path: '/batch-eval', label: 'Batch Eval', icon: Database },
        { path: '/history', label: 'History', icon: History },
    ];

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 fixed h-full z-20 flex flex-col">
                <NavLink to="/" className="block p-6 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3 text-white font-bold text-xl">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">TS</div>
                        TextSum
                    </div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Evaluation System</div>
                </NavLink>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <div className="text-xs font-semibold text-slate-500 px-3 mb-2 uppercase tracking-wider">Research</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                                ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                    ))}
                </nav>

                {/* User Section with Dropdown */}
                <div className="p-4 border-t border-slate-800 relative" ref={menuRef}>
                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden animate-in slide-in-from-bottom-2">
                            {/* User Info */}
                            <div className="p-4 border-b border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                            {user?.full_name || 'User'}
                                        </div>
                                        <div className="text-xs text-slate-400 truncate">
                                            {user?.email || 'email@example.com'}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 px-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                                        {user?.role === 'admin' ? '👑 Admin' : '🧑‍🔬 Researcher'}
                                    </span>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                    <User className="w-4 h-4" />
                                    Hồ sơ cá nhân
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                    <Settings className="w-4 h-4" />
                                    Cài đặt
                                </button>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-slate-700 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}

                    {/* User Button */}
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full bg-slate-800 hover:bg-slate-700 rounded-lg p-3 flex items-center gap-3 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-medium text-white truncate">
                                {user?.full_name || 'User'}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                                {user?.role === 'admin' ? 'Admin' : 'Pro Plan'}
                            </div>
                        </div>
                        <ChevronUp className={`w-4 h-4 text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col ml-64 min-w-0">
                {/* Simplified Header for Dashboard */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-400">
                        <Menu className="w-5 h-5" />
                        <span className="text-sm">Workspace / Project A</span>
                    </div>
                    <div>
                        {/* Header actions if needed */}
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
