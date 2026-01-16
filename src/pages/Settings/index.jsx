import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Lock, Save, Loader2, AlertCircle, Check, User } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { authService } from '@/services';
import { useAuth } from '@/hooks';

/**
 * Settings Page - Cài đặt tài khoản và quyền riêng tư
 */
const Settings = () => {
    const { user, refreshUser } = useAuth();

    // Form state
    const [settings, setSettings] = useState({
        full_name: '',
        consent_share_data: true
    });

    // UI state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load current settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await authService.getSettings();
                setSettings({
                    full_name: data.full_name || '',
                    consent_share_data: data.consent_share_data !== false // Default to true
                });
            } catch (err) {
                console.error('Load settings error:', err);
                setError('Không thể tải cài đặt');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Save settings
    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await authService.updateSettings({
                full_name: settings.full_name || null,
                consent_share_data: settings.consent_share_data
            });
            setSuccess('Đã lưu cài đặt thành công!');
            // Refresh user data in context
            if (refreshUser) {
                await refreshUser();
            }
        } catch (err) {
            console.error('Save settings error:', err);
            setError(err.response?.data?.detail || 'Lỗi lưu cài đặt');
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
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-blue-600" />
                    Cài đặt
                </h1>
                <p className="text-slate-500 mt-1">
                    Quản lý thông tin cá nhân và quyền riêng tư
                </p>
            </div>

            {/* Error/Success messages */}
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

            {/* Profile Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    Thông tin cá nhân
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            Email
                        </label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">Email không thể thay đổi</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            value={settings.full_name}
                            onChange={(e) => setSettings(s => ({ ...s, full_name: e.target.value }))}
                            placeholder="Nhập họ và tên..."
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            Vai trò
                        </label>
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${user?.role === 'admin'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                            {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-amber-600" />
                    Quyền riêng tư
                </h2>

                <div className="space-y-4">
                    {/* Consent Toggle */}
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-1">
                            <h3 className="font-medium text-slate-800">
                                Chia sẻ dữ liệu với quản trị viên
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Cho phép quản trị viên xem lịch sử tóm tắt của bạn để cải thiện hệ thống.
                                Nếu tắt, dữ liệu của bạn sẽ được bảo vệ và không xuất hiện trong các báo cáo
                                hoặc dataset export.
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

                    {/* Status indicator */}
                    <div className={`flex items-center gap-2 text-sm ${settings.consent_share_data
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                        }`}>
                        {settings.consent_share_data ? (
                            <>
                                <Check className="w-4 h-4" />
                                Dữ liệu của bạn có thể được sử dụng để cải thiện hệ thống
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Dữ liệu của bạn được bảo vệ
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Lưu cài đặt
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default Settings;
