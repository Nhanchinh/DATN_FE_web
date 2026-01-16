import { useAuthContext } from '@/context/AuthContext';

/**
 * Custom hook để sử dụng authentication
 * Wrapper cho useAuthContext để dễ sử dụng hơn
 */
const useAuth = () => {
    const { user, isLoading, isAuthenticated, login, logout, register, refreshUser } = useAuthContext();

    return {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        register,
        refreshUser,
    };
};

export default useAuth;
