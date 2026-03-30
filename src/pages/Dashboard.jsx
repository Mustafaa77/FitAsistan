import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaTint, FaFire, FaPlus, FaUtensils, FaRobot, FaLeaf } from 'react-icons/fa';

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  const waterProgress = 65; // Static value for now
  const calorieProgress = 40; // Static value for now

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Card */}
      <section className="bg-green-600 rounded-3xl p-8 text-white shadow-lg shadow-green-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Merhaba, {currentUser?.displayName || 'Kullanıcı'}!</h1>
          <p className="mt-2 text-green-100 text-lg">Bugün hedeflerine bir adım daha yakınsın.</p>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <FaLeaf size={120} />
        </div>
      </section>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Water Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center space-x-6">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-500">
            <FaTint size={32} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-500 font-medium">Günlük Su</span>
              <span className="text-blue-600 font-bold">1.8L / 2.5L</span>
            </div>
            <div className="h-3 bg-blue-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-1000" 
                style={{ width: `${waterProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Calorie Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center space-x-6">
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-500">
            <FaFire size={32} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-500 font-medium">Kalori Hedefi</span>
              <span className="text-orange-600 font-bold">850 / 2100 kcal</span>
            </div>
            <div className="h-3 bg-orange-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-400 rounded-full transition-all duration-1000" 
                style={{ width: `${calorieProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:bg-green-50 transition-colors group flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-2xl text-green-600 group-hover:bg-green-200 transition-colors mb-4">
              <FaUtensils size={24} />
            </div>
            <span className="font-semibold text-gray-700 text-sm md:text-base">Diyet Planla</span>
          </button>

          <button className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:bg-green-50 transition-colors group flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-2xl text-green-600 group-hover:bg-green-200 transition-colors mb-4">
              <FaRobot size={24} />
            </div>
            <span className="font-semibold text-gray-700 text-sm md:text-base">Asistan</span>
          </button>

          <button className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:bg-green-50 transition-colors group flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-2xl text-green-600 group-hover:bg-green-200 transition-colors mb-4">
              <FaPlus size={24} />
            </div>
            <span className="font-semibold text-gray-700 text-sm md:text-base">Su Ekle</span>
          </button>
        </div>
      </section>

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

export default Dashboard;
