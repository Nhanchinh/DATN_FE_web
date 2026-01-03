import { Outlet } from 'react-router-dom';

/**
 * AuthLayout - Layout cho các trang authentication (Login, Register)
 * Only containing form centered on screen
 */
const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white drop-shadow-md">🚀 TextSum</h1>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
