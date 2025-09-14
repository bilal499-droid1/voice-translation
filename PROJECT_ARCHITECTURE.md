# Multi-Voice Project Architecture

## Overview
A real-time voice translation application that enables two users to communicate in different languages with live voice translation.

## Core Features
- **Real-time Voice Translation**: Convert speech to text, translate, and convert back to speech
- **Multi-language Support**: Support for multiple languages (English, Spanish, French, German, etc.)
- **Room-based Communication**: Users join rooms for private conversations
- **Voice-to-Text**: Speech recognition using OpenAI Whisper API
- **Text-to-Speech**: Browser-based speech synthesis for translated audio
- **AI Chat**: Groq-powered AI assistant for text conversations

## Architecture

### Backend (`backend/`)
**FastAPI Application**
- **Main Entry**: `main.py` - FastAPI server with CORS and WebSocket support
- **Authentication**: API key-based security system
- **Routes**:
  - `/transcribe` - Audio transcription endpoint
  - `/chat` - AI chat completions
  - `/api/v2/ws/multi-language/{room_id}` - WebSocket for real-time translation
- **Services**:
  - `stt_service.py` - Speech-to-text using OpenAI Whisper
  - `chat_service.py` - AI chat using Groq LLaMA models
  - `groq_client.py` - Groq API integration
- **Database**: SQLite with SQLAlchemy ORM
- **Models**: Chat, transcription, and user session models

### Frontend (`frontend/`)
**React + Vite Application**
- **Pages**:
  - `LoginPage.jsx` - API key authentication
  - `Dashboard.jsx` - Single-language AI chat
  - `SimpleMultiLanguageDashboard.jsx` - Multi-language voice translation
- **Components**:
  - `VoiceRecorder.jsx` - Audio recording and playback
  - `ChatBubble.jsx` - Message display
  - `ConnectionStatus.jsx` - WebSocket connection status
- **Hooks**:
  - `useMultiLanguageWebSocket.js` - Real-time translation WebSocket
  - `useWebSocket.js` - General WebSocket management
- **Utils**:
  - `api.js` - HTTP API calls
  - `websocket.js` - WebSocket utilities

## Data Flow

### Voice Translation Flow
1. **User A** speaks in their native language
2. **Frontend** records audio using MediaRecorder API
3. **Backend** receives audio via WebSocket
4. **OpenAI Whisper** transcribes audio to text
5. **Groq LLaMA** translates text to target language
6. **Frontend** receives translated text via WebSocket
7. **Browser TTS** speaks translated text to **User B**

### WebSocket Communication
- **Connection**: `ws://localhost:8000/api/v2/ws/multi-language/{room_id}`
- **Message Types**: `join_room`, `message`, `translation`, `user_list`
- **Room Limit**: Maximum 2 users per room
- **Language Support**: Auto-detection and manual language selection

## Technology Stack

### Backend
- **FastAPI** - Web framework
- **OpenAI Whisper** - Speech-to-text
- **Groq LLaMA** - Text translation and AI chat
- **SQLAlchemy** - Database ORM
- **WebSockets** - Real-time communication
- **Pydantic** - Data validation

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **MediaRecorder API** - Audio recording
- **SpeechSynthesis API** - Text-to-speech
- **WebSocket API** - Real-time communication

## Environment Variables
```env
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
API_KEY=fast_API_KEY
ADMIN_KEY=admin_secret_key_123
```

## Quick Start
1. **Backend**: `cd backend && python main.py`
2. **Frontend**: `cd frontend && npm run dev`
3. **Access**: http://localhost:3000
4. **Login**: Use API key from environment variables
