import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaTint, FaFire, FaPlus, FaUtensils, FaRobot, FaLeaf, 
  FaArrowRight, FaChartPie, FaWeight, FaRunning 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
import toast from 'react-hot-toast';
import TargetTracking from '../components/TargetTracking';

/**
 * Silicon Valley Standard Dashboard
 * High-end UI with real-time Supabase integration
 */
const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // States for data
  const [waterData, setWaterData] = useState({ current: 0, target: 2500 });
  const [calories, setCalories] = useState({ current: 0, target: 2100 });
  const [activePlan, setActivePlan] = useState(null);
  const [weightInfo, setWeightInfo] = useState({ current: null, target: null });

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        // Fetch everything in parallel for speed
        const [profile, water, dietPlan, weightHistory, calorieLog] = await Promise.all([
          supabaseService.getProfile(currentUser.uid),
          supabaseService.getWaterLogs(currentUser.uid, today),
          supabaseService.getActiveDietPlan(currentUser.uid),
          supabaseService.getWeightHistory(currentUser.uid, 1),
          supabaseService.getCalorieLog(currentUser.uid, today)
        ]);

        // Update Water
        setWaterData({
          current: water?.amount || 0,
          target: profile?.water_target || 2500
        });

        // Update Weight
        setWeightInfo({
          current: weightHistory?.[0]?.weight || profile?.current_weight || '-',
          target: profile?.target_weight || '-'
        });

        // Update Active Diet Plan
        setActivePlan(dietPlan);

        // Calorie target logic (can be expanded later with diet plan data)
        const dailyTarget = dietPlan?.plan_data?.info?.dailyCalories || profile?.daily_calorie_target || 2100;
        setCalories({
          current: calorieLog?.amount || 0,
          target: dailyTarget
        });

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        // Fallback to localStorage if Supabase fails (optional transition period)
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      const today = new Date().toISOString().split('T')[0];
      const savedWater = localStorage.getItem('suVerileri');
      const savedTarget = localStorage.getItem('suHedefi');
      if (savedTarget) setWaterData(prev => ({ ...prev, target: parseInt(savedTarget) }));
      if (savedWater) {
        const parsed = JSON.parse(savedWater);
        const todayData = parsed.find(d => d.date === today);
        if (todayData) setWaterData(prev => ({ ...prev, current: todayData.amount }));
      }
    };

    fetchData();
  }, [currentUser]);

  const waterProgress = (waterData.current / waterData.target) * 100;
  const calorieProgress = (calories.current / calories.target) * 100;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-fade-in">
      
      {/* Premium Welcome Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-green-200">
        <div className="relative z-10 md:flex md:items-center md:justify-between">
          <div className="max-w-lg">
            <span className="inline-block px-4 py-1.5 bg-green-500/30 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase mb-4">
              Günlük Özet
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              Selam, {currentUser?.displayName?.split(' ')[0] || 'Şampiyon'}! 👋
            </h1>
            <p className="text-green-50 text-lg opacity-90 leading-relaxed">
              Bugün hedeflerine ulaşmak için harika bir gün. Senin için hazırladığımız verilere bir göz atalım.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-lg">
                  <FaWeight size={24} />
                </div>
                <div>
                  <p className="text-xs text-green-200 font-bold uppercase tracking-widest">Şu Anki Kilo</p>
                  <p className="text-2xl font-black">{weightInfo.current} <span className="text-sm font-normal">kg</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-green-400/20 rounded-full blur-3xl" />
      </section>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Progress Rings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Water Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-50 transition-all duration-500 group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                  <FaTint size={28} />
                </div>
                <Link to="/health-diary" className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors">
                  Ekle +
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider">Su Tüketimi</h3>
                    <p className="text-3xl font-black text-gray-800">
                      {(waterData.current / 1000).toFixed(1)}L <span className="text-base font-bold text-gray-400">/ {(waterData.target / 1000).toFixed(1)}L</span>
                    </p>
                  </div>
                  <span className="text-blue-600 font-black text-xl">{Math.round(waterProgress)}%</span>
                </div>
                <div className="h-4 bg-blue-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, waterProgress)}%` }}
                  />
                </div>
              </div>
            </div>

          {/* Calorie Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-orange-50 transition-all duration-500 group">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-orange-50 p-4 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform">
                <FaFire size={28} />
              </div>
              <Link to="/calories" className="text-orange-600 bg-orange-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 hover:text-white transition-colors">
                Takip
              </Link>
            </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider">Günlük Kalori</h3>
                    <p className="text-3xl font-black text-gray-800">
                      {calories.current} <span className="text-base font-bold text-gray-400">/ {calories.target} kcal</span>
                    </p>
                  </div>
                  <span className="text-orange-600 font-black text-xl">{Math.round(calorieProgress)}%</span>
                </div>
                <div className="h-4 bg-orange-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, calorieProgress)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Diet Plan Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-4 rounded-2xl text-green-600">
                  <FaUtensils size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">Aktif Diyet Planı</h3>
                  <p className="text-gray-500 text-sm font-medium">Size özel hazırlanan 7 günlük plan</p>
                </div>
              </div>
              <Link 
                to="/diet-plan" 
                className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm"
              >
                <FaArrowRight />
              </Link>
            </div>

            {activePlan ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Durum</p>
                  <p className="text-sm font-bold text-green-600">Devam Ediyor</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Başlangıç</p>
                  <p className="text-sm font-bold text-gray-700">
                    {new Date(activePlan.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Tür</p>
                  <p className="text-sm font-bold text-gray-700">Kişiselleştirilmiş</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Hizmet</p>
                  <p className="text-sm font-bold text-gray-700">AI Antrenör</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center relative z-10">
                <p className="text-gray-500 font-medium mb-4">Henüz aktif bir diyet planınız yok.</p>
                <Link to="/create-diet" className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100">
                  <span>Hemen Oluştur</span>
                  <FaPlus size={12} />
                </Link>
              </div>
            )}
            
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <FaChartPie size={200} />
            </div>
          </div>

          {/* 5. Week: Target Tracking List */}
          <div className="mt-8">
            <TargetTracking />
          </div>
        </div>

        {/* Right Column: Quick Actions & Tips */}
        <div className="space-y-8">
          
          {/* AI Assistant Quick Access */}
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200 group">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-500">
                <FaRobot size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black">AI Rehber</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter">7/24 Aktif Destek</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              "Bugün ne yemeliyim?" veya "Egzersiz sonrası ne içmeliyim?" gibi sorularını bana sorabilirsin.
            </p>
            <button 
              onClick={() => {
                // Open chatbot (Assuming it's a global component or handled via state)
                // For now, let's redirect to a dedicated assistant page if exists
                // but usually it's a floating chat. If it's a floating chat, we need a trigger.
                const event = new CustomEvent('openAssistantChat');
                window.dispatchEvent(event);
              }}
              className="block w-full py-4 bg-white text-gray-900 rounded-2xl text-center font-black hover:bg-green-500 hover:text-white transition-all duration-300 active:scale-[0.98]"
            >
              Sohbeti Başlat
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/health-diary" className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-green-200 hover:bg-green-50/30 transition-all group">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaRunning size={24} />
              </div>
              <h4 className="text-gray-800 font-black text-sm">Günlük</h4>
              <p className="text-gray-400 text-[10px] font-bold uppercase">Aktivite</p>
            </Link>
            <Link to="/bmi-calculator" className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-green-200 hover:bg-green-50/30 transition-all group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaWeight size={24} />
              </div>
              <h4 className="text-gray-800 font-black text-sm">VKİ</h4>
              <p className="text-gray-400 text-[10px] font-bold uppercase">Hesapla</p>
            </Link>
          </div>

          {/* Daily Tip Card */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2.5rem] p-8 text-white">
            <h4 className="font-black text-lg mb-2 italic">Günün İpucu</h4>
            <p className="text-amber-50 text-sm leading-relaxed opacity-90">
              Yemeklerden 30 dakika önce içilen bir bardak su, metabolizmanızı hızlandırabilir ve tokluk hissi verebilir.
            </p>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
