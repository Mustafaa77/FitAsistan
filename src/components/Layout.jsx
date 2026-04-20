import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars, FaLeaf } from 'react-icons/fa';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Mobile and Desktop versions integrated */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header - Fixed for Mobile, Sticky for Desktop if needed */}
        <header className="
          bg-white shadow-sm h-16 flex items-center justify-between px-6 z-20
          lg:h-20 lg:px-10 sticky top-0 flex-shrink-0 pt-[env(safe-area-inset-top)]
        ">
          <div className="flex items-center space-x-4">
            {/* Hamburger Icon for Mobile */}
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
            >
              <FaBars size={24} />
            </button>
            
            {/* Logo and Name for Mobile Header */}
            <div className="flex items-center space-x-2 text-green-600 font-bold text-xl lg:hidden">
              <FaLeaf />
              <span>FitAsistan</span>
            </div>

            {/* Title/Section Placeholder for Desktop */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold text-gray-800">Hoş Geldiniz</h2>
            </div>
          </div>

          {/* Right Header Icons (Notification, User, etc.) Placeholder */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
              M
            </div>
          </div>
        </header>

        {/* Dynamic Content Rendering */}
        <main className="
          flex-1 overflow-y-auto p-6 bg-gray-50 
          lg:p-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))]
        ">
          {/* Outlet for nested route components */}
          <Outlet />
        </main>
      </div>

      {/* CSS for Capacitor safe-area-inset support */}
      <style>{`
        .safe-area-inset-top {
          padding-top: env(safe-area-inset-top);
        }
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default Layout;
