import { useState, useEffect } from 'react';
import { Users, Trash2, Search, Shield, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { adminService } from '@/services';
import { useAuth } from '@/hooks';
import { useTranslation } from 'react-i18next';

const UserManagement = () => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to load users:', err);
            setError(t('userMgmt.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = async () => {
        if (!deleteId) return;

        setDeleting(true);
        try {
            await adminService.deleteUser(deleteId);
            setUsers(prev => prev.filter(u => u.id !== deleteId));
            setDeleteId(null);
        } catch (err) {
            console.error('Delete user error:', err);
            alert(err.response?.data?.detail || t('userMgmt.deleteError'));
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        {t('userMgmt.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {t('userMgmt.subtitle')}
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('userMgmt.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                                <th className="px-6 py-4">{t('userMgmt.userCol')}</th>
                                <th className="px-6 py-4">{t('userMgmt.emailCol')}</th>
                                <th className="px-6 py-4">{t('userMgmt.roleCol')}</th>
                                <th className="px-6 py-4 text-center">{t('userMgmt.consentCol')}</th>
                                <th className="px-6 py-4 text-right">{t('userMgmt.actionsCol')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {u.full_name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                                                </div>
                                                <span className="font-medium text-slate-700">
                                                    {u.full_name || t('common.noName')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {u.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'admin'
                                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                }`}>
                                                {u.role === 'admin' ? t('common.admin') : t('common.user')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {u.consent_share_data ? (
                                                <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-xs">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    {t('common.allow')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs">
                                                    <X className="w-3 h-3 mr-1" />
                                                    {t('common.deny')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {currentUser?.id !== u.id && (
                                                <button
                                                    onClick={() => setDeleteId(u.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title={t('userMgmt.deleteUserTitle')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        {t('userMgmt.noUsers')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between">
                    <span>{t('userMgmt.totalUsers', { count: users.length })}</span>
                    <span>{t('userMgmt.showingUsers', { count: filteredUsers.length })}</span>
                </div>
            </div>

            {deleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold">{t('userMgmt.deleteTitle')}</h3>
                        </div>

                        <p className="text-slate-600 mb-6">
                            {t('userMgmt.deleteConfirm')}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                                disabled={deleting}
                            >
                                {t('userMgmt.cancelDelete')}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                                disabled={deleting}
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {deleting ? t('userMgmt.deleting') : t('userMgmt.deleteUser')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
