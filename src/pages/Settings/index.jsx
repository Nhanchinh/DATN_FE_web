import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Lock, Save, Loader2, AlertCircle, Check, User, Globe } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { authService } from '@/services';
import { useAuth } from '@/hooks';
import { useTranslation } from 'react-i18next';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const { user, refreshUser } = useAuth();

    const [settings, setSettings] = useState({
        full_name: '',
        consent_share_data: true
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await authService.getSettings();
                setSettings({
                    full_name: data.full_name || '',
                    consent_share_data: data.consent_share_data !== false
                });
            } catch (err) {
                console.error('Load settings error:', err);
                setError(t('settings.loadError'));
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await authService.updateSettings({
                full_name: settings.full_name || null,
                consent_share_data: settings.consent_share_data
            });
            setSuccess(t('settings.saveSuccess'));
            if (refreshUser) {
                await refreshUser();
            }
        } catch (err) {
            console.error('Save settings error:', err);
            setError(err.response?.data?.detail || t('settings.saveError'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-blue-600" />
                    {t('settings.title')}
                </h1>
                <p className="text-slate-500 mt-1">
                    {t('settings.subtitle')}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-lg flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {success}
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    {t('settings.personalInfo')}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            {t('settings.emailLabel')}
                        </label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">{t('settings.emailNote')}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            {t('settings.fullName')}
                        </label>
                        <input
                            type="text"
                            value={settings.full_name}
                            onChange={(e) => setSettings(s => ({ ...s, full_name: e.target.value }))}
                            placeholder={t('settings.fullNamePlaceholder')}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            {t('settings.roleLabel')}
                        </label>
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${user?.role === 'admin'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                            {user?.role === 'admin' ? t('settings.adminRole') : t('settings.userRole')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-amber-600" />
                    {t('settings.privacy')}
                </h2>

                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-1">
                            <h3 className="font-medium text-slate-800">
                                {t('settings.shareData')}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {t('settings.shareDataDesc')}
                            </p>
                        </div>
                        <button
                            onClick={() => setSettings(s => ({ ...s, consent_share_data: !s.consent_share_data }))}
                            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${settings.consent_share_data
                                ? 'bg-emerald-500'
                                : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${settings.consent_share_data
                                    ? 'left-6'
                                    : 'left-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    <div className={`flex items-center gap-2 text-sm ${settings.consent_share_data
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                        }`}>
                        {settings.consent_share_data ? (
                            <>
                                <Check className="w-4 h-4" />
                                {t('settings.dataShared')}
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                {t('settings.dataProtected')}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Language */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-blue-600" />
                    {t('settings.language')}
                </h2>

                <div className="flex gap-3">
                    <button
                        onClick={() => i18n.changeLanguage('vi')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            i18n.language === 'vi'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        <span className="text-lg">🇻🇳</span>
                        {t('lang.vi')}
                    </button>
                    <button
                        onClick={() => i18n.changeLanguage('en')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                            i18n.language === 'en'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        <span className="text-lg">🇬🇧</span>
                        {t('lang.en')}
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {t('settings.saving')}
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {t('settings.saveSettings')}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default Settings;
