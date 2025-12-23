import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/authService';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send only username, email, password as requested
            // authService handles this payload
            await registerUser(formData);

            toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
            navigate('/login');
        } catch (err) {
            toast.error(err.message || "Kayıt başarısız. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Hesap Oluştur</h1>
                    <p className="text-white/80">Kullanıcı yönetimine başlamak için katılın</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">Kullanıcı Adı</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                placeholder="Kullanıcı adı seçin"
                                required
                                minLength={3}
                                maxLength={50}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-2">E-posta Adresi</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                placeholder="ornek@sirket.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-2">Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                placeholder="En az 6 karakter"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
                        {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />}
                    </button>
                </form>

                <div className="mt-6 text-center text-white/60 text-sm">
                    <p>Zaten bir hesabınız var mı? <Link to="/login" className="text-white font-medium hover:underline">Giriş Yap</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
