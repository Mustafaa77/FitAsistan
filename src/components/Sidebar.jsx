import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaUtensils, FaBook, FaCalculator, FaCalendarAlt, 
  FaNotesMedical, FaUser, FaSignOutAlt, FaLeaf, FaTimes 
} from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
    { name: 'Diyet Oluştur', path: '/create-diet', icon: <FaUtensils /> },
    { name: 'Yemek Tarifleri', path: '/recipes', icon: <FaBook /> },
    { name: 'Kaç Kalori', path: '/calories', icon: <FaLeaf /> },
    { name: 'VKİ Hesaplama', path: '/bmi', icon: <FaCalculator /> },
    { name: 'Diyet Planı', path: '/diet-plan', icon: <FaCalendarAlt /> },
    { name: 'Sağlık Günlüğü', path: '/health-diary', icon: <FaNotesMedical /> },
    { name: 'Profil', path: '/profile', icon: <FaUser /> },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0 lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          {/* Header in Sidebar for Mobile */}
          <div className="flex items-center justify-between p-6 border-b lg:hidden">
            <div className="flex items-center space-x-2 text-green-600 font-bold text-xl">
              <FaLeaf />
              <span>FitAsistan</span>
            </div>
            <button onClick={toggleSidebar} className="text-gray-500">
              <FaTimes size={24} />
            </button>
          </div>

          {/* Desktop Logo Placeholder */}
          <div className="hidden lg:flex items-center space-x-2 p-8 text-green-600 font-bold text-2xl border-b">
            <FaLeaf />
            <span>FitAsistan</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`
                  flex items-center space-x-4 px-4 py-3 rounded-xl transition-colors
                  ${location.pathname === item.path 
                    ? 'bg-green-50 text-green-600 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-4 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
              <FaSignOutAlt className="text-xl" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
