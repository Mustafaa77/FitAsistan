import React, { useState } from 'react';
import { FaSearch, FaFire, FaDumbbell, FaBolt, FaLeaf, FaSpinner, FaTimes } from 'react-icons/fa';
import { analyzeFood } from '../services/aiService';
import toast from 'react-hot-toast';

const CalorieSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foodData, setFoodData] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    const result = await analyzeFood(searchQuery.trim());

    setIsLoading(false);

    if (result.success && result.data) {
      setFoodData(result.data);
      if (!searchHistory.includes(searchQuery.trim())) {
        const newHistory = [searchQuery.trim(), ...searchHistory.slice(0, 4)];
        setSearchHistory(newHistory);
        localStorage.setItem('kaloriGecmisi', JSON.stringify(newHistory));
      }
      toast.success('Besin analizi tamamlandı!');
    } else {
      toast.error(result.error || 'Besin analizi başarısız oldu');
      setFoodData(null);
    }
  };

  const handleQuickSearch = async (query) => {
    setSearchQuery(query);
    setIsLoading(true);
    const result = await analyzeFood(query);

    setIsLoading(false);

    if (result.success && result.data) {
      setFoodData(result.data);
    } else {
      toast.error(result.error || 'Besin analizi başarısız oldu');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFoodData(null);
  };

  return (
    <div className="min-h-full bg-gray-50 p-6 pb-safe">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <FaFire className="text-green-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-black text-gray-800">Kalori Hesaplayıcı</h1>
          <p className="text-gray-500 mt-2">Besinlerin kalori ve makro değerlerini öğren</p>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Örn: 1 tabak makarna, 1 muz, 100g tavuk göğsü..."
            className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 pr-12 text-gray-700 font-medium focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
            style={{ minHeight: '56px' }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!searchQuery.trim() || isLoading}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              searchQuery.trim() && !isLoading
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {isLoading ? <FaSpinner className="animate-spin" size={16} /> : <FaSearch size={16} />}
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={16} />
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-2 justify-center">
          {['1 muz', '1 elma', '1 tabak pilav', '100g tavuk', '1 yumurta'].map((item) => (
            <button
              key={item}
              onClick={() => handleQuickSearch(item)}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>

        {foodData && (
          <div className="bg-white rounded-3xl shadow-lg shadow-green-100/50 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaLeaf className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{foodData.food}</h2>
                  <p className="text-green-100 text-sm">Tahmini değerler</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <FaFire className="text-orange-500 mx-auto mb-2" size={24} />
                  <p className="text-2xl font-black text-orange-600">{foodData.calories}</p>
                  <p className="text-xs text-orange-400 font-medium">Kalori</p>
                </div>

                <div className="bg-red-50 rounded-2xl p-4 text-center">
                  <FaDumbbell className="text-red-500 mx-auto mb-2" size={24} />
                  <p className="text-2xl font-black text-red-600">{foodData.protein}g</p>
                  <p className="text-xs text-red-400 font-medium">Protein</p>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                  <FaBolt className="text-yellow-500 mx-auto mb-2" size={24} />
                  <p className="text-2xl font-black text-yellow-600">{foodData.carbs}g</p>
                  <p className="text-xs text-yellow-400 font-medium">Karbonhidrat</p>
                </div>

                <div className="bg-purple-50 rounded-2xl p-4 text-center">
                  <FaDumbbell className="text-purple-500 mx-auto mb-2" size={24} />
                  <p className="text-2xl font-black text-purple-600">{foodData.fat}g</p>
                  <p className="text-xs text-purple-400 font-medium">Yağ</p>
                </div>
              </div>

              {foodData.advice && (
                <div className="bg-green-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaLeaf className="text-green-600" size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800 mb-1">Koç Tavsiyesi</p>
                      <p className="text-sm text-green-700 leading-relaxed">{foodData.advice}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {searchHistory.length > 0 && !foodData && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium mb-3 px-2">Son Aramalar</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSearch(item)}
                  className="px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 leading-relaxed">
            <span className="font-semibold">💡 Bilgi:</span> Gösterilen değerler tahmini olup gerçek değerlerden farklılık gösterebilir. 
            Kesin bilgi için ürün ambalajındaki etiketi kontrol edin.
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

export default CalorieSearch;
