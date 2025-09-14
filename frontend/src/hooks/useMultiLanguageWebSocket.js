import { useState, useEffect, useRef, useCallback } from 'react';

const useMultiLanguageWebSocket = (roomId, userId, userLanguage) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!roomId || !userId || !userLanguage) return;
    
    // Prevent multiple simultaneous connections
    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connecting or connected, skipping...');
      return;
    }

    try {
      const wsUrl = `ws://localhost:8000/api/v2/ws/multi-language/${roomId}`;
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected to room:', roomId);
        console.log('User info:', { userId, userLanguage });
        
        // Send initial connection message with user info
        ws.send(JSON.stringify({
          user_id: userId,
          language: userLanguage
        }));
        // Optimistically add self to users
        setRoomUsers(prev => {
          const exists = prev.find(u => u.user_id === userId);
          return exists ? prev : [...prev, { user_id: userId, language: userLanguage }];
        });

        // Fetch current users list
        fetch(`http://localhost:8000/api/v2/rooms/${roomId}/users`).then(r => r.json()).then(data => {
          console.log('Fetched room users:', data);
          if (Array.isArray(data.users)) {
            setRoomUsers(data.users);
          }
        }).catch(() => {});

        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);

          switch (data.type) {
            case 'connected':
              console.log('Successfully connected to room');
              // Ensure own presence
              setRoomUsers(prev => {
                const exists = prev.find(u => u.user_id === data.user_id);
                return exists ? prev : [...prev, { user_id: data.user_id, language: data.language }];
              });
              break;
              
            case 'message':
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                user_id: data.user_id,
                content: data.content,
                original_content: data.original_content,
                language: data.language,
                is_original: data.is_original,
                timestamp: data.timestamp || new Date().toISOString()
              }]);
              break;
              
            case 'user_joined':
              setRoomUsers(prev => {
                const exists = prev.find(u => u.user_id === data.user_id);
                if (!exists) {
                  return [...prev, { user_id: data.user_id, language: data.language }];
                }
                return prev;
              });
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                type: 'system',
                content: data.message,
                timestamp: new Date().toISOString()
              }]);
              break;
              
            case 'user_left':
              setRoomUsers(prev => prev.filter(u => u.user_id !== data.user_id));
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                type: 'system',
                content: data.message,
                timestamp: new Date().toISOString()
              }]);
              break;
              
            case 'typing':
              // Handle typing indicators if needed
              break;
              
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);

        // Only attempt to reconnect if not intentionally closed and not already reconnecting
        if (event.code !== 1000 && 
            event.code !== 1001 && // going away
            event.code !== 1005 && // no status code
            !isReconnecting && 
            reconnectAttemptsRef.current < maxReconnectAttempts) {
          setIsReconnecting(true);
          reconnectAttemptsRef.current += 1;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
          setTimeout(() => {
            if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
              connect();
            }
          }, 2000 * reconnectAttemptsRef.current);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [roomId, userId, userLanguage]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, 'User disconnected');
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const sendMessage = useCallback((content) => {
    if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'chat',
        content: content,
        timestamp: new Date().toISOString()
      };
      console.log('Sending message:', message);
      console.log('Current user language:', userLanguage);
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [socket, isConnected, userLanguage]);

  // Speak translated messages in user's language
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    // Only speak messages that are targeted to this language and not sent by me
    if (last.user_id !== userId && last.language === userLanguage && !last.is_original) {
      const utterance = new SpeechSynthesisUtterance(last.content);
      
      // Map language codes to proper BCP-47 codes for TTS
      const languageMap = {
        'en': 'en-US',
        'es': 'es-ES', 
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'ko': 'ko-KR'
      };
      
      utterance.lang = languageMap[userLanguage] || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      console.log(`Speaking translated message in ${utterance.lang}: ${last.content}`);
      try { 
        window.speechSynthesis.speak(utterance); 
      } catch (error) {
        console.error('TTS error:', error);
      }
    }
  }, [messages, userId, userLanguage]);

  const sendTyping = useCallback((isTyping) => {
    if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }));
    }
  }, [socket, isConnected]);

  // Connect when dependencies change
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [roomId, userId, userLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close(1000, 'Component unmounted');
      }
    };
  }, [socket]);

  return {
    isConnected,
    messages,
    roomUsers,
    isReconnecting,
    sendMessage,
    sendTyping,
    connect,
    disconnect
  };
};

export default useMultiLanguageWebSocket;
