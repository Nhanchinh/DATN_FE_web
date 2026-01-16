import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
            const storedUser = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);

            if (token) {
                // Trước tiên, load user từ localStorage để UI hiển thị ngay
                if (storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setUser(parsedUser);
                        setIsAuthenticated(true);
                    } catch (e) {
                        console.error('Failed to parse stored user:', e);
                    }
                }

                try {
                    // Sau đó verify với server và cập nhật user mới nhất
                    const userData = await authService.me();
                    setUser(userData);
                    setIsAuthenticated(true);
                    // Cập nhật localStorage với data mới
                    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // Nếu API fail nhưng có stored user, giữ session (offline mode)
                    if (!storedUser) {
                        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
                        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
                        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                }
            }

            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Đăng nhập
    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const response = await authService.login(email, password);

            // Response format: { access_token, refresh_token, token_type, user }
            const { access_token, refresh_token, user: userData } = response;

            // Lưu tokens
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, access_token);
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (error) {
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.message ||
                'Đăng nhập thất bại';
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Đăng xuất
    const logout = useCallback(async () => {
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
    }, []);

    // Đăng ký
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        try {
            const response = await authService.register(userData);
            return { success: true, data: response };
        } catch (error) {
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.message ||
                'Đăng ký thất bại';
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh user data từ server (khi cập nhật settings)
    const refreshUser = useCallback(async () => {
        try {
            const userData = await authService.me();
            setUser(userData);
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Refresh user failed:', error);
            return null;
        }
    }, []);

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        register,
        refreshUser,
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
