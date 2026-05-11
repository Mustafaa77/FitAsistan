import React, { useState, useEffect } from 'react';
import { 
  FaTint, FaMoon, FaPlus, FaSave, FaChartLine, 
  FaCalendarAlt, FaCheckCircle, FaHistory, FaClock, FaFire
} from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';

/**
 * HealthDiary Component - Week 9 Implementation
 * Migrated from localStorage to Supabase
 */
const HealthDiary = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('water');
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  // --- STATES ---
  const [waterAmount, setWaterAmount] = useState(0);
  const [waterTarget, setWaterTarget] = useState(2500);
  const [calorieAmount, setCalorieAmount] = useState(0);
  const [calorieTarget, setCalorieTarget] = useState(2100);
  const [calorieInput, setCalorieInput] = useState('');
  const [sleepDate, setSleepDate] = useState(new Date().toISOString().split('T')[0]);
  const [sleepHours, setSleepHours] = useState('');
  const [sleepHistory, setSleepHistory] = useState([]);
  const [selectedMood, setSelectedMood] = useState('😐');
  const [dailyNote, setDailyNote] = useState('');

  const moods = [
    { emoji: '😴', label: 'Yorgun' },
    { emoji: '😰', label: 'Stresli' },
    { emoji: '😐', label: 'Normal' },
    { emoji: '😊', label: 'İyi' },
    { emoji: '⚡', label: 'Enerjik' }
  ];

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!currentUser) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [profile, water, healthLog, sleepLogs, calorieLog, activePlan] = await Promise.all([
          supabaseService.getProfile(currentUser.uid),
          supabaseService.getWaterLogs(currentUser.uid, today),
          supabaseService.getHealthLog(currentUser.uid, today),
          supabaseService.getSleepLogs(currentUser.uid),
          supabaseService.getCalorieLog(currentUser.uid, today),
          supabaseService.getActiveDietPlan(currentUser.uid)
        ]);

        if (profile) setWaterTarget(profile.water_target || 2500);
        if (water) setWaterAmount(water.amount || 0);
        if (calorieLog) setCalorieAmount(calorieLog.amount || 0);
        
        // Calorie target from active plan or profile
        const target = activePlan?.plan_data?.info?.dailyCalories || profile?.daily_calorie_target || 2100;
        setCalorieTarget(target);

        if (healthLog) {
          setSelectedMood(healthLog.mood || '😐');
          setDailyNote(healthLog.note || '');
        }
        if (sleepLogs) {
          // Format for chart
          const formattedSleep = sleepLogs.map(s => ({
            ...s,
            displayDate: new Date(s.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
          })).reverse();
          setSleepHistory(formattedSleep);
        }
      } catch (error) {
        console.error('HealthDiary fetch error:', error);
        toast.error('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentUser, today]);

  // --- ACTIONS ---
  const addWater = async (ml) => {
    const newAmount = waterAmount + ml;
    setWaterAmount(newAmount);
    
    try {
      await supabaseService.updateWaterLog(currentUser.uid, today, newAmount);
      
      if (newAmount >= waterTarget && waterAmount < waterTarget) {
        toast.success('Harika! Günlük su hedefine ulaştın!', { icon: '💧' });
      } else {
        toast.success(`${ml}ml eklendi`, { duration: 1000, icon: '💧' });
      }
    } catch (error) {
      toast.error('Su verisi kaydedilemedi.');
    }
  };

  const addCalories = async (e) => {
    e.preventDefault();
    const amountToAdd = parseInt(calorieInput);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      toast.error('Lütfen geçerli bir kalori miktarı girin.');
      return;
    }

    const newAmount = calorieAmount + amountToAdd;
    setCalorieAmount(newAmount);
    setCalorieInput('');

    try {
      await supabaseService.updateCalorieLog(currentUser.uid, today, newAmount);
      toast.success(`${amountToAdd} kcal eklendi`, { icon: '🔥' });
    } catch (error) {
      toast.error('Kalori verisi kaydedilemedi.');
    }
  };

  const handleMoodSave = async () => {
    try {
      await supabaseService.updateHealthLog(currentUser.uid, today, {
        mood: selectedMood,
        note: dailyNote
      });
      toast.success('Duygu durumu ve notunuz kaydedildi!');
    } catch (error) {
      toast.error('Kaydedilirken bir hata oluştu.');
    }
  };

  const handleSleepSubmit = async (e) => {
    e.preventDefault();
    const hours = parseFloat(sleepHours);

    if (!sleepDate || sleepDate > today) {
      toast.error('Geçerli bir tarih seçmelisiniz.');
      return;
    }
    if (isNaN(hours) || hours < 0 || hours > 24) {
      toast.error('Lütfen 0-24 arası geçerli bir uyku süresi girin.');
      return;
    }

    try {
      const selectedDateObj = new Date(sleepDate);
      const isoDate = selectedDateObj.toISOString().split('T')[0];
      
      await supabaseService.addSleepLog(currentUser.uid, isoDate, hours);
      
      // Refresh sleep history
      const sleepLogs = await supabaseService.getSleepLogs(currentUser.uid);
      const formattedSleep = sleepLogs.map(s => ({
        ...s,
        displayDate: new Date(s.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      })).reverse();
      
      setSleepHistory(formattedSleep);
      setSleepHours('');
      toast.success('Uyku verisi başarıyla eklendi!');
    } catch (error) {
      console.error('Sleep log error:', error);
      toast.error('Uyku verisi kaydedilemedi.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Günlük verileri yükleniyor...</p>
      </div>
    );
  }
  
  const waterPercentage = Math.min(100, (waterAmount / waterTarget) * 100);
  const isTargetMet = waterAmount >= waterTarget;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 safe-area-inset-bottom animate-fade-in">
      
      {/* Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-10 mx-2">
        <button 
          onClick={() => setActiveTab('water')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all duration-300 min-h-[44px] ${
            activeTab === 'water' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <FaTint className={activeTab === 'water' ? 'animate-bounce' : ''} />
          <span>Su Takibi</span>
        </button>
        <button 
          onClick={() => setActiveTab('sleep')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all duration-300 min-h-[44px] ${
            activeTab === 'sleep' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <FaMoon className={activeTab === 'sleep' ? 'animate-pulse' : ''} />
          <span>Uyku Takibi</span>
        </button>
      </div>

      {activeTab === 'water' ? (
        <div className="space-y-6 px-4">
          {/* Water Tracker Section */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">Su Takibi</h2>
                <p className="text-gray-400 text-sm font-medium">Günlük hedefine ulaşmak için su içmeyi unutma!</p>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl text-green-600 shadow-sm">
                <FaTint size={32} />
              </div>
            </div>

            {/* Circular Progress (Simplified for UI) */}
            <div className="relative flex items-center justify-center py-4">
              <div className="w-48 h-48 rounded-full border-[12px] border-gray-50 flex items-center justify-center relative overflow-hidden shadow-inner">
                {/* Progress Fill */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500/20 to-green-600/30 transition-all duration-1000 ease-out"
                  style={{ height: `${waterPercentage}%` }}
                />
                <div className="relative z-10 text-center">
                  <span className="text-4xl font-black text-green-600">{(waterAmount/1000).toFixed(1)}</span>
                  <span className="text-gray-400 font-bold ml-1 text-lg">/ {(waterTarget/1000).toFixed(1)}L</span>
                </div>
              </div>
            </div>

            {/* Aesthetic Drop-shaped Buttons */}
            <div className="grid grid-cols-2 gap-6">
              <button 
                onClick={() => addWater(200)}
                className="group relative flex flex-col items-center justify-center p-6 bg-white border-2 border-green-100 rounded-[2.5rem] rounded-tl-none transition-all active:scale-90 hover:border-green-300 hover:shadow-xl min-h-[120px]"
                style={{ borderTopLeftRadius: '0.5rem' }} // Making it slightly drop-like
              >
                <div className="absolute -top-3 -left-3 bg-green-500 text-white p-2 rounded-full shadow-lg group-hover:rotate-12 transition-transform">
                  <FaPlus size={16} />
                </div>
                <FaTint className="text-green-500 mb-2 group-hover:scale-125 transition-transform" size={32} />
                <span className="text-green-800 font-black text-xl">200ml</span>
              </button>
              
              <button 
                onClick={() => addWater(500)}
                className="group relative flex flex-col items-center justify-center p-6 bg-green-600 border-2 border-green-600 rounded-[2.5rem] rounded-tr-none transition-all active:scale-90 hover:shadow-xl hover:shadow-green-100 min-h-[120px]"
                style={{ borderTopRightRadius: '0.5rem' }} // Making it slightly drop-like
              >
                <div className="absolute -top-3 -right-3 bg-white text-green-600 p-2 rounded-full shadow-lg group-hover:-rotate-12 transition-transform border border-green-600">
                  <FaPlus size={16} />
                </div>
                <FaTint className="text-white mb-2 group-hover:scale-125 transition-transform" size={40} />
                <span className="text-white font-black text-2xl">500ml</span>
              </button>
            </div>
          </div>

          {/* Calorie Tracking Section - NEW */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">Kalori Takibi</h2>
                <p className="text-gray-400 text-sm font-medium">Yediklerini kaydederek hedefine sadık kal.</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl text-orange-600 shadow-sm">
                <FaFire size={32} />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-gray-500 font-black uppercase text-xs tracking-widest">Günlük İlerleme</span>
                <span className="text-orange-600 font-black text-xl">{calorieAmount} / {calorieTarget} kcal</span>
              </div>
              <div className="h-6 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 p-1">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${Math.min(100, (calorieAmount / calorieTarget) * 100)}%` }}
                />
              </div>
            </div>

            {/* Quick Calorie Add */}
            <form onSubmit={addCalories} className="flex gap-4">
              <input 
                type="number"
                value={calorieInput}
                onChange={(e) => setCalorieInput(e.target.value)}
                placeholder="Örn: 350 kcal"
                className="flex-1 h-16 px-6 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 focus:bg-white outline-none transition-all font-black text-gray-700 text-lg shadow-inner"
              />
              <button 
                type="submit"
                className="bg-orange-600 text-white p-5 rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center min-w-[64px]"
              >
                <FaPlus size={24} />
              </button>
            </form>
          </div>

          {/* Mood & Journal Section */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-6">Nasıl Hissediyorsun?</h2>
              
              {/* Emoji Selector */}
              <div className="flex justify-between items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                {moods.map((m) => (
                  <button
                    key={m.emoji}
                    onClick={() => setSelectedMood(m.emoji)}
                    className={`flex-1 min-w-[70px] min-h-[70px] flex flex-col items-center justify-center rounded-2xl transition-all duration-300 border-2 ${
                      selectedMood === m.emoji 
                      ? 'bg-green-500 text-white border-green-500 shadow-lg scale-110' 
                      : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-3xl mb-1">{m.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note Area */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Günün Notu</label>
              <textarea 
                value={dailyNote}
                onChange={(e) => setDailyNote(e.target.value)}
                placeholder="Bugün nasıldı? Kendini nasıl hissediyorsun? Notlarını buraya ekle..."
                className="w-full p-5 bg-gray-50 border-2 border-gray-50 rounded-3xl min-h-[150px] focus:ring-4 focus:ring-green-100 focus:border-green-500 focus:bg-white outline-none transition-all resize-none text-gray-700 font-medium text-lg shadow-inner"
              />
            </div>

            <button 
              onClick={handleMoodSave}
              className="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center space-x-3 min-h-[60px]"
            >
              <FaSave size={20} />
              <span className="text-lg uppercase tracking-wide">Günlüğü Kaydet</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 px-4">
          {/* Sleep Form - Styled like BMICalculator tracker form */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
            <h2 className="text-3xl font-black text-gray-800 mb-8">Uyku Verisi Gir</h2>
            <form onSubmit={handleSleepSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FaCalendarAlt className="text-green-600" />
                    Tarih Seçimi
                  </label>
                  <input 
                    type="date" 
                    max={today}
                    value={sleepDate}
                    onChange={(e) => setSleepDate(e.target.value)}
                    className="w-full h-14 px-5 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FaClock className="text-green-600" />
                    Uyku Süresi (Saat)
                  </label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="Örn: 7.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="w-full h-14 px-5 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full h-14 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center space-x-3"
              >
                <FaPlus size={20} />
                <span className="text-lg uppercase tracking-wide">Uyku Verisi Ekle</span>
              </button>
            </form>
          </div>

          {/* Sleep Trend Chart */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-800 flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-2xl">
                  <FaChartLine className="text-green-600" />
                </div>
                <span>7 Günlük Trend</span>
              </h2>
              {sleepHistory.length > 0 && (
                <div className="bg-green-50 px-4 py-2 rounded-full text-green-700 font-bold text-sm">
                  Ortalama: {(sleepHistory.reduce((acc, curr) => acc + curr.hours, 0) / sleepHistory.length).toFixed(1)} sa
                </div>
              )}
            </div>
            
            <div className="h-72 w-full">
              {sleepHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sleepHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="displayDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                      domain={[0, 'auto']}
                      dx={-5}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#16a34a', strokeWidth: 2, strokeDasharray: '5 5' }}
                      contentStyle={{
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                        padding: '12px 16px'
                      }}
                      itemStyle={{ fontWeight: 'bold', color: '#16a34a' }}
                      labelStyle={{ fontWeight: 'black', marginBottom: '4px', color: '#1e293b' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      name="Uyku (Saat)"
                      stroke="#16a34a" 
                      strokeWidth={5} 
                      dot={{ r: 8, fill: '#16a34a', strokeWidth: 3, stroke: '#fff' }}
                      activeDot={{ r: 10, fill: '#16a34a', strokeWidth: 4, stroke: '#fff' }}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-6">
                  <div className="bg-gray-50 p-10 rounded-full border-2 border-dashed border-gray-200">
                    <FaMoon size={48} className="opacity-20" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-500">Henüz veri yok</p>
                    <p className="text-sm font-medium">Trendi görmek için uyku verisi eklemeye başla.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for Animations and Layout */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          background-color: #16a34a;
          padding: 5px;
          border-radius: 8px;
          cursor: pointer;
          filter: invert(1);
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in, .transition-all, .group-hover\:scale-125, .animate-bounce, .animate-pulse {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HealthDiary;
