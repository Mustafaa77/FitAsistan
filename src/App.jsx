import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BMICalculator from './pages/BMICalculator';
import HealthDiary from './pages/HealthDiary';
import Settings from './pages/Settings';
import Recipes from './pages/Recipes';
import VerifyEmail from './pages/VerifyEmail';
import CalorieSearch from './pages/CalorieSearch';
import DietGenerator from './pages/DietGenerator';
import DietPlan from './pages/DietPlan';
import { Profile } from './pages/PlaceholderPages';
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
              <Route element={<ProtectedRoute checkLoggedIn={true} />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route element={<ProtectedRoute checkLoggedIn={false} />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/bmi" element={<BMICalculator />} />
                  <Route path="/create-diet" element={<DietGenerator />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/calories" element={<CalorieSearch />} />
                  <Route path="/diet-plan" element={<DietPlan />} />
                  <Route path="/health-diary" element={<HealthDiary />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

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
