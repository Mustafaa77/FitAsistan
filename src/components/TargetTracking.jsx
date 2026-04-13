import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaCheck, FaBullseye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const TargetTracking = () => {
  const [targets, setTargets] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Load targets from local storage
  useEffect(() => {
    try {
      const savedTargets = localStorage.getItem('gunlukHedefler');
      if (savedTargets) {
        setTargets(JSON.parse(savedTargets));
      }
    } catch (error) {
      console.error('Error loading targets:', error);
      toast.error('Hedefler yüklenirken bir hata oluştu.');
    }
  }, []);

  // Save targets to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gunlukHedefler', JSON.stringify(targets));
    } catch (error) {
      console.error('Error saving targets:', error);
      toast.error('Hedefler kaydedilirken bir hata oluştu.');
    }
  }, [targets]);

  const handleAddTarget = (e) => {
    e.preventDefault();
    
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      toast.error('Lütfen geçerli bir hedef girin.');
      return;
    }

    if (trimmedValue.length < 3) {
      toast.error('Hedef en az 3 karakter olmalıdır.');
      return;
    }

    const newTarget = {
      id: Date.now().toString(),
      text: trimmedValue,
      completed: false,
      date: Date.now(),
    };

    setTargets([newTarget, ...targets]);
    setInputValue('');
    toast.success('Hedef başarıyla eklendi!');
  };

  const toggleTarget = (id) => {
    setTargets(targets.map(target => 
      target.id === id ? { ...target, completed: !target.completed } : target
    ));
  };

  const deleteTarget = (id) => {
    setTargets(targets.filter(target => target.id !== id));
    toast.success('Hedef silindi.');
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
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaBullseye className="text-green-600" /> Günlük Hedeflerim
        </h2>
        {totalCount > 0 && (
          <span className="text-sm font-medium text-gray-500">
            {completedCount}/{totalCount} Tamamlandı (%{progressPercentage})
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Target Input */}
      <form onSubmit={handleAddTarget} className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Örn: Erken kalkmak, 45 dk yürüyüş..."
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 pr-14 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-base placeholder:text-gray-400"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 aspect-square bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 active:scale-95 transition-all shadow-sm shadow-green-200"
          style={{ minWidth: '44px', minHeight: '44px' }}
          aria-label="Hedef Ekle"
        >
          <FaPlus size={18} />
        </button>
      </form>

      {/* Targets List */}
      <div ref={listRef} className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {targets.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <FaBullseye size={32} className="opacity-40" />
            </div>
            <div className="space-y-1">
              <p className="text-gray-800 font-semibold">Henüz hedef eklenmemiş</p>
              <p className="text-gray-500 text-sm px-8">Bugün için harika bir hedef belirle!</p>
            </div>
          </div>
        ) : (
          targets.map((target) => (
            <div
              key={target.id}
              className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                target.completed 
                ? 'bg-gray-50 border-gray-100 opacity-75' 
                : 'bg-white border-gray-100 hover:border-green-100 hover:shadow-md hover:shadow-green-50/50'
              }`}
            >
              {/* Custom Checkbox */}
              <button
                onClick={() => toggleTarget(target.id)}
                className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  target.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-400'
                }`}
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label={target.completed ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}
              >
                {target.completed && <FaCheck size={14} className="animate-scale-in" />}
              </button>

              {/* Target Text */}
              <span className={`flex-1 text-base transition-all duration-300 ${
                target.completed 
                ? 'text-gray-400 line-through italic' 
                : 'text-gray-700 font-medium'
              }`}>
                {target.text}
              </span>

              {/* Delete Button */}
              <button
                onClick={() => deleteTarget(target.id)}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 active:scale-90"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Hedefi Sil"
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </section>
  );
};

export default TargetTracking;
