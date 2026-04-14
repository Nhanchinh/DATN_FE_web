import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/common';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const { t } = useTranslation();
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

    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, text: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { level: score, text: t('register.strengthWeak'), color: 'bg-red-500' };
        if (score <= 3) return { level: score, text: t('register.strengthMedium'), color: 'bg-yellow-500' };
        return { level: score, text: t('register.strengthStrong'), color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const validate = () => {
        const tempErrors = {};

        if (!formData.email) {
            tempErrors.email = t('register.enterEmail');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = t('register.invalidEmail');
        }

        if (!formData.password) {
            tempErrors.password = t('register.enterPassword');
        } else if (formData.password.length < 6) {
            tempErrors.password = t('register.passwordMin');
        }

        if (!formData.confirmPassword) {
            tempErrors.confirmPassword = t('register.enterConfirm');
        } else if (formData.password !== formData.confirmPassword) {
            tempErrors.confirmPassword = t('register.passwordMismatch');
        }

        if (formData.full_name && formData.full_name.length < 2) {
            tempErrors.full_name = t('register.nameMin');
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
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 2000);
            } else {
                setGeneralError(result.error);
            }
        } catch (error) {
            setGeneralError(error.message || t('register.registerFailed'));
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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (generalError) {
            setGeneralError('');
        }
    };

    const loading = isLoading || authLoading;

    if (success) {
        return (
            <div className="login-container text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('register.successTitle')}</h2>
                <p className="text-slate-500 mb-4">{t('register.redirecting')}</p>
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                    {t('register.loginNow')}
                </Link>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('register.title')}</h2>
                <p className="text-slate-500 mt-2">{t('register.subtitle')}</p>
            </div>

            {generalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {generalError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label={t('register.fullName')}
                    name="full_name"
                    type="text"
                    placeholder={t('auth.namePlaceholder')}
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
                        label={t('register.password')}
                        name="password"
                        type="password"
                        placeholder={t('register.passwordPlaceholder')}
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
                                {t('register.strengthLabel')}: {passwordStrength.text}
                            </p>
                        </div>
                    )}
                </div>

                <Input
                    label={t('register.confirmPassword')}
                    name="confirmPassword"
                    type="password"
                    placeholder={t('register.confirmPlaceholder')}
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
                    {t('register.submit')}
                </Button>

                <div className="text-center text-sm text-slate-500 mt-6">
                    {t('register.hasAccount')}{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                        {t('register.login')}
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Register;
