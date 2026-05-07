import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Lock, Save, Loader2, AlertCircle, Check, User, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/common';
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
    const [originalSettings, setOriginalSettings] = useState({
        full_name: '',
        consent_share_data: true
    });
    const [draftFullName, setDraftFullName] = useState('');
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPrivacy, setSavingPrivacy] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [privacyError, setPrivacyError] = useState('');
    const [privacySuccess, setPrivacySuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isPersonalExpanded, setIsPersonalExpanded] = useState(true);
    const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);
    const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await authService.getSettings();
                const nextSettings = {
                    full_name: data.full_name || '',
                    consent_share_data: data.consent_share_data !== false
                };
                setSettings(nextSettings);
                setOriginalSettings(nextSettings);
                setDraftFullName(nextSettings.full_name);
            } catch (err) {
                console.error('Load settings error:', err);
                setProfileError(t('settings.loadError'));
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setProfileError('');
        setProfileSuccess('');

        try {
            await authService.updateSettings({
                full_name: draftFullName || null
            });
            const updated = {
                ...settings,
                full_name: draftFullName
            };
            setSettings(updated);
            setOriginalSettings((prev) => ({ ...prev, full_name: draftFullName }));
            setProfileSuccess(t('settings.saveSuccess'));
            setIsEditingName(false);
            if (refreshUser) {
                await refreshUser();
            }
        } catch (err) {
            console.error('Save settings error:', err);
            setProfileError(err.response?.data?.detail || t('settings.saveError'));
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSavePrivacy = async () => {
        setSavingPrivacy(true);
        setPrivacyError('');
        setPrivacySuccess('');

        try {
            await authService.updateSettings({
                consent_share_data: settings.consent_share_data
            });
            setOriginalSettings((prev) => ({ ...prev, consent_share_data: settings.consent_share_data }));
            setPrivacySuccess(t('settings.saveSuccess'));
        } catch (err) {
            console.error('Save privacy settings error:', err);
            setPrivacyError(err.response?.data?.detail || t('settings.saveError'));
        } finally {
            setSavingPrivacy(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError(t('settings.passwordRequired'));
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError(t('settings.passwordMin'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(t('settings.passwordMismatch'));
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(t('settings.passwordSameAsCurrent'));
            return;
        }

        setChangingPassword(true);
        try {
            await authService.changePassword(currentPassword, newPassword);
            setPasswordSuccess(t('settings.passwordChangeSuccess'));
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setIsPasswordExpanded(false);
        } catch (err) {
            console.error('Change password error:', err);
            setPasswordError(err.response?.data?.detail || t('settings.passwordChangeError'));
        } finally {
            setChangingPassword(false);
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

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <button
                    type="button"
                    onClick={() => setIsPersonalExpanded((prev) => !prev)}
                    className="w-full flex items-center justify-between text-left"
                >
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        {t('settings.personalInfo')}
                    </h2>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isPersonalExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isPersonalExpanded && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
                        {profileError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {profileError}
                            </div>
                        )}
                        {profileSuccess && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-lg flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                {profileSuccess}
                            </div>
                        )}

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
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={draftFullName}
                                    onChange={(e) => setDraftFullName(e.target.value)}
                                    placeholder={t('settings.fullNamePlaceholder')}
                                    disabled={!isEditingName}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        isEditingName
                                            ? 'border-slate-200 bg-white'
                                            : 'border-slate-200 bg-slate-100 text-slate-500'
                                    }`}
                                />
                                {!isEditingName ? (
                                    <Button
                                        onClick={() => {
                                            setIsEditingName(true);
                                            setProfileError('');
                                            setProfileSuccess('');
                                        }}
                                        className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2"
                                    >
                                        {t('settings.editName')}
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={savingProfile}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                                        >
                                            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : t('settings.saveName')}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setDraftFullName(settings.full_name);
                                                setIsEditingName(false);
                                                setProfileError('');
                                            }}
                                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2"
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                    </div>
                                )}
                            </div>
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
                )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <button
                    type="button"
                    onClick={() => setIsPrivacyExpanded((prev) => !prev)}
                    className="w-full flex items-center justify-between text-left"
                >
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-amber-600" />
                        {t('settings.privacy')}
                    </h2>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isPrivacyExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isPrivacyExpanded && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
                        {privacyError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {privacyError}
                            </div>
                        )}
                        {privacySuccess && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-lg flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                {privacySuccess}
                            </div>
                        )}

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
                                onClick={() => {
                                    setSettings(s => ({ ...s, consent_share_data: !s.consent_share_data }));
                                    setPrivacySuccess('');
                                    setPrivacyError('');
                                }}
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

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSavePrivacy}
                                disabled={savingPrivacy || settings.consent_share_data === originalSettings.consent_share_data}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5"
                            >
                                {savingPrivacy ? (
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
                )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <button
                    type="button"
                    onClick={() => setIsPasswordExpanded((prev) => !prev)}
                    className="w-full flex items-center justify-between text-left"
                >
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-rose-600" />
                        {t('settings.changePassword')}
                    </h2>
                    <ChevronDown
                        className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                            isPasswordExpanded ? 'rotate-180' : ''
                        }`}
                    />
                </button>

                {isPasswordExpanded && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
                        {passwordError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {passwordError}
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-lg flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                {passwordSuccess}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                {t('settings.currentPassword')}
                            </label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder={t('settings.currentPasswordPlaceholder')}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                {t('settings.newPassword')}
                            </label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                placeholder={t('settings.newPasswordPlaceholder')}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                {t('settings.confirmNewPassword')}
                            </label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder={t('settings.confirmNewPasswordPlaceholder')}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5"
                            >
                                {changingPassword ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {t('settings.changingPassword')}
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4 mr-2" />
                                        {t('settings.changePasswordAction')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
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

        </div>
    );
};

export default Settings;
