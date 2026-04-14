import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/common';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t } = useTranslation();
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
            tempErrors.email = t('login.enterEmail');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = t('login.invalidEmail');
        }
        if (!formData.password) {
            tempErrors.password = t('login.enterPassword');
        } else if (formData.password.length < 6) {
            tempErrors.password = t('login.passwordMin');
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
                navigate('/', { replace: true });
            } else {
                setGeneralError(result.error);
            }
        } catch (error) {
            setGeneralError(error.message || t('login.loginFailed'));
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

    return (
        <div className="login-container">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('login.title')}</h2>
                <p className="text-slate-500 mt-2">{t('login.subtitle')}</p>
            </div>

            {generalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200">
                    {generalError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label={t('login.email')}
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
                    label={t('login.password')}
                    name="password"
                    type="password"
                    placeholder={t('login.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    disabled={loading}
                />

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-slate-600">{t('login.rememberMe')}</span>
                    </label>
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        {t('login.forgotPassword')}
                    </a>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={loading}
                    className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 border-0"
                >
                    {t('login.submit')}
                </Button>

                <div className="text-center text-sm text-slate-500 mt-6">
                    {t('login.noAccount')}{' '}
                    <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                        {t('login.register')}
                    </a>
                </div>

                {/* Dev hint */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                    <p className="font-medium mb-1">{t('login.testAccount')}</p>
                    <p>Email: test@example.com</p>
                    <p>{t('login.testPassword')}: secret123</p>
                </div>
            </form>
        </div>
    );
};

export default Login;
