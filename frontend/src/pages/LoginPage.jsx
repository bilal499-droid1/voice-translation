import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Key, User, Eye, EyeOff } from 'lucide-react';
import { auth, utils } from '../utils/helpers';
import { endpoints } from '../utils/api';
import toast from 'react-hot-toast';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    apiKey: import.meta.env.VITE_DEFAULT_API_KEY || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.username.trim()) {
        toast.error('Please enter a username');
        return;
      }

      if (!utils.isValidApiKey(formData.apiKey)) {
        toast.error('Please enter a valid API key');
        return;
      }

      // Test connection to backend
      await endpoints.health();

      // Store credentials
      auth.login(formData.username, formData.apiKey);

      toast.success('Welcome to Voice AI Bot!');
      onLogin();
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Failed to connect to backend. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-80" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="glass-dark-panel p-10 w-full max-w-md"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                <User className="w-8 h-8 text-gray-300" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Voice AI Bot</h1>
            <p className="text-gray-400">Multi-Voice Conversations with AI</p>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-3">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="dark-input pl-12"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* API Key Field */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-3">
                API Key
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="apiKey"
                  type={showPassword ? "text" : "password"}
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="dark-input pl-12 pr-12"
                  placeholder="Enter your API key"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              className="dark-btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Connect to Voice AI</span>
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-400 mb-4">Features:</p>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Real-time Voice Chat</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Multi-Speaker Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Emotion Detection</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Conversation Memory</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;