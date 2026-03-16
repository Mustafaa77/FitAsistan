import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
          <Routes>
            {/* Login ve Register sayfaları, sadece giriş yapmamış kullanıcılara açık */}
            <Route element={<ProtectedRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Dashboard haftaya yapılacak, şimdilik yönlendirme yapıyoruz */}
            <Route path="/dashboard" element={
              <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl font-bold text-green-600">Dashboard (Gelecek Hafta)</h1>
              </div>
            } />

            {/* Varsayılan yönlendirme */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
