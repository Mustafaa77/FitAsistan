import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { FaLeaf, FaSpinner } from 'react-icons/fa';
import FormInput from '../components/FormInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const translateError = (code) => {
    switch (code) {
      case 'auth/user-not-found':
        return 'Kullanıcı bulunamadı.';
      case 'auth/wrong-password':
        return 'Hatalı şifre.';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi.';
      case 'auth/user-disabled':
        return 'Kullanıcı hesabı devre dışı bırakılmış.';
      case 'auth/too-many-requests':
        return 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
      default:
        return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  };

  const isFormValid = email.includes('@') && password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Using mock signInWithEmailAndPassword from our firebase.js
      await auth.signInWithEmailAndPassword(email, password);
      setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <FaLeaf className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">FitAsistan</h1>
          <p className="text-gray-500 mt-2">Tekrar hoş geldin!</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-sm rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <FormInput
            label="E-posta"
            type="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormInput
            label="Şifre"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-600">Beni Hatırla</span>
            </label>
            <Link to="/forgot-password" size="sm" className="text-sm text-green-600 hover:underline">
              Şifremi Unuttum
            </Link>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-200 transition-all transform active:scale-95 flex items-center justify-center space-x-2 ${
              (!isFormValid || loading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              <span>Giriş Yap</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-green-600 font-semibold hover:underline">
              Hemen Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
