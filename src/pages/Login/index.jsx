import { useState } from 'react';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/common';

/**
 * Login Page - Update to Tailwind CSS
 */
const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const validate = () => {
        const tempErrors = {};
        if (!formData.email) tempErrors.email = 'Vui lòng nhập email';
        if (!formData.password) tempErrors.password = 'Vui lòng nhập mật khẩu';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        if (!validate()) return;

        setIsLoading(true);
        try {
            await login(formData.email, formData.password);
            // Redirect handled by AuthContext/AppRouter
        } catch (error) {
            setGeneralError(error.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="login-container">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Đăng nhập</h2>
                <p className="text-slate-500 mt-2">Nhập thông tin tài khoản của bạn</p>
            </div>

            {generalError && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                    {generalError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoFocus
                />

                <Input
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-slate-600">Ghi nhớ đăng nhập</span>
                    </label>
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        Quên mật khẩu?
                    </a>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isLoading}
                    className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 border-0"
                >
                    Đăng nhập
                </Button>

                <div className="text-center text-sm text-slate-500 mt-6">
                    Chưa có tài khoản?{' '}
                    <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                        Đăng ký ngay
                    </a>
                </div>
            </form>
        </div>
    );
};

export default Login;
