import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Settings } from 'lucide-react';
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

const SimpleMultiLanguageDashboard = ({ user, onLogout }) => {
  const [roomId, setRoomId] = useState('demo-room');
  const [userId, setUserId] = useState(user?.username || 'user-' + Math.random().toString(36).substr(2, 9));
  const [userLanguage, setUserLanguage] = useState('en');
  const [isSetup, setIsSetup] = useState(false);
  const [messageText, setMessageText] = useState('');

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

  // Voice input: capture mic and send STT->WS
  const handleVoiceToText = async () => {
    try {
      console.log('Starting voice input...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => { 
        if (e.data.size > 0) chunks.push(e.data); 
      };
      
      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', blob, 'audio.webm');
          
          console.log('Sending audio for transcription...');
          const stt = await fetch('http://localhost:8000/transcribe', {
            method: 'POST',
            headers: { 'X-API-Key': localStorage.getItem('voice_ai_api_key') || 'fast_API_KEY' },
            body: formData
          });
          
          if (stt.ok) {
            const data = await stt.json();
            const text = data.transcription || data.text || '';
            console.log('Transcription result:', text);
            if (text) {
              sendMessage(text);
            } else {
              console.warn('No transcription text received');
            }
          } else {
            console.error('Transcription failed:', stt.status, stt.statusText);
          }
        } catch (error) {
          console.error('Error processing voice input:', error);
        } finally {
          stream.getTracks().forEach(t => t.stop());
        }
      };
      
      mediaRecorder.start();
      console.log('Recording started, will stop in 3 seconds...');
      setTimeout(() => {
        mediaRecorder.stop();
        console.log('Recording stopped');
      }, 3000);
    } catch (error) {
      console.error('Voice input failed:', error);
      alert('Voice input failed. Please check microphone permissions.');
    }
  };
}
export default SimpleMultiLanguageDashboard;