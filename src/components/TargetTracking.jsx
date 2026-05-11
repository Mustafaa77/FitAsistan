import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaCheck, FaBullseye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';

const TargetTracking = () => {
  const { currentUser } = useAuth();
  const [targets, setTargets] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Load targets from Supabase
  useEffect(() => {
    if (!currentUser) return;

    const fetchTargets = async () => {
      try {
        setLoading(true);
        const data = await supabaseService.getDailyTargets(currentUser.uid);
        if (data) setTargets(data);
      } catch (error) {
        console.error('Error loading targets:', error);
        toast.error('Hedefler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [currentUser]);

  const handleAddTarget = async (e) => {
    e.preventDefault();
    
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      toast.error('Lütfen geçerli bir hedef girin.');
      return;
    }

    try {
      const newTarget = await supabaseService.addDailyTarget(currentUser.uid, trimmedValue);
      setTargets([newTarget, ...targets]);
      setInputValue('');
      toast.success('Hedef başarıyla eklendi!');
    } catch (error) {
      toast.error('Hedef eklenemedi.');
    }
  };

  const toggleTarget = async (id, currentStatus) => {
    try {
      const updated = await supabaseService.toggleDailyTarget(id, !currentStatus);
      setTargets(targets.map(t => t.id === id ? updated : t));
    } catch (error) {
      toast.error('Hedef güncellenemedi.');
    }
  };

  const deleteTarget = async (id) => {
    try {
      await supabaseService.deleteDailyTarget(id);
      setTargets(targets.filter(t => t.id !== id));
      toast.success('Hedef silindi.');
    } catch (error) {
      toast.error('Hedef silinemedi.');
    }
  };

  const completedCount = targets.filter(t => t.completed).length;
  const totalCount = targets.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Mobile keyboard handling: ensure input is visible
  const handleInputFocus = () => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  return (
    <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col space-y-8 group/section hover:shadow-xl hover:shadow-green-50/50 transition-all duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
              <FaBullseye size={20} />
            </div>
            Günlük Hedeflerim
          </h2>
        </div>
        {totalCount > 0 && (
          <div className="text-right">
            <span className="text-2xl font-black text-green-600 block">
              %{progressPercentage}
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              {completedCount}/{totalCount} Tamamlandı
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar - Integrated & Shimmering */}
      {totalCount > 0 && (
        <div className="relative h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-green-100" 
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Shimmer Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 skew-x-[-20deg] animate-shimmer" />
          </div>
        </div>
      )}

      {/* Add Target Input - Premium Design */}
      <form onSubmit={handleAddTarget} className="relative group/input">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Örn: Erken kalkmak, spora gitmek..."
          className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[1.5rem] px-6 py-5 pr-16 text-gray-800 font-bold focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 focus:bg-white transition-all text-lg placeholder:text-gray-300 shadow-inner"
        />
        <button
          type="submit"
          className="absolute right-3 top-3 bottom-3 aspect-square bg-green-600 text-white rounded-2xl flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all shadow-lg shadow-green-100 group-hover/input:rotate-90"
          style={{ minWidth: '48px' }}
        >
          <FaPlus size={20} />
        </button>
      </form>

      {/* Targets List - High End UI */}
      <div ref={listRef} className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        {targets.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
            <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-600/30 rotate-12 group-hover/section:rotate-0 transition-transform duration-700">
              <FaBullseye size={48} />
            </div>
            <div className="space-y-2">
              <p className="text-gray-800 text-xl font-black">Listen Bomboş!</p>
              <p className="text-gray-400 text-sm max-w-[200px] mx-auto font-medium">Bugün seni heyecanlandıracak bir hedef ekleyerek başla.</p>
            </div>
          </div>
        ) : (
          targets.map((target, idx) => (
            <div
              key={target.id}
              className={`group flex items-center gap-5 p-5 rounded-[2rem] border-2 transition-all duration-500 animate-slide-in ${
                target.completed 
                ? 'bg-gray-50/50 border-transparent opacity-60' 
                : 'bg-white border-gray-50 hover:border-green-100 hover:shadow-xl hover:shadow-green-50/30'
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Custom Checkbox - Large & Accessible */}
              <button
                onClick={() => toggleTarget(target.id, target.completed)}
                className={`flex-shrink-0 w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                  target.completed 
                  ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200' 
                  : 'bg-white border-gray-200 hover:border-green-500 group-hover:scale-110'
                }`}
                style={{ minWidth: '44px' }}
              >
                {target.completed ? (
                  <FaCheck size={16} className="animate-scale-in" />
                ) : (
                  <div className="w-2 h-2 bg-gray-100 rounded-full group-hover:bg-green-500 transition-colors" />
                )}
              </button>

              {/* Target Text - Elegant Typography */}
              <div className="flex-1 flex flex-col min-w-0">
                <span className={`text-lg transition-all duration-500 truncate ${
                  target.completed 
                  ? 'text-gray-400 line-through italic' 
                  : 'text-gray-800 font-black tracking-tight'
                }`}>
                  {target.text}
                </span>
                {target.completed && (
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-0.5">
                    Tamamlandı! 🚀
                  </span>
                )}
              </div>

              {/* Delete Button - Subtle but Accessible */}
              <button
                onClick={() => deleteTarget(target.id)}
                className="flex-shrink-0 w-10 h-10 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-90"
                style={{ minWidth: '44px' }}
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f3f4f6;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e5e7eb;
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .ml-13 { margin-left: 3.25rem; }
      `}</style>
    </section>
  );
};

export default TargetTracking;
