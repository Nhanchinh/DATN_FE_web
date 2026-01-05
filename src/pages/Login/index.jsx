import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/common';

/**
 * Login Page - Authentication with JWT
 */
const Login = () => {
    const navigate = useNavigate();
    const { login, isLoading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const validate = () => {
        const tempErrors = {};
        if (!formData.email) {
            tempErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = 'Email không hợp lệ';
        }
        if (!formData.password) {
            tempErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        if (!validate()) return;

        setIsLoading(true);
        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                // Redirect to home/dashboard on success
                navigate('/', { replace: true });
            } else {
                setGeneralError(result.error);
            }
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
        if (generalError) {
            setGeneralError('');
        }
    };

    const loading = isLoading || authLoading;

    return (
        <div className="login-container">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Đăng nhập</h2>
                <p className="text-slate-500 mt-2">Nhập thông tin tài khoản của bạn</p>
            </div>

            {generalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200">
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
                    disabled={loading}
                />

                <Input
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    disabled={loading}
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
                    loading={loading}
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

                {/* Dev hint */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                    <p className="font-medium mb-1">🧪 Test account:</p>
                    <p>Email: test@example.com</p>
                    <p>Password: secret123</p>
                </div>
            </form>
        </div>
    );
};

export default Login;
