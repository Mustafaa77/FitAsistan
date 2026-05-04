import React, { useState, useEffect } from 'react';
import { FaClock, FaFire, FaLayerGroup, FaTimes, FaUtensils, FaSearch } from 'react-icons/fa';
import AssistantChat from '../components/AssistantChat';
import { recipesData } from '../pages/recipesData'

const Recipes = () => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedRecipe) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedRecipe]);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedRecipe(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Filtering logic
  const filteredRecipes = recipesData.filter(recipe => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = recipe.title.toLowerCase().includes(searchLower);
    const ingredientsMatch = recipe.ingredients.some(ing => ing.toLowerCase().includes(searchLower));
    return titleMatch || ingredientsMatch;
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 pb-24 space-y-6 animate-fade-in relative">
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Sağlıklı Tarifler</h1>
            <p className="text-gray-500 font-medium">AI destekli diyet dostu lezzetler</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Tarif veya malzeme ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm h-12"
            />
          </div>
        </div>

        {/* Grid Layout or Empty State */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-50 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 cursor-pointer flex flex-col focus-within:ring-4 focus-within:ring-green-500/20"
                tabIndex="0"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    src={recipe.imageURL} 
                    alt={recipe.title}
                    loading="lazy"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x300/f3f4f6/6b7280?text=Tarif+Gorseli';
                      e.target.className = 'w-full h-full object-cover opacity-50 bg-gray-200';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <FaFire className="text-orange-500 text-xs" />
                    <span className="text-xs font-black text-gray-800">{recipe.calories} kcal</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-green-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center justify-between text-gray-500">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <FaClock className="text-gray-400" />
                      <span>{recipe.duration}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      recipe.difficulty === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {recipe.difficulty === 'easy' ? 'Kolay' : recipe.difficulty === 'medium' ? 'Orta' : 'Zor'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
            <div className="bg-gray-100 p-6 rounded-full text-gray-300">
              <FaSearch size={48} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-800">Sonuç Bulunamadı</h3>
              <p className="text-gray-500 px-6">Aradığınız malzemelere veya isme sahip tarif bulunamadı.</p>
            </div>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-green-600 font-bold hover:underline"
            >
              Aramayı Temizle
            </button>
          </div>
        )}
      </div>

      {/* Recipe Detail Modal - Rendered OUTSIDE animate-fade-in to avoid Stacking Context issues */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRecipe(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            <button 
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-500 hover:text-gray-800 shadow-lg z-10 transition-all active:scale-90"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <FaTimes size={20} />
            </button>

            <div className="overflow-y-auto custom-scrollbar">
              <div className="aspect-video w-full bg-gray-100">
                <img 
                  src={selectedRecipe.imageURL} 
                  alt={selectedRecipe.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x450/f3f4f6/6b7280?text=Gorsel+Yuklenemedi';
                  }}
                />
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-800 mb-4">{selectedRecipe.title}</h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-orange-50 px-4 py-2 rounded-xl flex items-center gap-2">
                      <FaFire className="text-orange-500" />
                      <span className="text-sm font-bold text-orange-700">{selectedRecipe.calories} kcal</span>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2">
                      <FaClock className="text-blue-500" />
                      <span className="text-sm font-bold text-blue-700">{selectedRecipe.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                      <FaUtensils className="text-green-600" /> Malzemeler
                    </h3>
                    <ul className="space-y-3">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-600 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                      <FaLayerGroup className="text-green-600" /> Hazırlanışı
                    </h3>
                    <div className="space-y-4">
                      {selectedRecipe.instructions.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-black text-xs">
                            {i + 1}
                          </div>
                          <p className="text-gray-600 font-medium leading-relaxed pt-1">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Assistant FAB & Sheet */}
      <AssistantChat />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </>
  );
};

export default Recipes;
