import React, { useState, useEffect } from 'react';
import { FaTint, FaSave, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Settings = () => {
  const navigate = useNavigate();
  const [waterTarget, setWaterTarget] = useState(2500);
  const [inputValue, setInputValue] = useState('2500');
  const [isSaving, setIsSaving] = useState(false);

  // Load initial value
  useEffect(() => {
    const savedTarget = localStorage.getItem('suHedefi');
    if (savedTarget) {
      setWaterTarget(parseInt(savedTarget));
      setInputValue(savedTarget);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    const newTarget = parseInt(inputValue);

    // Validation
    if (isNaN(newTarget) || newTarget <= 0) {
      toast.error('Lütfen 0\'dan büyük geçerli bir sayı girin.', {
        icon: <FaExclamationTriangle className="text-amber-500" />,
      });
      setIsSaving(false);
      return;
    }

    if (newTarget > 10000) {
      toast.error('Su hedefi çok yüksek (Maksimum 10L).', {
        icon: <FaExclamationTriangle className="text-amber-500" />,
      });
      setIsSaving(false);
      return;
    }

    try {
      localStorage.setItem('suHedefi', newTarget.toString());
      setWaterTarget(newTarget);
      
      toast.success('Su hedefiniz başarıyla güncellendi!', {
        icon: <FaCheckCircle className="text-white" />,
        style: {
          borderRadius: '12px',
          background: '#16a34a',
          color: '#fff',
        },
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      toast.error('Kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in p-4 pb-24">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Ayarlar</h1>
      </div>

      {/* Settings Card */}
      <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-500">
            <FaTint size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Su Tüketim Hedefi</h2>
            <p className="text-gray-500 text-sm">Günlük içmek istediğiniz su miktarını belirleyin.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 ml-1">
              Günlük Hedef (ml)
            </label>
            <div className="relative group">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Örn: 2500"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl px-8 py-5 text-2xl font-black text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-300"
                style={{ minHeight: '64px' }}
              />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                ml
              </div>
            </div>
            
            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[2000, 2500, 3000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInputValue(preset.toString())}
                  className={`py-3 rounded-2xl border-2 transition-all font-bold text-sm ${
                    inputValue === preset.toString()
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  {preset} ml
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50 flex items-start space-x-4">
            <div className="text-blue-500 mt-1">
              <FaExclamationTriangle size={18} />
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">
              <strong>İpucu:</strong> Sağlıklı bir yetişkin için genel öneri günlük 2-3 litre su tüketimidir. Kilonuza ve aktivite seviyenize göre bu miktar değişebilir.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-5 rounded-3xl font-black text-lg shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 ${
              isSaving 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            style={{ minHeight: '64px' }}
          >
            <FaSave />
            <span>{isSaving ? 'Kaydediliyor...' : 'Hedefi Güncelle'}</span>
          </button>
        </form>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default Settings;
