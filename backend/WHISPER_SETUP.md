# OpenAI Whisper Integration Setup

## 🔑 **Setup Instructions:**

### 1. Add Your OpenAI API Key

**Add this line to your `.env` file:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Replace `your_openai_api_key_here` with your actual OpenAI API key.**

### 3. Start the Application

**Backend:**
```bash
python -m uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend && npm run dev
```

## 🎯 **How to Use:**

### Voice Input in Multi-Language Dashboard

1. Go to `http://localhost:3000/simple-ml`
2. Select your language (e.g., English, Spanish)
3. Click the 🎤 button
4. Speak for 3 seconds
5. Your speech will be transcribed using OpenAI Whisper
6. The text will be translated to the other user's language
7. The other user will hear the translated text via TTS

### API Endpoints

**Transcription with auto language detection:**
```bash
curl -X POST "http://localhost:8000/transcribe" \
  -H "X-API-Key: fast_API_KEY" \
  -F "file=@audio.wav"
```

**Transcription with specific language:**
```bash
curl -X POST "http://localhost:8000/transcribe?language=es" \
  -H "X-API-Key: fast_API_KEY" \
  -F "file=@audio.wav"
```


