import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Send, Home } from 'lucide-react';
import useMultiLanguageWebSocket from '../hooks/useMultiLanguageWebSocket';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
];

const SimpleMultiLanguageDashboard = ({ user }) => {
  const [roomId, setRoomId] = useState('demo-room');
  const [userId, setUserId] = useState(user?.username || 'user-' + Math.random().toString(36).substr(2, 9));
  const [userLanguage, setUserLanguage] = useState('en');
  const [isSetup, setIsSetup] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const {
    isConnected,
    messages,
    roomUsers,
    isReconnecting,
    sendMessage,
    sendTyping
  } = useMultiLanguageWebSocket(
    isSetup ? roomId : null,
    userId,
    userLanguage
  );

  const handleJoinRoom = () => {
    if (!roomId || !userId || !userLanguage) return;
    setIsSetup(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    sendMessage(messageText);
    setMessageText('');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLanguageFlag = (code) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.flag : '🌐';
  };

  const getLanguageName = (code) => {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : code.toUpperCase();
  };

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-80" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="glass-dark-panel p-10 w-full max-w-lg"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                  <Globe className="w-8 h-8 text-gray-300" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Multi-Language Chat</h1>
              <p className="text-gray-400">Real-time translation between languages</p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onSubmit={(e) => { e.preventDefault(); handleJoinRoom(); }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Room ID</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="dark-input"
                  placeholder="Enter room ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Your Name</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="dark-input"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Your Language</label>
                <select
                  value={userLanguage}
                  onChange={(e) => setUserLanguage(e.target.value)}
                  className="dark-input"
                  required
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-gray-800 text-white">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="dark-btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Join Room</span>
              </motion.button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <motion.a
                href="/dashboard"
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Home className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-80" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark-panel m-6 p-6 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
              <Globe className="w-6 h-6 text-gray-300" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Multi-Language Chat</h1>
              <p className="text-sm text-gray-400">Room: {roomId} • {getLanguageName(userLanguage)} {getLanguageFlag(userLanguage)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : isReconnecting ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : isReconnecting ? 'text-yellow-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting...' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400 bg-black/30 px-3 py-1 rounded-lg">
              <Users className="w-4 h-4" />
              <span>{roomUsers.length}</span>
            </div>
            
            <motion.a
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              href="/dashboard"
              className="dark-action-btn"
              title="Back to Dashboard"
            >
              <Home className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 mx-6 mb-6"
        >
          <div className="glass-dark-panel h-96 p-6 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide mb-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.user_id === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.type === 'system' 
                        ? 'bg-gray-700/50 text-gray-300 text-center text-sm'
                        : message.user_id === userId 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-gray-700/80 text-gray-100'
                    }`}>
                      {message.type !== 'system' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-medium opacity-75">
                            {message.user_id} {getLanguageFlag(message.language)}
                          </span>
                          {!message.is_original && (
                            <span className="text-xs bg-black/20 px-2 py-1 rounded-full">
                              Translated
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      {message.original_content && message.original_content !== message.content && (
                        <p className="text-xs opacity-60 mt-1 italic">
                          Original: {message.original_content}
                        </p>
                      )}
                      <p className="text-xs opacity-50 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Type a message in ${getLanguageName(userLanguage)}...`}
                className="flex-1 dark-input py-3"
                disabled={!isConnected}
              />
              
              <motion.button
                type="submit"
                disabled={!isConnected || !messageText.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-all duration-300"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
        </motion.div>

        {roomUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-6 mb-6"
          >
            <div className="glass-dark-panel p-4">
              <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Online Users ({roomUsers.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {roomUsers.map((user, index) => (
                  <div
                    key={user.user_id || index}
                    className="flex items-center space-x-2 bg-black/30 px-3 py-2 rounded-lg text-sm text-gray-300"
                  >
                    <span>{getLanguageFlag(user.language)}</span>
                    <span>{user.user_id}</span>
                    <span className="text-xs opacity-60">({getLanguageName(user.language)})</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SimpleMultiLanguageDashboard;