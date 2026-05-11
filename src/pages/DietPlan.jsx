import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUtensils, FaFire, FaCalendarAlt, FaPlus, FaTrash, 
  FaChevronLeft, FaChevronRight, FaCheckCircle, FaStar
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';

const DietPlan = () => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  
  // Touch support for mobile swipe
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    fetchPlans();
  }, [currentUser]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const allPlans = await supabaseService.getAllDietPlans(currentUser.uid);
      const sanitizedPlans = allPlans || [];
      setPlans(sanitizedPlans);
      
      // Set activeIndex to the currently active plan
      if (sanitizedPlans.length > 0) {
        const activeIdx = sanitizedPlans.findIndex(p => p.is_active);
        setActiveIndex(activeIdx !== -1 ? activeIdx : 0);
      }
    } catch (error) {
      console.error('Diet plans fetch error:', error);
      toast.error('Planlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Ensure activeIndex is valid when plans change
  useEffect(() => {
    if (plans.length > 0 && activeIndex >= plans.length) {
      setActiveIndex(plans.length - 1);
    }
  }, [plans, activeIndex]);

  const handleSetActive = async (planId) => {
    try {
      setIsActivating(true);
      await supabaseService.setActiveDietPlan(currentUser.uid, planId);
      
      // Update local state to reflect the new active plan
      setPlans(prev => prev.map(p => ({
        ...p,
        is_active: p.id === planId
      })));
      
      toast.success('Diyet planı aktif hale getirildi!', {
        icon: '🎯',
        style: { borderRadius: '12px', background: '#16a34a', color: '#fff' }
      });
    } catch (error) {
      console.error('Activation error:', error);
      toast.error('Plan aktif edilemedi.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Bu diyet planını tamamen silmek istediğine emin misin?')) return;
    
    try {
      setLoading(true); // Show loader during delete
      await supabaseService.deleteDietPlan(planId);
      
      toast.success('Plan başarıyla silindi.');
      
      // Update plans list locally
      const updatedPlans = plans.filter(p => p.id !== planId);
      setPlans(updatedPlans);
      
      // If we deleted the active index or the last item, adjust index
      if (activeIndex >= updatedPlans.length && updatedPlans.length > 0) {
        setActiveIndex(updatedPlans.length - 1);
      } else if (updatedPlans.length === 0) {
        setActiveIndex(0);
      }
    } catch (e) {
      console.error('Delete error:', e);
      toast.error('Silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const nextPlan = () => {
    setActiveIndex((prev) => (prev + 1) % plans.length);
  };

  const prevPlan = () => {
    setActiveIndex((prev) => (prev - 1 + plans.length) % plans.length);
  };

  // Touch handlers
  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextPlan();
    if (isRightSwipe) prevPlan();
  };

  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Planların yükleniyor...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-full bg-gray-50 p-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <FaUtensils size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-800">Henüz Bir Planın Yok</h1>
          <p className="text-gray-500 mt-2 max-w-xs">
            Kişiselleştirilmiş bir diyet programı oluşturmak için asistanımızı kullanabilirsin.
          </p>
        </div>
        <Link 
          to="/create-diet" 
          className="px-8 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-2"
        >
          <FaPlus />
          Diyet Oluştur
        </Link>
      </div>
    );
  }

  const currentPlan = plans[activeIndex];
  
  if (!currentPlan) return null; // Safety fallback

  const { plan, info, tarih } = currentPlan.plan_data;

  return (
    <div className="min-h-full bg-gray-50 pb-24 overflow-x-hidden">
      
      {/* Header & Carousel Section */}
      <section className="bg-white pt-8 pb-6 shadow-sm relative z-20">
        <div className="max-w-4xl mx-auto px-6 mb-8 text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Diyet Programlarım</h1>
          <p className="text-gray-400 text-sm mt-2">Planlarınız arasında geçiş yapabilir ve aktif olanı seçebilirsiniz.</p>
        </div>

        {/* Carousel Container */}
        <div className="relative h-60 md:h-72 flex items-center justify-center mb-4">
          
          {/* Nav Buttons */}
          <button 
            onClick={prevPlan}
            className="absolute left-4 z-30 p-4 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl text-gray-400 hover:text-green-600 transition-all active:scale-90 hidden md:block"
          >
            <FaChevronLeft size={20} />
          </button>
          <button 
            onClick={nextPlan}
            className="absolute right-4 z-30 p-4 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl text-gray-400 hover:text-green-600 transition-all active:scale-90 hidden md:block"
          >
            <FaChevronRight size={20} />
          </button>

          {/* Cards Wrapper */}
          <div 
            className="flex items-center justify-center w-full max-w-5xl h-full relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {plans.map((p, idx) => {
              // Circular positioning logic
              let position = idx - activeIndex;
              if (position > Math.floor(plans.length / 2)) position -= plans.length;
              if (position < -Math.floor(plans.length / 2)) position += plans.length;

              const isActive = position === 0;
              const isPrev = position === -1;
              const isNext = position === 1;
              const isFar = Math.abs(position) > 1;

              return (
                <div
                  key={p.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`
                    absolute transition-all duration-500 cursor-pointer
                    w-60 md:w-72 h-44 md:h-52 rounded-[2rem] p-5
                    ${isActive ? 'z-20 scale-110 opacity-100 shadow-2xl shadow-green-100 border-4 border-green-500' : 'z-10 scale-90 opacity-40 grayscale'}
                    ${isPrev ? '-translate-x-32 md:-translate-x-44 rotate-[-10deg]' : ''}
                    ${isNext ? 'translate-x-32 md:translate-x-44 rotate-[10deg]' : ''}
                    ${isFar ? 'opacity-0 pointer-events-none' : ''}
                    ${isActive ? 'bg-white' : 'bg-gray-100'}
                  `}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-xl ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                        <FaStar size={16} />
                      </div>
                      {p.is_active && (
                        <span className="bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-green-200">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-lg font-black ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                        {idx + 1}. Program
                      </h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                        {new Date(p.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id);
                          }}
                          className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"
                        >
                          <FaTrash size={12} />
                        </button>
                        {!p.is_active && (
                          <button 
                            disabled={isActivating}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetActive(p.id);
                            }}
                            className="flex-1 bg-green-600 text-white text-[10px] font-bold rounded-xl py-2.5 shadow-lg shadow-green-100 hover:bg-green-700 transition-colors"
                          >
                            Aktif Yap
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Integrated Macro & Day Selector Container */}
      <div className="max-w-lg mx-auto px-6 space-y-6 -mt-8 relative z-30">
        {/* Day Selector - Improved Scrollability & Visibility */}
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-[1.5rem] shadow-xl border border-gray-100 relative group/days mx-auto max-w-lg">
          <div className="flex gap-3 overflow-x-auto pb-3 px-1 snap-x snap-mandatory scroll-smooth custom-scrollbar-horizontal touch-pan-x">
            {dayNames.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`px-6 py-4 rounded-xl font-black text-sm transition-all whitespace-nowrap shadow-sm border snap-start min-w-[120px] ${
                  selectedDay === index
                    ? 'bg-green-600 text-white border-green-600 shadow-green-100 scale-105'
                    : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:border-green-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          {/* Scroll Fade Indicators */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/80 to-transparent pointer-events-none rounded-r-[1.5rem]" />
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/80 to-transparent pointer-events-none rounded-l-[1.5rem]" />
        </div>

        {/* Macro Summary - Tighter Integration */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <FaFire size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Günlük Kalori Hedefi</p>
                  <p className="text-2xl font-black">{info.dailyCalories} <span className="text-xs font-normal text-gray-400">kcal</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <MacroItem label="Protein" value={info.macros.protein} color="bg-blue-500" />
                <MacroItem label="Karb" value={info.macros.carbs} color="bg-orange-500" />
                <MacroItem label="Yağ" value={info.macros.fat} color="bg-purple-500" />
              </div>
            </div>
            <div className="absolute -top-4 -right-4 p-8 opacity-[0.05]">
              <FaUtensils size={100} />
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <div className="max-w-lg mx-auto px-6 mt-6 space-y-6 animate-fade-in" key={currentPlan.id + selectedDay}>
        {/* Meal List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-lg font-black text-gray-800">{dayNames[selectedDay]} Menüsü</h2>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
              {plan[selectedDay].totalCalories} kcal
            </span>
          </div>

          <MealCard
            icon="🌅"
            title="Kahvaltı"
            content={plan[selectedDay].meals.breakfast}
            delay="0s"
          />
          <MealCard
            icon="☀️"
            title="Öğle Yemeği"
            content={plan[selectedDay].meals.lunch}
            delay="0.1s"
          />
          <MealCard
            icon="🌙"
            title="Akşam Yemeği"
            content={plan[selectedDay].meals.dinner}
            delay="0.2s"
          />
          <MealCard
            icon="🍎"
            title="Atıştırmalıklar"
            content={plan[selectedDay].meals.snacks?.join(' • ') || 'İsteğe bağlı'}
            delay="0.3s"
          />
        </div>

        <Link 
          to="/create-diet" 
          className="block w-full py-6 bg-white border-2 border-dashed border-gray-200 text-gray-400 font-black rounded-[2rem] text-center hover:border-green-200 hover:text-green-600 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-center gap-3">
            <FaPlus />
            <span>Yeni Bir Plan Daha Oluştur</span>
          </div>
        </Link>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 10px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

const MacroItem = ({ label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
    <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${color}`} />
    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
    <p className="text-lg font-black">{value}g</p>
  </div>
);

const MealCard = ({ icon, title, content, delay }) => (
  <div 
    className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex gap-5 hover:shadow-xl transition-all duration-500 group"
    style={{ animation: `fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay} forwards`, opacity: 0 }}
  >
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="space-y-1.5 flex-1">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-gray-800 tracking-tight">{title}</h4>
        <div className="w-6 h-6 bg-green-50 text-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <FaCheckCircle size={12} />
        </div>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">{content}</p>
    </div>
  </div>
);

export default DietPlan;
