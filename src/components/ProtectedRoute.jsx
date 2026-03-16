import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();

  // Eğer kullanıcı giriş yapmışsa, dashboard'a yönlendir
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  // Kullanıcı giriş yapmamışsa, login/register sayfalarına erişebilir (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
