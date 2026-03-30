import React, { useState, useEffect } from 'react';
import { 
  FaWeight, FaArrowsAltV, FaUserFriends, FaCalculator, 
  FaChartLine, FaHistory, FaCheckCircle, FaExclamationTriangle 
} from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import toast from 'react-hot-toast';

const BMICalculator = () => {
  const [activeTab, setActiveTab] = useState('bmi'); // 'bmi' or 'tracker'
  
  // BMI State
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [bmiResult, setBmiResult] = useState(null);

  // Tracker State
  const [targetWeight, setTargetWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [currentWeightInput, setCurrentWeightInput] = useState('');
  const [currentDateInput, setCurrentDateInput] = useState(new Date().toISOString().split('T')[0]);

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('fitasistan_health_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setHeight(parsed.height || '');
      setAge(parsed.age || '');
      setTargetWeight(parsed.targetWeight || '');
      setWeightHistory(parsed.weightHistory || []);
      if (parsed.weightHistory?.length > 0) {
        setWeight(parsed.weightHistory[parsed.weightHistory.length - 1].weight);
      }
    }
  }, []);

  // Save data to localStorage
  const saveToLocal = (newData) => {
    const existingData = JSON.parse(localStorage.getItem('fitasistan_health_data') || '{}');
    const merged = { ...existingData, ...newData };
    localStorage.setItem('fitasistan_health_data', JSON.stringify(merged));
  };

  const calculateBMI = (e) => {
    e.preventDefault();
    
    // Form validasyonu
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);

    if (!h || h <= 50 || h > 250) {
      toast.error('Lütfen geçerli bir boy girin (50-250 cm)');
      return;
    }
    if (!w || w <= 0 || w > 500) {
      toast.error('Lütfen geçerli bir kilo girin (0-500 kg)');
      return;
    }
    if (!a || a <= 0 || a > 120) {
      toast.error('Lütfen geçerli bir yaş girin (0-120)');
      return;
    }

    const heightInMeters = h / 100;
    const bmi = (w / (heightInMeters * heightInMeters)).toFixed(1);
    setBmiResult(bmi);
    
    saveToLocal({ height: h, age: a });
    toast.success('VKİ Hesaplandı!');
  };

  const addWeightRecord = (e) => {
    e.preventDefault();
    const w = parseFloat(currentWeightInput);
    
    if (!w || w <= 0 || w > 500) {
      toast.error('Lütfen geçerli bir kilo girin (0-500 kg)');
      return;
    }
    
    if (!currentDateInput) {
      toast.error('Lütfen bir tarih seçin');
      return;
    }

    const selectedDate = new Date(currentDateInput);
    const formattedDate = selectedDate.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\./g, '/'); // Convert DD.MM.YYYY to DD/MM/YYYY

    const newRecord = {
      date: formattedDate,
      weight: w,
      fullDate: selectedDate.toISOString()
    };

    // Tarihe göre sıralı tut ve son 10 kaydı al
    const updatedHistory = [...weightHistory, newRecord]
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
      .slice(-10);

    setWeightHistory(updatedHistory);
    setWeight(w.toString());
    setCurrentWeightInput('');
    saveToLocal({ weightHistory: updatedHistory });
    toast.success('Kilo kaydı eklendi!');
  };

  const clearWeightHistory = () => {
    if (window.confirm('Kilo geçmişinizi tamamen silmek istediğinize emin misiniz?')) {
      setWeightHistory([]);
      saveToLocal({ weightHistory: [] });
      toast.success('Kilo geçmişi temizlendi.');
    }
  };

  const getBmiStatus = (bmi) => {
    if (bmi < 18.5) return { label: 'Zayıf', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', advice: 'Sağlıklı bir şekilde kilo almak için beslenme uzmanına danışabilirsiniz.' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', advice: 'Harika! İdeal kilonuzu korumak için dengeli beslenmeye devam edin.' };
    if (bmi < 30) return { label: 'Fazla Kilolu', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', advice: 'Egzersiz ve porsiyon kontrolü ile ideal kilonuza ulaşabilirsiniz.' };
    return { label: 'Obez', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', advice: 'Sağlığınız için bir beslenme uzmanı eşliğinde kilo vermeniz önerilir.' };
  };

  const status = bmiResult ? getBmiStatus(bmiResult) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => setActiveTab('bmi')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${activeTab === 'bmi' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <FaCalculator />
          <span>VKİ Hesapla</span>
        </button>
        <button 
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${activeTab === 'tracker' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <FaChartLine />
          <span>Kilo Takibi</span>
        </button>
      </div>

      {activeTab === 'bmi' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BMI Form */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Vücut Kitle İndeksi</h2>
            <form onSubmit={calculateBMI} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                  <FaArrowsAltV className="text-green-600" />
                  <span>Boy (cm)</span>
                </label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Örn: 175"
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                  <FaWeight className="text-green-600" />
                  <span>Kilo (kg)</span>
                </label>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Örn: 70"
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                  <FaUserFriends className="text-green-600" />
                  <span>Yaş</span>
                </label>
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Örn: 25"
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full h-14 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all"
              >
                Hesapla
              </button>
            </form>
          </div>

          {/* BMI Result */}
          <div className="flex flex-col">
            {bmiResult ? (
              <div className={`flex-1 ${status.bg} ${status.border} border p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 animate-scale-in`}>
                <div className={`text-5xl font-black ${status.color}`}>{bmiResult}</div>
                <div>
                  <div className={`text-xl font-bold ${status.color}`}>{status.label}</div>
                  <p className="text-gray-600 mt-2 leading-relaxed">{status.advice}</p>
                </div>
                <div className="w-full bg-white/50 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-400 px-1">
                    <span>18.5</span>
                    <span>25.0</span>
                    <span>30.0</span>
                  </div>
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-400" style={{ width: '20%' }} />
                    <div className="h-full bg-green-500" style={{ width: '30%' }} />
                    <div className="h-full bg-orange-400" style={{ width: '20%' }} />
                    <div className="h-full bg-red-500" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                <FaCalculator className="text-gray-300 text-6xl" />
                <p className="text-gray-400 font-medium italic">Hesaplama yapmak için bilgilerinizi girin.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tracker Form & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    <FaHistory className="text-green-600" />
                    <span>Kilo Geçmişi</span>
                  </h2>
                  {weightHistory.length > 0 && (
                    <button 
                      onClick={clearWeightHistory}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold mt-1 flex items-center transition-colors"
                    >
                      <FaHistory className="mr-1 scale-75" />
                      Geçmişi Temizle
                    </button>
                  )}
                </div>
                <div className="flex flex-col space-y-2 w-full sm:w-auto">
                  <input 
                    type="date"
                    value={currentDateInput}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCurrentDateInput(e.target.value)}
                    className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex space-x-2">
                    <input 
                      type="number"
                      value={currentWeightInput}
                      onChange={(e) => setCurrentWeightInput(e.target.value)}
                      placeholder="Yeni Kilo"
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button 
                      onClick={addWeightRecord}
                      className="h-10 px-4 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="h-64 w-full">
                {weightHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                        labelStyle={{fontWeight: 'bold', color: '#16a34a'}}
                      />
                      {targetWeight && (
                        <ReferenceLine y={parseFloat(targetWeight)} stroke="#16a34a" strokeDasharray="5 5" label={{ position: 'right', value: `Hedef: ${targetWeight}`, fill: '#16a34a', fontSize: 10 }} />
                      )}
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#16a34a" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, fill: '#16a34a' }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <FaChartLine size={48} className="opacity-20" />
                    <p>Henüz veri yok.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Target Card */}
            <div className="bg-green-600 p-8 rounded-3xl text-white shadow-lg shadow-green-100 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Hedef Kilonuz</h3>
                <div className="relative">
                  <input 
                    type="number"
                    value={targetWeight}
                    onChange={(e) => {
                      setTargetWeight(e.target.value);
                      saveToLocal({ targetWeight: e.target.value });
                    }}
                    placeholder="Hedef kg"
                    className="w-full bg-white/20 border border-white/30 rounded-2xl h-14 px-4 text-white placeholder:text-white/50 outline-none focus:bg-white/30 transition-all font-bold text-2xl"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold opacity-50">KG</span>
                </div>
              </div>

              {weight && targetWeight && (
                <div className="mt-8 space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>İlerleme</span>
                    <span>
                      {(() => {
                        if (weightHistory.length < 2) return '0%';
                        const start = weightHistory[0].weight;
                        const current = weightHistory[weightHistory.length - 1].weight;
                        const target = parseFloat(targetWeight);
                        
                        if (start === target) return '100%';
                        // Progress = (Kayıp / Toplam Hedef Kayıp)
                        const totalToLose = start - target;
                        const lostSoFar = start - current;
                        
                        if (totalToLose === 0) return '100%';
                        const progress = (lostSoFar / totalToLose) * 100;
                        return `${Math.min(100, Math.max(0, progress)).toFixed(0)}%`;
                      })()}
                    </span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-1000" 
                      style={{ 
                        width: `${(() => {
                          if (weightHistory.length < 2) return 0;
                          const start = weightHistory[0].weight;
                          const current = weightHistory[weightHistory.length - 1].weight;
                          const target = parseFloat(targetWeight);
                          
                          if (start === target) return 100;
                          const totalToLose = start - target;
                          const lostSoFar = start - current;
                          
                          if (totalToLose === 0) return 100;
                          const progress = (lostSoFar / totalToLose) * 100;
                          return Math.min(100, Math.max(0, progress));
                        })()}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-green-100 italic mt-4 text-center">
                    {parseFloat(weight) > parseFloat(targetWeight) 
                      ? `Hedefe ${(parseFloat(weight) - parseFloat(targetWeight)).toFixed(1)} kg kaldı! Vazgeçme!` 
                      : parseFloat(weight) < parseFloat(targetWeight)
                        ? `Hedefin üzerinde ${(parseFloat(targetWeight) - parseFloat(weight)).toFixed(1)} kg varsın! Devam et!`
                        : `Tebrikler! Hedef kilonuza ulaştınız!`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default BMICalculator;
