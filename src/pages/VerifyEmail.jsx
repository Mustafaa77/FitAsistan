import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth as firebaseAuth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import { FaEnvelope, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check verification status periodically
    const interval = setInterval(async () => {
      if (firebaseAuth.currentUser) {
        await firebaseAuth.currentUser.reload();
        if (firebaseAuth.currentUser.emailVerified) {
          clearInterval(interval);
          toast.success('E-posta başarıyla doğrulandı!');
          navigate('/dashboard');
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!firebaseAuth.currentUser) return;
    
    setLoading(true);
    try {
      await sendEmailVerification(firebaseAuth.currentUser);
      toast.success('Doğrulama e-postası tekrar gönderildi!');
    } catch (error) {
      toast.error('Gönderim sırasında hata oluştu. Lütfen biraz bekleyin.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-6 rounded-full mb-6 text-green-600">
            <FaEnvelope size={60} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">E-postanı Doğrula</h1>
          <p className="text-gray-500 mt-4 leading-relaxed">
            Harika! Kaydını tamamlamak için <span className="font-semibold text-gray-800">{currentUser?.email}</span> adresine gönderdiğimiz doğrulama linkine tıkla.
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-blue-700 text-sm">
          <p>E-postayı göremiyorsan lütfen "Spam" veya "Gereksiz" klasörlerini kontrol et.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 flex items-center justify-center space-x-3 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            <span>Yeniden Gönder</span>
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="text-gray-500 font-medium hover:text-green-600 transition-colors"
          >
            Giriş Sayfasına Dön
          </button>
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

export default VerifyEmail;
