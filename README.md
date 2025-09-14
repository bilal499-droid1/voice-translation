# Multi-Voice Project - Setup Guide

A comprehensive step-by-step guide to clone, setup, and run the Multi-Voice Project on your machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16 or higher** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/downloads)
- **GROQ API Key** - [Get your API key](https://console.groq.com/)
- **OpenAI API Key** - [Get your API key](https://platform.openai.com/api-keys)

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

1. **Open your terminal/command prompt**
2. **Navigate to your desired directory** (e.g., Desktop, Documents)
   ```bash
   cd Desktop
   ```
3. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Multi-Voice-Project.git
   ```
4. **Navigate into the project directory**
   ```bash
   cd Multi-Voice-Project
   ```

### Step 2: Backend Setup

1. **Create a Python virtual environment**
   ```bash
   python -m venv .venv
   ```

2. **Activate the virtual environment**
   
   **On Windows:**
   ```bash
   .venv\Scripts\activate
   ```
   
   **On macOS/Linux:**
   ```bash
   source .venv/bin/activate
   ```

3. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

4. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create environment configuration file**
   
   Create a new file called `.env` in the `backend/` directory:
   ```bash
   # On Windows
   type nul > .env
   
   # On macOS/Linux
   touch .env
   ```

6. **Add your API keys to the .env file**
   
   Open the `.env` file in a text editor and add:
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   OPENAI_API_KEY=your_actual_openai_api_key_here
   API_KEY=fast_API_KEY
   ADMIN_KEY=admin_secret_key_123
   ```
   
   **Important:** Replace `your_actual_groq_api_key_here` and `your_actual_openai_api_key_here` with your real API keys.

### Step 3: Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

### Step 4: Running the Application

You'll need to run both the backend and frontend servers. Open **two separate terminal windows**.

#### Terminal 1: Start the Backend Server

1. **Navigate to the project root**
   ```bash
   cd path/to/Multi-Voice-Project
   ```

2. **Activate the virtual environment**
   
   **On Windows:**
   ```bash
   .venv\Scripts\activate
   ```
   
   **On macOS/Linux:**
   ```bash
   source .venv/bin/activate
   ```

3. **Navigate to backend and start the server**
   ```bash
   cd backend
   python main.py
   ```

   You should see output like:
   ```
   INFO:     Started server process [12345]
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://127.0.0.1:8000
   ```

#### Terminal 2: Start the Frontend Server

1. **Navigate to the frontend directory**
   ```bash
   cd path/to/Multi-Voice-Project/frontend
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

   You should see output like:
   ```
   VITE v4.4.5  ready in 500 ms
   ➜  Local:   http://localhost:3000/
   ➜  Network: use --host to expose
   ```

### Step 5: Access the Application

1. **Open your web browser**
2. **Navigate to:** http://localhost:3000
3. **Login with the API key:** `fast_API_KEY` (from your .env file)
4. **Choose your mode:**
   - **Dashboard**: Single-language AI chat
   - **Multi-Language Chat**: Real-time voice translation

## 🎯 Testing the Application

### Test Single-Language AI Chat
1. Click on "Dashboard" after login
2. Type a message in the chat box
3. Press Enter or click Send
4. The AI should respond using Groq LLaMA

### Test Multi-Language Voice Translation
1. Click on "Multi-Language Chat" after login
2. Select your native language and target language
3. Enter a room name (e.g., "test-room")
4. Click the microphone button and speak for 3 seconds
5. Your speech should be transcribed, translated, and spoken back

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Backend Server Won't Start
- **Check Python version:** `python --version` (should be 3.8+)
- **Verify virtual environment is activated:** You should see `(.venv)` in your terminal prompt
- **Check if port 8000 is available:** Another application might be using it
- **Verify API keys:** Make sure your GROQ and OpenAI API keys are valid

#### Frontend Server Won't Start
- **Check Node.js version:** `node --version` (should be 16+)
- **Clear npm cache:** `npm cache clean --force`
- **Delete node_modules and reinstall:**
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

#### API Key Errors
- **Verify API keys are correct** in `backend/.env`
- **Check API key permissions** on Groq and OpenAI websites
- **Ensure no extra spaces** in the .env file

#### WebSocket Connection Issues
- **Check both servers are running** (backend on port 8000, frontend on port 3000)
- **Verify firewall settings** aren't blocking the connection
- **Try refreshing the browser** page

### Getting Help

1. **Check the console logs** in your browser (F12 → Console tab)
2. **Check the terminal output** for error messages
3. **Verify all prerequisites** are installed correctly
4. **Review the PROJECT_ARCHITECTURE.md** for technical details

## 📚 Additional Resources

- **API Documentation:** http://localhost:8000/docs (when backend is running)
- **Project Architecture:** See `PROJECT_ARCHITECTURE.md`
- **Main Documentation:** See `MAIN_README.md`

## 🎉 Success!

If everything is working correctly, you should be able to:
- ✅ Login to the application
- ✅ Chat with the AI assistant
- ✅ Use voice translation between different languages
- ✅ See real-time WebSocket communication

Enjoy your Multi-Voice Project! 🚀
