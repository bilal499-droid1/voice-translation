import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, History, LogOut, Users, Brain, Mic2, MessageSquare, Activity, Volume2 } from 'lucide-react';
import { auth, utils } from '../utils/helpers';
import { VoiceWebSocket } from '../utils/websocket';
import ChatWindow from '../components/ChatWindow';
import VoiceRecorder from '../components/VoiceRecorder';
import SettingsPanel from '../components/SettingsPanel';
import SessionHistory from '../components/SessionHistory';
import ConnectionStatus from '../components/ConnectionStatus';
import toast from 'react-hot-toast';

const Dashboard = ({ onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [speakers, setSpeakers] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const wsRef = useRef(null);
  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    initializeSession();
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, []);

  const initializeSession = async () => {
    try {
      // Only connect if API key exists (user logged in)
      if (!currentUser?.apiKey) {
        toast.error('Please log in to start a voice session');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        return;
      }
      const sessionId = utils.generateSessionId();
      setCurrentSession(sessionId);
      
      // Initialize WebSocket connection
      wsRef.current = new VoiceWebSocket(
        sessionId,
        handleWebSocketMessage,
        handleWebSocketError,
        handleWebSocketConnect,
        handleWebSocketDisconnect
      );
      
      wsRef.current.connect();
      
      // Add welcome message
      addMessage({
        id: Date.now(),
        content: `Welcome ${currentUser.username}! Start a conversation by clicking the microphone or typing a message.`,
        speaker: 'System',
        type: 'system',
        timestamp: new Date().toISOString(),
        emotion: 'neutral'
      });
      
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast.error('Failed to initialize voice session');
    }
  };

  const handleWebSocketMessage = (data) => {
    console.log('WebSocket message received:', data);
    
    switch (data.type) {
      case 'auth_ok':
        setIsConnected(true);
        setConnectionStatus('authenticated');
        toast.success('WebSocket authenticated');
        break;
      case 'echo':
        // no-op, debug echo
        break;
      case 'info':
        if (data.message) toast.success(data.message);
        break;
      case 'error':
        if (data.message) toast.error(data.message);
        break;
      case 'transcription':
        addMessage({
          id: Date.now(),
          content: data.text,
          speaker: data.speaker_id || 'You',
          type: 'transcription',
          timestamp: new Date().toISOString(),
          emotion: data.emotion || 'neutral'
        });
        break;
        
      case 'response':
        addMessage({
          id: Date.now(),
          content: data.text,
          speaker: 'AI Assistant',
          type: 'response',
          timestamp: new Date().toISOString(),
          emotion: data.emotion || 'neutral'
        });
        
        // Play audio response if available
        if (data.audio) {
          playAudioResponse(data.audio);
        }
        break;
        
      case 'speaker_joined':
        setSpeakers(prev => [...prev, data.speaker]);
        toast.success(`${data.speaker.name} joined the conversation`);
        break;
        
      case 'speaker_left':
        setSpeakers(prev => prev.filter(s => s.id !== data.speaker_id));
        toast.info(`Speaker left the conversation`);
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const handleWebSocketConnect = () => {
    setIsConnected(true);
    setConnectionStatus('connected');
    toast.success('Connected to Voice AI Bot');
  };

  const handleWebSocketDisconnect = () => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    toast.error('Disconnected from Voice AI Bot');
  };

  const handleWebSocketError = (error) => {
    console.error('WebSocket error:', error);
    setConnectionStatus('error');
    toast.error('Connection error occurred');
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleAudioMessage = async (audioBlob) => {
    try {
      // Show placeholder
      addMessage({
        id: Date.now(),
        content: 'Processing voice input...',
        speaker: 'You',
        type: 'processing',
        timestamp: new Date().toISOString(),
        emotion: 'neutral',
        sender_type: 'user'
      });

      // Transcribe via HTTP
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      const transcribeRes = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        headers: { 'X-API-Key': localStorage.getItem('voice_ai_api_key') || 'fast_API_KEY' },
        body: formData
      });
      if (!transcribeRes.ok) throw new Error('Transcription failed');
      const tr = await transcribeRes.json();
      const text = tr.transcription || tr.text || '';

      // Show user transcription
      addMessage({
        id: Date.now(),
        content: text,
        speaker: 'You',
        type: 'transcription',
        timestamp: new Date().toISOString(),
        emotion: 'neutral',
        sender_type: 'user'
      });

      // Chat via HTTP
      const chatRes = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': localStorage.getItem('voice_ai_api_key') || 'fast_API_KEY'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: text }]
        })
      });
      if (!chatRes.ok) throw new Error('Chat failed');
      const ai = await chatRes.json();
      addMessage({
        id: Date.now(),
        content: ai.reply,
        speaker: 'AI Assistant',
        type: 'response',
        timestamp: new Date().toISOString(),
        emotion: 'neutral',
        sender_type: 'bot'
      });
    } catch (e) {
      console.error('Voice processing failed:', e);
      toast.error('Voice processing failed');
    }
  };

  const handleTextMessage = async (text) => {
    if (!text.trim()) return;
    addMessage({
      id: Date.now(),
      content: text,
      speaker: 'You',
      type: 'text',
      timestamp: new Date().toISOString(),
      emotion: 'neutral',
      sender_type: 'user'
    });
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': localStorage.getItem('voice_ai_api_key') || 'fast_API_KEY'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: text }]
        })
      });
      if (!response.ok) throw new Error('Chat failed');
      const ai = await response.json();
      addMessage({
        id: Date.now(),
        content: ai.reply,
        speaker: 'AI Assistant',
        type: 'response',
        timestamp: new Date().toISOString(),
        emotion: 'neutral',
        sender_type: 'bot'
      });
    } catch (e) {
      console.error('Chat failed:', e);
      toast.error('Chat failed');
    }
  };

  const playAudioResponse = (audioData) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${audioData}`);
      audio.play();
    } catch (error) {
      console.error('Failed to play audio response:', error);
    }
  };

  const handleLogout = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
    auth.logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-80" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark-panel m-6 p-6 flex items-center justify-between"
        >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
            <Mic2 className="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Voice AI Bot</h1>
            <p className="text-sm text-gray-400">Welcome, {currentUser.username}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'}`} />
            <span className={`text-sm font-medium ${connectionStatus === 'connected' ? 'text-green-400' : connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`}>
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
          
          {/* Speakers Count */}
          <div className="flex items-center space-x-2 text-sm text-gray-400 bg-black/30 px-3 py-1 rounded-lg">
            <Users className="w-4 h-4" />
            <span>{speakers.length + 1}</span>
          </div>
          
          {/* Action Buttons */}
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(true)}
            className="dark-action-btn"
            title="Session History"
          >
            <History className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="dark-action-btn"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          {/* Navigate to simple multi-language room */}
          <motion.a
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            href="/simple-ml"
            className="dark-action-btn"
            title="Multi-Language Chat"
          >
            <Users className="w-5 h-5" />
          </motion.a>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="dark-action-btn text-red-400 hover:text-red-300"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-6 mb-6 grid grid-cols-3 gap-4"
      >
        <div className="glass-dark-panel p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Messages</p>
            <p className="text-xl font-semibold text-white">{messages.length}</p>
          </div>
        </div>
        
        <div className="glass-dark-panel p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Session</p>
            <p className="text-xl font-semibold text-white">{currentSession ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        
        <div className="glass-dark-panel p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Recording</p>
            <p className="text-xl font-semibold text-white">{isRecording ? 'On' : 'Off'}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-6 pb-6">
        {/* Chat Window */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col"
        >
          <ChatWindow
            messages={messages}
            onSendMessage={handleTextMessage}
            isConnected={isConnected}
            speakers={speakers}
          />
        </motion.div>

        {/* Voice Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-80"
        >
          <VoiceRecorder
            onAudioMessage={handleAudioMessage}
            isConnected={isConnected}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
          <div className="text-xs text-gray-400 mt-2">
            Voice in this dashboard performs on-demand transcription and AI chat (not translation).
            For real-time 2-person translation with TTS, use the Simple Multi-Language page (top-right icon).
          </div>
        </motion.div>
      </div>
      </div>

      {/* Panels */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            sessionId={currentSession}
          />
        )}
        
        {showHistory && (
          <SessionHistory
            onClose={() => setShowHistory(false)}
            currentSession={currentSession}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
