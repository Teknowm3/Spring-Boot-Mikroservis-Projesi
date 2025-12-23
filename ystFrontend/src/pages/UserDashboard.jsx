import React, { useEffect, useState } from 'react';
import { getMe, updateUser } from '../api/userService';
import { User, Mail, Shield, Phone, MapPin, Edit2, X, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getMe();
            setProfile(data);
            setEditForm({
                id: data.id,
                username: data.username || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || ''
            });
        } catch (err) {
            console.error("Failed to fetch profile", err);
            setError("Profil bilgileri yüklenemedi.");
            toast.error("Profil yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateUser(editForm.id, editForm);

            // Backend might return the updated object or a wrapper
            setProfile({ ...profile, ...editForm });
            setIsEditing(false);
            toast.success("Profil başarıyla güncellendi!");
        } catch (err) {
            console.error("Failed to update profile", err);
            toast.error("Profil güncellenemedi.");
        }
    };

    const handleLogout = () => {
        logout();
        toast.success("Çıkış yapıldı.");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center shadow-lg border border-red-100 max-w-md">
                    <p className="text-lg font-medium mb-2">{error}</p>
                    <button onClick={fetchProfile} className="text-indigo-600 hover:text-indigo-800 font-medium underline">Tekrar Dene</button>
                    <button onClick={handleLogout} className="block mt-4 text-sm text-gray-500 hover:text-gray-700 w-full">Çıkış Yap</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition shadow-sm"
                    >
                        <LogOut className="h-5 w-5" />
                        Çıkış Yap
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-6 sm:p-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-10 border-b border-gray-100">
                            <div className="bg-indigo-100 p-6 rounded-full ring-4 ring-indigo-50">
                                <User className="h-16 w-16 text-indigo-600" />
                            </div>
                            <div className="text-center sm:text-left flex-1">
                                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                                    {(profile?.firstName && profile?.lastName) ? `${profile.firstName} ${profile.lastName}` : (profile?.username || 'Kullanıcı')}
                                </h2>
                                <p className="text-indigo-600 font-medium text-lg mb-4">@{profile?.username}</p>
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${profile?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                    {profile?.roles && profile.roles.length > 0 ? profile.roles.join(', ').replace('ROLE_', '') : (profile?.role || "KULLANICI")}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5"
                            >
                                <Edit2 className="h-5 w-5" />
                                Profili Düzenle
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="p-5 bg-gray-50 rounded-xl transition hover:bg-gray-100">
                                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                                        <Mail className="h-5 w-5 text-indigo-500" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">E-posta</span>
                                    </div>
                                    <p className="text-lg font-medium text-gray-900 pl-8">{profile?.email}</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-xl transition hover:bg-gray-100">
                                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                                        <Phone className="h-5 w-5 text-indigo-500" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Telefon</span>
                                    </div>
                                    <p className="text-lg font-medium text-gray-900 pl-8">{profile?.phone || 'Girilmedi'}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="p-5 bg-gray-50 rounded-xl transition hover:bg-gray-100 h-full">
                                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                                        <MapPin className="h-5 w-5 text-indigo-500" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Adres</span>
                                    </div>
                                    <p className="text-lg font-medium text-gray-900 pl-8 leading-relaxed">{profile?.address || 'Girilmedi'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800">Profili Düzenle</h3>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-100">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ad</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Soyad</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefon</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adres</label>
                                <textarea
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white min-h-[100px]"
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-4 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition font-semibold"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-lg shadow-indigo-500/30"
                                >
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
