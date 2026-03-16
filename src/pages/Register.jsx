import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { FaUserPlus, FaSpinner } from 'react-icons/fa';
import FormInput from '../components/FormInput';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const translateError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda.';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi.';
      case 'auth/operation-not-allowed':
        return 'E-posta/şifre girişi etkin değil.';
      case 'auth/weak-password':
        return 'Şifre çok zayıf.';
      default:
        return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  };

  const isPasswordValid = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return pwd.length >= 8 && hasUpperCase && hasLowerCase && hasNumber;
  };

  const isFormValid =
    formData.username.length >= 3 &&
    formData.email.includes('@') &&
    isPasswordValid(formData.password) &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Using mock createUserWithEmailAndPassword from our firebase.js
      const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
      await auth.updateProfile(userCredential.user, { displayName: formData.username });
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/login'), 2000);
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
            <FaUserPlus className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Kayıt Ol</h1>
          <p className="text-gray-500 mt-2">Sağlıklı bir hayata ilk adımı at!</p>
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <FormInput
            label="Kullanıcı Adı"
            type="text"
            name="username"
            placeholder="Kullanıcı Adı"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
            minLength={3}
          />

          <FormInput
            label="E-posta"
            type="email"
            name="email"
            placeholder="ornek@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <FormInput
            label="Şifre"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          <FormInput
            label="Şifre Onay"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
            error={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword ? "Şifreler eşleşmiyor" : ""}
          />

          <div className="text-xs text-gray-500 space-y-1">
            <p>Şifre en az 8 karakter olmalı, en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.</p>
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
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <span>Kayıt Ol</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
