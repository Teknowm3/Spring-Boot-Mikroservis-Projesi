import React, { useState, useEffect } from 'react';
import { getUsers, getMe, createUser, updateUser, deleteUser, updateUserRole } from '../api/userService';
import { Users, User, Mail, Phone, MapPin, LogOut, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user, logout } = useAuth();

    const isSuperUser = (user?.username || '').toLowerCase() === 'admin';

    const [adminProfile, setAdminProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({
        id: '',
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        role: 'USER'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!user?.username) return;

        fetchUsers();

        if (isSuperUser) {
            setAdminProfile({ username: user?.username });
            setProfileForm((prev) => ({ ...prev, username: user?.username || '' }));
            setProfileError(null);
            setProfileLoading(false);
            return;
        }

        fetchAdminProfile();
    }, [user?.username]);

    const fetchAdminProfile = async () => {
        try {
            const data = await getMe();
            setAdminProfile(data);
            setProfileForm({
                id: data?.id,
                username: user?.username || data?.username || '',
                firstName: data?.firstName || '',
                lastName: data?.lastName || '',
                email: data?.email || '',
                phone: data?.phone || '',
                address: data?.address || ''
            });
            setProfileError(null);
        } catch (err) {
            console.error('Failed to fetch admin profile', err);
            setProfileError('Profil bilgileri yüklenemedi.');
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            console.log("Users API Response:", data);
            if (Array.isArray(data)) {
                setUsers(data);
            } else if (data.content && Array.isArray(data.content)) {
                setUsers(data.content);
            } else if (data.users && Array.isArray(data.users)) {
                setUsers(data.users);
            } else {
                console.warn("Unexpected users data format:", data);
                setUsers([]);
            }
            setError(null);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError("Kullanıcılar yüklenemedi. API'nin çalıştığından emin olun.");
            toast.error("Kullanıcı listesi alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdminProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            if (isSuperUser) {
                toast.error('Bu hesap için profil güncelleme kapalı.');
                return;
            }
            if (!profileForm.id) {
                toast.error('Profil güncellenemedi (kullanıcı ID bulunamadı).');
                return;
            }
            await updateUser(profileForm.id, profileForm);
            setAdminProfile((prev) => ({ ...prev, ...profileForm }));
            fetchUsers();
            setIsProfileModalOpen(false);
            toast.success('Profil başarıyla güncellendi!');
        } catch (err) {
            console.error('Failed to update admin profile', err);
            toast.error('Profil güncellenemedi.');
        }
    };

    const handleLogout = () => {
        logout();
        toast.success("Çıkış yapıldı.");
    };

    const handleAddUser = () => {
        setCurrentUser({
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            address: '',
            role: 'USER'
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setCurrentUser({
            id: user.id,
            username: user.username || '',
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            address: user.address || '',
            role: user.roles && user.roles.includes('ROLE_ADMIN') ? 'ADMIN' : (user.role || 'USER'),
            originalRole: user.roles && user.roles.includes('ROLE_ADMIN') ? 'ADMIN' : (user.role || 'USER')
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (username) => {
        if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteUser(username);
                setUsers(users.filter(u => u.username !== username));
                toast.success("Kullanıcı başarıyla silindi.");
            } catch (err) {
                console.error("Failed to delete user", err);
                toast.error("Kullanıcı silinemedi.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                if (currentUser.role !== currentUser.originalRole) {
                    await updateUserRole(currentUser.username, currentUser.role);
                }

                // Remove temporary internal fields before sending
                const { originalRole, role, ...profileData } = currentUser;

                await updateUser(currentUser.id, profileData);

                fetchUsers();
                toast.success("Kullanıcı güncellendi.");
            } else {
                await createUser(currentUser);
                fetchUsers();
                toast.success("Kullanıcı oluşturuldu.");
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save user", err);
            toast.error("Değişiklikler kaydedilemedi.");
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (user.username && user.username.toLowerCase().includes(searchLower)) ||
            (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
            (user.email && user.email.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-indigo-700 text-white fixed md:static inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-8 w-8" />
                        AdminPanel
                    </h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/80 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <nav className="mt-6">
                    <button
                        onClick={() => fetchUsers()}
                        className="w-full flex items-center gap-3 px-6 py-3 bg-indigo-800 text-white border-r-4 border-pink-500 hover:bg-indigo-900 transition text-left"
                    >
                        <Users className="h-5 w-5" />
                        Tüm Kullanıcılar
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                    <div className="md:hidden">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-indigo-700 focus:outline-none">
                            <Users className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex-1 max-w-xl mx-auto md:mx-0 md:ml-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Kullanıcı Ara..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 font-medium hidden sm:block">{user?.name || user?.username}</span>
                        <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 transition" title="Çıkış Yap">
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 overflow-auto bg-gray-50 flex-1">
                    {profileLoading ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-700"></div>
                                <div className="text-gray-600 font-medium">Profil yükleniyor...</div>
                            </div>
                        </div>
                    ) : profileError ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm border border-red-100 mb-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>{profileError}</div>
                                <button onClick={fetchAdminProfile} className="text-indigo-600 hover:underline font-medium">Tekrar Dene</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-100 p-4 rounded-full">
                                        <User className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">
                                            {(adminProfile?.firstName || adminProfile?.lastName)
                                                ? `${adminProfile?.firstName || ''} ${adminProfile?.lastName || ''}`.trim()
                                                : ((user?.username || adminProfile?.username) || 'Admin')}
                                        </div>
                                        <div className="text-indigo-600 font-medium">@{user?.username || adminProfile?.username}</div>
                                        {isSuperUser && (
                                            <div className="text-sm text-gray-500 mt-1">Superuser hesabı (profil verisi tutulmuyor).</div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
                                            <Mail className="h-4 w-4 text-indigo-500" />
                                            E-posta
                                        </div>
                                        <div className="text-gray-900 font-medium mt-1 break-all">{adminProfile?.email || '-'}</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
                                            <Phone className="h-4 w-4 text-indigo-500" />
                                            Telefon
                                        </div>
                                        <div className="text-gray-900 font-medium mt-1">{adminProfile?.phone || 'Girilmedi'}</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
                                            <MapPin className="h-4 w-4 text-indigo-500" />
                                            Adres
                                        </div>
                                        <div className="text-gray-900 font-medium mt-1">{adminProfile?.address || 'Girilmedi'}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => !isSuperUser && setIsProfileModalOpen(true)}
                                    disabled={isSuperUser}
                                    className={`${isSuperUser ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'} px-4 py-2 rounded-lg flex items-center gap-2 transition`}
                                >
                                    <Edit2 className="h-5 w-5" />
                                    Profili Düzenle
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Tüm Kullanıcılar</h1>
                        <button
                            onClick={handleAddUser}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30"
                        >
                            <Plus className="h-5 w-5" />
                            <span className="hidden sm:inline">Kullanıcı Ekle</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center shadow-sm border border-red-100">
                            <p>{error}</p>
                            <button onClick={fetchUsers} className="mt-2 text-indigo-600 hover:underline">Tekrar Dene</button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Kullanıcı Adı</th>
                                            <th className="px-6 py-4">Ad Soyad</th>
                                            <th className="px-6 py-4">E-posta</th>
                                            <th className="px-6 py-4">Rol</th>
                                            <th className="px-6 py-4 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {(user.firstName || user.lastName) ? `${user.firstName || ''} ${user.lastName || ''}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-3 py-1 text-xs rounded-full ${user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ADMIN') || user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {user.roles && user.roles.length > 0 ? user.roles.join(', ').replace('ROLE_', '') : (user.role || "-")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleEditUser(user)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(user.username)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Kullanıcı bulunamadı.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={currentUser.username}
                                    onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                                />
                            </div>

                            {!isEditing && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={currentUser.password}
                                        onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Şifre en az 6 karakter olmalıdır.</p>
                                </div>
                            )}
                            {isEditing && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={currentUser.firstName}
                                                onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={currentUser.lastName}
                                                onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={currentUser.phone}
                                            onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={currentUser.address}
                                            onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={currentUser.email}
                                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={currentUser.role}
                                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-500/30"
                                >
                                    {isEditing ? 'Değişiklikleri Kaydet' : 'Kullanıcı Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isProfileModalOpen && !isSuperUser && (
                <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800">Profili Düzenle</h3>
                            <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-100">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAdminProfileUpdate} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ad</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                        value={profileForm.firstName}
                                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Soyad</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                        value={profileForm.lastName}
                                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    required
                                    disabled
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                    value={profileForm.username}
                                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-posta</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefon</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adres</label>
                                <textarea
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white min-h-[100px]"
                                    value={profileForm.address}
                                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileModalOpen(false)}
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

export default AdminDashboard;
