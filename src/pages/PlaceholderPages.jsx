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

export const CreateDiet = () => <PlaceholderPage title="Diyet Oluştur" />;
export const Calories = () => <PlaceholderPage title="Kaç Kalori" />;
export const DietPlan = () => <PlaceholderPage title="Diyet Planı" />;
export const Profile = () => <PlaceholderPage title="Profil" />;

export default PlaceholderPage;
