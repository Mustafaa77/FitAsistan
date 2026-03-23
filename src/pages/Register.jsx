import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { FaUserPlus, FaSpinner } from 'react-icons/fa';
import FormInput from '../components/FormInput';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const translateError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'Bu e-posta adresi zaten kullanımda.';
      case 'auth/invalid-email': return 'Geçersiz e-posta adresi.';
      case 'auth/weak-password': return 'Şifre çok zayıf (en az 6 karakter).';
      default: return 'Kayıt sırasında bir hata oluştu.';
    }
  };

  const isPasswordValid = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return pwd.length >= 8 && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.username.length < 3) {
      toast.error('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }
    if (!formData.email.includes('@')) {
      toast.error('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    if (!isPasswordValid(formData.password)) {
      toast.error('Şifre kriterleri karşılamıyor.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    const registerToast = toast.loading('Hesap oluşturuluyor...');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Profil güncelleme
      await updateProfile(userCredential.user, { displayName: formData.username });
      
      // E-posta doğrulama gönderimi
      await sendEmailVerification(userCredential.user);
      
      toast.success('Kayıt başarılı! Lütfen e-postanı doğrula.', { id: registerToast });
      navigate('/verify-email');
    } catch (err) {
      toast.error(translateError(err.code), { id: registerToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-4 rounded-full mb-4 text-green-600">
            <FaUserPlus size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Kayıt Ol</h1>
          <p className="text-gray-500 mt-2 text-center leading-relaxed">
            Sağlıklı bir hayata ilk adımı at ve <span className="text-green-600 font-semibold">FitAsistan</span> ailesine katıl!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <FormInput
            label="Kullanıcı Adı"
            type="text"
            name="username"
            placeholder="Adın Soyadın"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
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
          />

          <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="font-semibold mb-1 text-gray-700 underline">Şifre Kriterleri:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li className={formData.password.length >= 8 ? 'text-green-600 font-medium' : ''}>En az 8 karakter</li>
              <li className={/[A-Z]/.test(formData.password) ? 'text-green-600 font-medium' : ''}>Bir büyük harf</li>
              <li className={/[a-z]/.test(formData.password) ? 'text-green-600 font-medium' : ''}>Bir küçük harf</li>
              <li className={/[0-9]/.test(formData.password) ? 'text-green-600 font-medium' : ''}>Bir rakam</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all transform active:scale-95 flex items-center justify-center space-x-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700 hover:shadow-green-200 cursor-pointer'
            }`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <span>Hesabımı Oluştur</span>}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-green-600 font-bold hover:underline transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Register;
