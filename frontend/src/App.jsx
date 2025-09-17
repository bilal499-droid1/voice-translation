import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MultiLanguageDashboard from './pages/MultiLanguageDashboard';
import SimpleMultiLanguageDashboard from './pages/SimpleMultiLanguageDashboard';
import { getStoredToken, removeStoredToken } from './utils/helpers';
import { useNotifications } from './hooks/useNotifications';
import Notifications from './components/Notifications';
import './styles/globals.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { notifications, addNotification, dismissNotification } = useNotifications();

  useEffect(() => {
    // Check for stored authentication
    const checkAuth = async () => {
      const apiKey = import.meta.env.VITE_DEFAULT_API_KEY || 'fast_API_KEY';
      if (apiKey) {
        try {
          // Validate API key with backend
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: {
              'X-API-Key': apiKey
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser({ username: 'User', ...userData });
            setIsAuthenticated(true);
            addNotification({
              type: 'success',
              title: 'Welcome back!',
              message: `Connected successfully`,
              duration: 3000,
              autoDismiss: true
            });
          } else {
            // API key is invalid
            addNotification({
              type: 'warning',
              title: 'API Key Invalid',
              message: 'Please check your API configuration',
              duration: 5000,
              autoDismiss: true
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          addNotification({
            type: 'error',
            title: 'Connection error',
            message: 'Failed to verify authentication',
            duration: 5000,
            autoDismiss: true
          });
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [addNotification]);

  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    addNotification({
      type: 'success',
      title: 'Login successful',
      message: `Welcome, ${userData.username}!`,
      duration: 3000,
      autoDismiss: true
    });
  };

  const handleLogout = () => {
    removeStoredToken();
    setUser(null);
    setIsAuthenticated(false);
    addNotification({
      type: 'info',
      title: 'Logged out',
      message: 'You have been logged out successfully',
      duration: 3000,
      autoDismiss: true
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Loading Multi Voice</h2>
          <p className="text-slate-400">Preparing your voice AI experience...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginPage onLogin={handleLogin} />
                  </motion.div>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard user={user} onLogout={handleLogout} />
                  </motion.div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            
            <Route
              path="/multi-language"
              element={
                <motion.div
                  key="multi-language"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MultiLanguageDashboard user={user || {username: 'Guest'}} onLogout={handleLogout} />
                </motion.div>
              }
            />

            <Route
              path="/simple-ml"
              element={
                <motion.div
                  key="simple-ml"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SimpleMultiLanguageDashboard user={user || {username: 'Guest'}} />
                </motion.div>
              }
            />
            
            <Route
              path="/"
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              }
            />
          </Routes>
        </AnimatePresence>

        {/* Global notifications */}
        <Notifications
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </div>
    </Router>
  );
}

export default App;
