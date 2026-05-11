import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { FaBars, FaLeaf } from 'react-icons/fa';
import Sidebar from './Sidebar';
import AssistantChat from './AssistantChat';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar automatically on navigation (Mobile UX)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Mobile and Desktop versions integrated */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area - Scrollable Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        <main className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
          {/* Header - Moved inside scrollable area to solve "stuck" issues and allow hiding on scroll */}
          <header className="
            bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10
            lg:h-20 lg:px-10 flex-shrink-0 pt-[env(safe-area-inset-top)]
          ">
            <div className="flex items-center space-x-4">
              {/* Hamburger Icon for Mobile */}
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Menüyü Aç"
              >
                <FaBars size={24} />
              </button>
              
              {/* Logo and Name for Mobile Header */}
              <Link to="/dashboard" className="flex items-center space-x-2 text-green-600 font-bold text-xl lg:hidden">
                <FaLeaf />
                <span>FitAsistan</span>
              </Link>

              {/* Title/Section Placeholder for Desktop */}
              <div className="hidden lg:block">
                <h2 className="text-xl font-bold text-gray-800">Hoş Geldiniz</h2>
              </div>
            </div>

            {/* Right Header Icons */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                M
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-6 lg:p-10 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <Outlet />
          </div>
        </main>
        
        {/* Floating AI Assistant Chatbot */}
        <AssistantChat />
      </div>

      {/* Global CSS for Capacitor safe-area-inset support */}
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
