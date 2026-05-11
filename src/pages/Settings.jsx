import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaTint, FaWeight, FaRuler, FaSave, FaArrowLeft, 
  FaCheckCircle, FaExclamationTriangle, FaSignOutAlt, 
  FaRunning, FaVenusMars, FaCalendarAlt 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';
import toast from 'react-hot-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [profileData, setProfileData] = useState({
    full_name: '',
    age: '',
    height: '',
    current_weight: '',
    target_weight: '',
    gender: 'male',
    activity_level: 'light',
    water_target: 2500
  });

  // Load initial value from Supabase
  useEffect(() => {
    if (!currentUser) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await supabaseService.getProfile(currentUser.uid);
        if (data) {
          setProfileData({
            full_name: data.full_name || currentUser.displayName || '',
            age: data.age || '',
            height: data.height || '',
            current_weight: data.current_weight || '',
            target_weight: data.target_weight || '',
            gender: data.gender || 'male',
            activity_level: data.activity_level || 'light',
            water_target: data.water_target || 2500
          });
        }
      } catch (error) {
        console.error('Profile load error:', error);
        toast.error('Profil yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await supabaseService.updateProfile(currentUser.uid, {
        ...profileData,
        age: parseInt(profileData.age),
        height: parseFloat(profileData.height),
        current_weight: parseFloat(profileData.current_weight),
        target_weight: parseFloat(profileData.target_weight),
        water_target: parseInt(profileData.water_target)
      });
      
      toast.success('Profil ve ayarlarınız başarıyla güncellendi!', {
        icon: <FaCheckCircle className="text-white" />,
        style: { borderRadius: '12px', background: '#16a34a', color: '#fff' }
      });
      
      // Redirect removed as per user request to see the changes
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error('Kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Çıkış yapmak istediğine emin misin?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        toast.error('Çıkış yapılamadı.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Ayarlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Profil ve Ayarlar</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
        >
          <FaSignOutAlt />
          <span>Çıkış Yap</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Info Section */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center space-x-4 border-b border-gray-50 pb-6">
            <div className="bg-green-50 p-4 rounded-2xl text-green-600 shadow-sm">
              <FaUser size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Kişisel Bilgiler</h2>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Temel Profil Verileri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Ad Soyad</label>
              <input
                type="text"
                name="full_name"
                value={profileData.full_name}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 font-semibold text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1 flex items-center gap-2">
                <FaCalendarAlt size={12} /> Yaş
              </label>
              <input
                type="number"
                name="age"
                value={profileData.age}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 font-semibold text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1 flex items-center gap-2">
                <FaVenusMars size={12} /> Cinsiyet
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setProfileData(prev => ({ ...prev, gender: g }))}
                    className={`py-4 rounded-2xl font-bold transition-all ${
                      profileData.gender === g 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {g === 'male' ? 'Erkek' : 'Kadın'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1 flex items-center gap-2">
                <FaRunning size={12} /> Aktivite Seviyesi
              </label>
              <select
                name="activity_level"
                value={profileData.activity_level}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 font-semibold text-gray-700 focus:outline-none focus:border-green-400 focus:bg-white transition-all appearance-none"
              >
                <option value="sedentary">Hareketsiz</option>
                <option value="light">Az Hareketli</option>
                <option value="moderate">Orta Hareketli</option>
                <option value="active">Çok Hareketli</option>
              </select>
            </div>
          </div>
        </section>

        {/* Physical Metrics Section */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center space-x-4 border-b border-gray-50 pb-6">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shadow-sm">
              <FaWeight size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Fiziksel Ölçüler</h2>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Hedef ve Mevcut Durum</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1 flex items-center gap-2">
                <FaRuler size={12} /> Boy (cm)
              </label>
              <input
                type="number"
                name="height"
                value={profileData.height}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 font-black text-xl text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1 flex items-center gap-2">
                <FaWeight size={12} /> Mevcut Kilo (kg)
              </label>
              <input
                type="number"
                name="current_weight"
                value={profileData.current_weight}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 font-black text-xl text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1 flex items-center gap-2 text-orange-600">
                <FaCheckCircle size={12} /> Hedef Kilo (kg)
              </label>
              <input
                type="number"
                name="target_weight"
                value={profileData.target_weight}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-black text-xl text-orange-600 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center space-x-4 border-b border-gray-50 pb-6">
            <div className="bg-cyan-50 p-4 rounded-2xl text-cyan-600 shadow-sm">
              <FaTint size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Günlük Hedefler</h2>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Su ve Kalori</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-600 ml-1">Günlük Su Hedefi (ml)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="water_target"
                  min="1000"
                  max="5000"
                  step="100"
                  value={profileData.water_target}
                  onChange={handleInputChange}
                  className="flex-1 h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="w-24 text-right font-black text-xl text-cyan-600">{profileData.water_target} ml</span>
              </div>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={isSaving}
          className={`w-full py-5 rounded-3xl font-black text-xl shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center space-x-3 ${
            isSaving 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-green-600 text-white hover:bg-green-700 shadow-green-100'
          }`}
          style={{ minHeight: '64px' }}
        >
          <FaSave />
          <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
        </button>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Settings;
