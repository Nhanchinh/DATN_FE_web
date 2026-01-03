import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Terminal, Database, ChevronRight, Menu } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * MainLayout - Research Dashboard Layout
 * Fixed Sidebar, Header, and Main Content
 */
const MainLayout = () => {
    const navItems = [
        { path: '/analytics', label: 'Overview', icon: LayoutDashboard },
        { path: '/playground', label: 'Playground', icon: Terminal },
        { path: '/batch-eval', label: 'Dataset Eval', icon: Database },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 fixed h-full z-20 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-white font-bold text-xl">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">TS</div>
                        TextSum
                    </div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Evaluation System</div>
                </div>

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

                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">Researcher</div>
                            <div className="text-xs text-slate-500 truncate">Pro Plan</div>
                        </div>
                    </div>
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
