import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ checkLoggedIn = true }) => {
  const { currentUser, loading } = useAuth();

  // Loading durumunda bir şey gösterme (veya loading spinner eklenebilir)
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>;
  }

  if (checkLoggedIn) {
    // Giriş yapmamış kullanıcıları kontrol et (Login/Register için)
    // Eğer kullanıcı giriş yapmışsa dashboard'a yönlendir
    if (currentUser) {
      return <Navigate to="/dashboard" />;
    }
    // Yoksa login/register sayfalarına erişebilir (Outlet)
    return <Outlet />;
  } else {
    // Giriş yapmış kullanıcıları kontrol et (Dashboard ve diğer sayfalar için)
    // Eğer kullanıcı giriş yapmamışsa login'e yönlendir
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    // Giriş yapmışsa korunan sayfaları göster (Outlet)
    return <Outlet />;
  }
};

export default ProtectedRoute;
