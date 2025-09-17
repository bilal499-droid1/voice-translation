"""
Configuration module for Voice AI Bot Backend
Loads environment variables and application settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings loaded from environment variables."""
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    API_KEY: str = os.getenv("API_KEY")
    ADMIN_KEY: str = os.getenv("ADMIN_KEY")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003")
    
    # Allowed audio file extensions for transcription
    ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm"}
    
    # Default Whisper model
    DEFAULT_WHISPER_MODEL = "whisper-1"
    
    def __init__(self):
        if not self.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is required")
        if not self.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        if not self.API_KEY:
            raise ValueError("API_KEY environment variable is required")
        if not self.ADMIN_KEY:
            raise ValueError("ADMIN_KEY environment variable is required")

# Global settings instance
settings = Settings()
