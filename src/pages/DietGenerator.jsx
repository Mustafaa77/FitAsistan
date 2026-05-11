import React, { useState, useEffect } from 'react';
import { FaUtensils, FaFire, FaUser, FaRuler, FaWeight, FaWalking, FaBullseye, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { generateDietPlan, calculateDailyCalories } from '../services/aiService';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';

const DietGenerator = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    activityLevel: 'light',
    goal: 'maintenance'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [calorieInfo, setCalorieInfo] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);

  // Pre-fill form if profile exists
  useEffect(() => {
    if (!currentUser) return;
    const loadProfile = async () => {
      try {
        const profile = await supabaseService.getProfile(currentUser.uid);
        if (profile) {
          setFormData(prev => ({
            ...prev,
            age: profile.age || '',
            height: profile.height || '',
            weight: profile.current_weight || ''
          }));
        }
      } catch (e) {
        console.error('Profile load error:', e);
      }
    };
    loadProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    const { age, height, weight, gender, activityLevel, goal } = formData;
    
    if (!age || !height || !weight) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setIsLoading(true);
    setDietPlan(null);

    try {
      const calculatedCalories = calculateDailyCalories(
        parseFloat(weight),
        parseInt(height),
        parseInt(age),
        gender,
        activityLevel,
        goal
      );
      setCalorieInfo(calculatedCalories);

      const result = await generateDietPlan({
        age: parseInt(age),
        height: parseInt(height),
        weight: parseFloat(weight),
        gender,
        activityLevel,
        goal
      });

      setIsLoading(false); // Stop loading before success processing

      if (result.success && result.data) {
        // AI bazen 7 günden az dönebilir veya format hatalı olabilir, kontrol edelim
        if (!Array.isArray(result.data)) {
          throw new Error('AI yanıtı beklenen formatta değil.');
        }
        
        setDietPlan(result.data);
        
        // Save to Supabase
        await supabaseService.saveDietPlan(currentUser.uid, {
          plan: result.data,
          info: calculatedCalories,
          user: formData,
          tarih: new Date().toISOString()
        });

        // Also update profile calories target
        await supabaseService.updateProfile(currentUser.uid, {
          daily_calorie_target: calculatedCalories.target,
          age: parseInt(age),
          height: parseInt(height),
          current_weight: parseFloat(weight)
        });

        toast.success('Diyet planınız hazır ve kaydedildi!');
      } else {
        toast.error(result.error || 'Diyet oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Diet generation error:', error);
      setIsLoading(false);
      toast.error('AI şu an çok yoğun veya bir hata oluştu. Lütfen birazdan tekrar deneyin.');
    }
  };

  const resetForm = () => {
    setFormData({
      age: '',
      height: '',
      weight: '',
      gender: 'male',
      activityLevel: 'light',
      goal: 'maintenance'
    });
    setDietPlan(null);
    setCalorieInfo(null);
    setSelectedDay(0);
  };

  const goalLabels = {
    weightLoss: 'Kilo Verme',
    maintenance: 'Kilo Koruma',
    muscleGain: 'Kas Kazanımı'
  };

  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  return (
    <div className="min-h-full bg-gray-50 p-6 pb-safe">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <FaUtensils className="text-green-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-black text-gray-800">Diyet Oluşturucu</h1>
          <p className="text-gray-500 mt-2">Kişiselleştirilmiş haftalık diyet planı</p>
        </div>

        {!dietPlan ? (
          <form onSubmit={handleGenerate} className="bg-white rounded-3xl shadow-lg shadow-green-100/50 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaUser className="text-green-500" size={14} />
                  Yaş
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="10"
                  max="100"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaRuler className="text-green-500" size={14} />
                  Boy (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="175"
                  min="100"
                  max="250"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaWeight className="text-green-500" size={14} />
                Kilo (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="70"
                min="30"
                max="300"
                step="0.1"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                style={{ minHeight: '48px' }}
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaUser className="text-green-500" size={14} />
                Cinsiyet
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    formData.gender === 'male'
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Erkek
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    formData.gender === 'female'
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Kadın
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaWalking className="text-green-500" size={14} />
                Aktivite Seviyesi
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all cursor-pointer"
                style={{ minHeight: '48px' }}
              >
                <option value="sedentary">Hareketsiz (Ofis işi)</option>
                <option value="light">Hafif Aktif (1-3 gün/hafta)</option>
                <option value="moderate">Orta Aktif (3-5 gün/hafta)</option>
                <option value="active">Çok Aktif (6-7 gün/hafta)</option>
                <option value="extreme">Aşırı Aktif (2x günlük)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaBullseye className="text-green-500" size={14} />
                Hedef
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'weightLoss', label: 'Kilo Verme', icon: '📉' },
                  { value: 'maintenance', label: 'Koruma', icon: '⚖️' },
                  { value: 'muscleGain', label: 'Kas Kazanımı', icon: '💪' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, goal: item.value }))}
                    className={`py-3 px-2 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${
                      formData.goal === item.value
                        ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700 hover:shadow-green-200'
              }`}
              style={{ minHeight: '56px' }}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Diyet Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <FaUtensils />
                  <span>Diyet Planı Oluştur</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {calorieInfo && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaFire className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-green-100 text-sm">Günlük Kalori İhtiyacı</p>
                    <p className="text-3xl font-black">{calorieInfo.dailyCalories} kcal</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-green-100">BMR</p>
                    <p className="font-bold">{calorieInfo.bmr}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-green-100">TDEE</p>
                    <p className="font-bold">{calorieInfo.tdee}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-green-100">Hedef</p>
                    <p className="font-bold">{goalLabels[formData.goal]}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-2 shadow-lg overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {dayNames.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(index)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      selectedDay === index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {dietPlan[selectedDay] && (
              <div className="bg-white rounded-3xl shadow-lg shadow-green-100/50 overflow-hidden">
                <div className="bg-green-50 p-4 border-b border-green-100">
                  <h3 className="font-black text-gray-800 text-lg">{dayNames[selectedDay]}</h3>
                  <p className="text-green-600 text-sm font-medium">
                    Toplam: {dietPlan[selectedDay].totalCalories} kcal
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <MealCard
                    icon="🌅"
                    title="Kahvaltı"
                    meal={dietPlan[selectedDay].meals.breakfast}
                  />
                  <MealCard
                    icon="☀️"
                    title="Öğle Yemeği"
                    meal={dietPlan[selectedDay].meals.lunch}
                  />
                  <MealCard
                    icon="🌙"
                    title="Akşam Yemeği"
                    meal={dietPlan[selectedDay].meals.dinner}
                  />
                  <MealCard
                    icon="🍎"
                    title="Atıştırmalıklar"
                    meal={dietPlan[selectedDay].meals.snacks?.join(' • ') || 'İsteğe bağlı'}
                  />
                </div>
              </div>
            )}

            <button
              onClick={resetForm}
              className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              style={{ minHeight: '56px' }}
            >
              Yeni Diyet Oluştur
            </button>
          </div>
        )}

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 leading-relaxed">
            <span className="font-semibold">⚠️ Uyarı:</span> Bu diyet planı genel bilgilendirme amaçlıdır. 
            Herhangi bir diyet programına başlamadan önce bir sağlık uzmanına danışmanızı öneririz.
          </p>
        </div>
      </div>

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

const MealCard = ({ icon, title, meal }) => (
  <div className="bg-gray-50 rounded-2xl p-4">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <h4 className="font-bold text-gray-800">{title}</h4>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed pl-9">{meal}</p>
  </div>
);

export default DietGenerator;
