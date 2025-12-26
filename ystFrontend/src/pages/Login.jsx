import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (!username.trim() || !password.trim()) {
            toast.error('Lütfen kullanıcı adı ve şofrenizi giriniz.', { id: 'login-validation' });
            return;
        }

        try {
            setIsSubmitting(true);
            const success = await login(username, password);
            // With the change in AuthProvider, login now throws on failure.
            // But if it returns true (or valid data), we proceed. 
            // Wait, assuming login returns true on success as per previous code.
            if (success) {
                toast.success('Giriş başarılı!', { id: 'login-success' });
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Login caught error:", error);
            // Force Turkish messages for known status codes to avoid backend English messages
            if (error.status === 429) {
                toast.error('Çok fazla başarısız giriş denemesi. Lütfen bir süre bekleyiniz.', { id: 'login-error' });
            } else if (error.status === 401) {
                toast.error('Kullanıcı adı veya şifre hatalı.', { id: 'login-error' });
            } else {
                toast.error(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.', { id: 'login-error' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h1>
                    <p className="text-white/80">Panele erişmek için giriş yapın</p>
                </div>
                <div className="mt-6 text-center text-white/60 text-sm">
                    <p>Hesabınız yok mu? <Link to="/register" className="text-white font-medium hover:underline">Kayıt Ol</Link></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">Kullanıcı Adı</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                placeholder="Kullanıcı adınızı girin"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-lg hover:bg-white/90 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition flex items-center justify-center gap-2 group"
                    >
                        Giriş Yap
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
