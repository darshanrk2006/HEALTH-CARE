// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PrescriptionAnalyzer from './components/prescription/PrescriptionAnalyzer';
import ReportAnalyzer from './components/report/ReportAnalyzer';
import HealthAnalyzerHub from './components/analyzer/HealthAnalyzerHub';
import DiseaseDetection from './components/disease-detection/DiseaseDetection';
import BPMonitor from './components/bp-monitor/BPMonitor';
import HealthMonitor from './components/health-monitor/HealthMonitor';
import MentalHealthSupport from './components/mentalhealth/MentalHealthSupport';
import RuralHealthcare from './components/rural-healthcare/RuralHealthcare';
import HospitalCoordination from './components/hospital-coordination/HospitalCoordination';
import Settings from './components/settings/Settings';
import Chatbot from './components/chatbot/Chatbot';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Toaster } from 'react-hot-toast';
import './styles/globals.css';
import './App.css';

const GOOGLE_CLIENT_ID = '707844678299-hrve6vdl3hlrc20breuegb67mu6tv4al.apps.googleusercontent.com';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Admin Routes (Isolated from patient authentication)
  if (location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    );
  }

  const isLoginPage = location.pathname === '/login';

  if (!isAuthenticated) {
    if (!isLoginPage) {
      return <Navigate to="/login" replace />;
    }
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (isLoginPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyzer" element={<HealthAnalyzerHub />} />
          <Route path="/prescription" element={<HealthAnalyzerHub defaultMode="prescription" />} />
          <Route path="/report" element={<HealthAnalyzerHub defaultMode="report" />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/bp-monitor" element={<BPMonitor />} />
          <Route path="/records" element={<HealthMonitor />} />
          <Route path="/health-monitor" element={<HealthMonitor />} />
          <Route path="/mental-health" element={<MentalHealthSupport />} />
          <Route path="/rural-healthcare" element={<RuralHealthcare />} />
          <Route path="/hospital-coordination" element={<HospitalCoordination />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
      <Chatbot />
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AdminAuthProvider>
          <AuthProvider>
            <SettingsProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
            <Router>
              <ScrollToTop />
              <MainRoutes />
            </Router>
          </SettingsProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
  );
}

export default App;