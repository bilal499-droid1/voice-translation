# Multi-Voice Project - Real-Time Voice Translation System

A real-time voice translation application that enables two users to communicate in different languages with live voice translation using AI.

## 🚀 Features

- **Real-Time Voice Translation**: Convert speech to text, translate, and convert back to speech
- **Multi-Language Support**: Support for 10+ languages with auto-detection
- **Room-Based Communication**: Private rooms for 2-user conversations
- **Voice-to-Text**: OpenAI Whisper API for accurate speech recognition
- **Text-to-Speech**: Browser-based speech synthesis for translated audio
- **AI Chat Assistant**: Groq LLaMA-powered AI for text conversations
- **WebSocket Communication**: Real-time bidirectional communication
- **Modern UI**: React + Vite with Tailwind CSS

## 📁 Project Structure

```
Multi-Voice-Project/
├── backend/                    # Backend application
│   ├── app/                   # Main application code
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── models/           # Data models
│   │   └── db/              # Database setup
│   ├── modules/              # Authentication, emotion, speaker ID
│   ├── main.py              # Backend entry point
│   ├── requirements.txt     # Python dependencies
│   └── docker-compose.yml  # Container orchestration
├── frontend/                 # React frontend
│   ├── src/                 # Source code
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── package.json        # Node.js dependencies
└── PROJECT_ARCHITECTURE.md # Detailed architecture documentation
```

## 🛠️ Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- GROQ API Key
- OpenAI API Key

### 1. Setup Environment
```bash
# Navigate to project
cd Multi-Voice-Project

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Install Python dependencies
cd backend
pip install -r requirements.txt

# Setup frontend
cd ../frontend
npm install
```

### 2. Configuration
Create `.env` file in `backend/` directory:
```
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
API_KEY=fast_API_KEY
ADMIN_KEY=admin_secret_key_123
```

### 3. Run Application
```bash
# Terminal 1: Start Backend
cd backend
source .venv/Scripts/activate  # Windows
python main.py

# Terminal 2: Start Frontend  
cd frontend
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Multi-Language Chat: http://localhost:3000/simple-ml

## 🎯 Usage

1. **Open Application**: Navigate to http://localhost:3000
2. **Login**: Use the API key from your `.env` file
3. **Choose Mode**:
   - **Dashboard**: Single-language AI chat
   - **Multi-Language**: Real-time voice translation (click "Multi-Language Chat")
4. **Join Room**: Enter a room name (max 2 users per room)
5. **Select Languages**: Choose your native and target languages
6. **Record Voice**: Click microphone button to capture 3-second audio
7. **Real-Time Translation**: Messages are automatically translated and spoken to other users

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access application
open http://localhost:3001
```

## 🔧 API Endpoints

- `GET /health` - Health check
- `GET /auth/me` - Authentication verification
- `POST /chat` - Send chat message to AI
- `POST /transcribe` - Audio transcription with language support
- `WS /api/v2/ws/multi-language/{room_id}` - WebSocket for real-time translation
- `GET /docs` - Interactive API documentation

## 🌍 Supported Languages

- English (en)
- Spanish (es) 
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the API documentation at http://localhost:8000/docs
2. Review the console logs for errors
3. Ensure all environment variables are set in `backend/.env`
4. Verify both GROQ and OpenAI API keys are valid
5. Check the PROJECT_ARCHITECTURE.md for detailed technical information

## 📚 Documentation

- **PROJECT_ARCHITECTURE.md** - Detailed technical architecture and data flow
- **API Docs** - Interactive documentation at http://localhost:8000/docs
- **Backend Code** - Well-documented FastAPI application in `backend/`
- **Frontend Code** - React components with clear structure in `frontend/`

---

Built with ❤️ using FastAPI, React, OpenAI Whisper, Groq LLaMA, and modern web technologies.
