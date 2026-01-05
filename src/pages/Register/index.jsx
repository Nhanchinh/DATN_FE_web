import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/common';
import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Register Page - Đăng ký tài khoản mới
 */
const Register = () => {
    const navigate = useNavigate();
    const { register, isLoading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [success, setSuccess] = useState(false);

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, text: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { level: score, text: 'Yếu', color: 'bg-red-500' };
        if (score <= 3) return { level: score, text: 'Trung bình', color: 'bg-yellow-500' };
        return { level: score, text: 'Mạnh', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const validate = () => {
        const tempErrors = {};

        // Email validation
        if (!formData.email) {
            tempErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = 'Email không hợp lệ';
        }

        // Password validation
        if (!formData.password) {
            tempErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        // Confirm password
        if (!formData.confirmPassword) {
            tempErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            tempErrors.confirmPassword = 'Mật khẩu không khớp';
        }

        // Full name (optional but if entered, must be valid)
        if (formData.full_name && formData.full_name.length < 2) {
            tempErrors.full_name = 'Tên phải có ít nhất 2 ký tự';
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
            const result = await register({
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name || null
            });

            if (result.success) {
                setSuccess(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 2000);
            } else {
                setGeneralError(result.error);
            }
        } catch (error) {
            setGeneralError(error.message || 'Đăng ký thất bại');
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

    // Success state
    if (success) {
        return (
            <div className="login-container text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Đăng ký thành công!</h2>
                <p className="text-slate-500 mb-4">Đang chuyển đến trang đăng nhập...</p>
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                    Đăng nhập ngay
                </Link>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Tạo tài khoản</h2>
                <p className="text-slate-500 mt-2">Đăng ký để sử dụng hệ thống</p>
            </div>

            {generalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {generalError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Họ và tên"
                    name="full_name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.full_name}
                    onChange={handleChange}
                    error={errors.full_name}
                    disabled={loading}
                />

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    disabled={loading}
                />

                <div>
                    <Input
                        label="Mật khẩu"
                        name="password"
                        type="password"
                        placeholder="Ít nhất 6 ký tự"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        disabled={loading}
                    />
                    {formData.password && (
                        <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full ${i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className={`text-xs ${passwordStrength.level <= 2 ? 'text-red-500' :
                                    passwordStrength.level <= 3 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                Độ mạnh: {passwordStrength.text}
                            </p>
                        </div>
                    )}
                </div>

                <Input
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    disabled={loading}
                />

                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={loading}
                    className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 border-0"
                >
                    Đăng ký
                </Button>

                <div className="text-center text-sm text-slate-500 mt-6">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Register;
