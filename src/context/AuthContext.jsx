import { createContext, useContext, useState, useEffect } from 'react';
import { APP_CONFIG } from '@/config/constants';
import { authService } from '@/services';

// Tạo context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Kiểm tra token khi app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);

            if (token) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // Token không hợp lệ, xóa khỏi storage
                    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
                    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);
                }
            }

            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Đăng nhập
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await authService.login(email, password);

            // Lưu token và user info
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
            if (response.refreshToken) {
                localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
            }
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(response.user));

            setUser(response.user);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Đăng nhập thất bại'
            };
        } finally {
            setIsLoading(false);
        }
    };

    // Đăng xuất
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Xóa data local dù API có lỗi hay không
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Đăng ký
    const register = async (userData) => {
        setIsLoading(true);
        try {
            const response = await authService.register(userData);
            return { success: true, data: response };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Đăng ký thất bại'
            };
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        register,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook để sử dụng AuthContext
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
