import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VerifyEmail from './pages/VerifyEmail';
import { 
  BMICalculator, CreateDiet, Recipes, Calories, 
  DietPlan, HealthDiary, Profile 
} from './pages/PlaceholderPages';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 font-sans antialiased">
            <Toaster position="top-center" reverseOrder={false} />
            <Routes>
              {/* Login ve Register sayfaları, sadece giriş yapmamış kullanıcılara açık */}
              <Route element={<ProtectedRoute checkLoggedIn={true} />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Verify Email sayfası (Kayıt olanlar için) */}
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Dashboard ve diğer sayfalar, sadece giriş yapmış kullanıcılara açık (Layout ile sarmalanmış) */}
              <Route element={<ProtectedRoute checkLoggedIn={false} />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/bmi" element={<BMICalculator />} />
                  <Route path="/create-diet" element={<CreateDiet />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/calories" element={<Calories />} />
                  <Route path="/diet-plan" element={<DietPlan />} />
                  <Route path="/health-diary" element={<HealthDiary />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* Varsayılan yönlendirme */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
