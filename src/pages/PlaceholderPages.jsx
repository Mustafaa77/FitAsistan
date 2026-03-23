import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-fade-in">
      <div className="bg-green-100 p-8 rounded-full text-green-600 mb-4">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-500 max-w-md">Bu özellik şu anda geliştirme aşamasındadır ve çok yakında FitAsistan'a eklenecektir!</p>
      
      {/* Lab Requirement Placeholder (simple input/button) */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Geliştirici Notu Ekle (Lab Ödevi)</label>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Görüşünüzü bildirin..." 
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Gönder
          </button>
        </div>
      </div>
      
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

export const BMICalculator = () => <PlaceholderPage title="BKI Hesaplama" />;
export const CreateDiet = () => <PlaceholderPage title="Diyet Oluştur" />;
export const Recipes = () => <PlaceholderPage title="Yemek Tarifleri" />;
export const Calories = () => <PlaceholderPage title="Kaç Kalori" />;
export const DietPlan = () => <PlaceholderPage title="Diyet Planı" />;
export const HealthDiary = () => <PlaceholderPage title="Sağlık Günlüğü" />;
export const Profile = () => <PlaceholderPage title="Profil" />;

export default PlaceholderPage;
