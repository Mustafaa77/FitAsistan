import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { FaLeaf, FaSpinner } from 'react-icons/fa';
import FormInput from '../components/FormInput';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const translateError = (code) => {
    switch (code) {
      case 'auth/user-not-found': return 'Kullanıcı bulunamadı.';
      case 'auth/wrong-password': return 'Hatalı şifre.';
      case 'auth/invalid-email': return 'Geçersiz e-posta adresi.';
      case 'auth/user-disabled': return 'Kullanıcı hesabı devre dışı bırakılmış.';
      case 'auth/too-many-requests': return 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
      case 'auth/invalid-credential': return 'E-posta veya şifre hatalı.';
      default: return 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.includes('@')) {
      toast.error('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    const loginToast = toast.loading('Giriş yapılıyor...');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        toast.dismiss(loginToast);
        toast.error('Lütfen önce e-postanızı doğrulayın!');
        navigate('/verify-email');
        return;
      }

      toast.success('Hoş geldiniz!', { id: loginToast });
      navigate('/dashboard');
    } catch (err) {
      toast.error(translateError(err.code), { id: loginToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <FaLeaf className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">FitAsistan</h1>
          <p className="text-gray-500 mt-2">Sağlıklı yaşama tekrar hoş geldin!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <FormInput
            label="E-posta"
            type="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-1">
            <FormInput
              label="Şifre"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-green-600 transition-colors">Beni Hatırla</span>
            </label>
            <Link to="/forgot-password" size="sm" className="text-sm text-green-600 font-semibold hover:underline">
              Şifremi Unuttum
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all transform active:scale-95 flex items-center justify-center space-x-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700 hover:shadow-green-200 cursor-pointer'
            }`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <span>Güvenli Giriş Yap</span>}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-green-600 font-bold hover:underline">
              Hemen Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
