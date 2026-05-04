import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaFire, FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DietPlan = () => {
  const [savedData, setSavedData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('kayitliDiyetPlani');
    if (saved) {
      setSavedData(JSON.parse(saved));
    }
  }, []);

  const handleDelete = () => {
    if (window.confirm('Mevcut diyet planını silmek istediğine emin misin?')) {
      localStorage.removeItem('kayitliDiyetPlani');
      setSavedData(null);
      toast.success('Diyet planı silindi.');
    }
  };

  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  if (!savedData) {
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

  const { plan, info, user, tarih } = savedData;

  return (
    <div className="min-h-full bg-gray-50 p-6 pb-safe">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Diyet Planım</h1>
            <p className="text-xs text-gray-400 mt-1">
              Oluşturulma: {new Date(tarih).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <button 
            onClick={handleDelete}
            className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
          >
            <FaTrash size={14} />
          </button>
        </div>

        {/* Özet Kartı */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-lg shadow-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FaFire className="text-white" size={24} />
            </div>
            <div>
              <p className="text-green-100 text-sm">Günlük Hedef</p>
              <p className="text-3xl font-black">{info.dailyCalories} kcal</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white/10 rounded-xl p-2">
              <p className="text-green-100">Protein</p>
              <p className="font-bold">{info.macros.protein}g</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <p className="text-green-100">Karbonhidrat</p>
              <p className="font-bold">{info.macros.carbs}g</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <p className="text-green-100">Yağ</p>
              <p className="font-bold">{info.macros.fat}g</p>
            </div>
          </div>
        </div>

        {/* Gün Seçici */}
        <div className="bg-white rounded-2xl p-2 shadow-sm overflow-x-auto flex gap-2 no-scrollbar">
          {dayNames.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap text-sm ${
                selectedDay === index
                  ? 'bg-green-600 text-white shadow-md shadow-green-100'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Öğün Kartları */}
        {plan[selectedDay] && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex justify-between items-center">
              <span className="font-black text-green-800">{dayNames[selectedDay]}</span>
              <span className="text-sm font-bold text-green-600">{plan[selectedDay].totalCalories} kcal</span>
            </div>

            <MealCard
              icon="🌅"
              title="Kahvaltı"
              content={plan[selectedDay].meals.breakfast}
            />
            <MealCard
              icon="☀️"
              title="Öğle Yemeği"
              content={plan[selectedDay].meals.lunch}
            />
            <MealCard
              icon="🌙"
              title="Akşam Yemeği"
              content={plan[selectedDay].meals.dinner}
            />
            <MealCard
              icon="🍎"
              title="Atıştırmalıklar"
              content={plan[selectedDay].meals.snacks?.join(' • ') || 'İsteğe bağlı'}
            />
          </div>
        )}

        <Link 
          to="/create-diet" 
          className="w-full py-4 bg-white border-2 border-dashed border-gray-200 text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:border-green-200 hover:text-green-600 transition-all"
        >
          <FaPlus size={14} />
          Yeni Plan Oluştur
        </Link>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

const MealCard = ({ icon, title, content }) => (
  <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 flex gap-4">
    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{content}</p>
    </div>
  </div>
);

export default DietPlan;
