"""
Speech-to-Text service using OpenAI Whisper model.
Handles audio file transcription with proper error handling.
"""
import asyncio
import logging
from typing import Optional
from fastapi import UploadFile
from openai import OpenAI
from app.config import settings

# Initialize OpenAI client
openai_client = None

def get_openai_client():
    """Get or create OpenAI client instance."""
    global openai_client
    if not openai_client:
        if not settings.OPENAI_API_KEY:
            raise Exception("OPENAI_API_KEY not found in environment variables")
        openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return openai_client

def is_audio_file(filename: str) -> bool:
    """
    Validate if uploaded file is an audio file.
    
    Args:
        filename: Name of the uploaded file
        
    Returns:
        bool: True if file extension is allowed, False otherwise
    """
    if not filename:
        return False
    return any(filename.lower().endswith(ext) for ext in settings.ALLOWED_AUDIO_EXTENSIONS)

async def transcribe_audio(file: UploadFile) -> dict:
    """
    Transcribe audio file using OpenAI Whisper model.
    
    Args:
        file: Uploaded audio file
        
    Returns:
        dict: Transcription result or error response
        
    Raises:
        ValueError: If file type is not supported
        Exception: For other transcription errors
    """
    # Get OpenAI client
    try:
        client = get_openai_client()
    except Exception as e:
        raise Exception(f"OpenAI client initialization failed: {str(e)}")
    
    # Validate file type
    if not is_audio_file(file.filename):
        raise ValueError(
            "Invalid file type. Only .mp3, .wav, .m4a, .webm are allowed."
        )
    
    try:
        # Reset file pointer to beginning
        await file.seek(0)
        
        # Read the file content
        file_content = await file.read()
        print(f"File size: {len(file_content)} bytes, filename: {file.filename}")
        
        # Reset file pointer again after reading
        await file.seek(0)
        
        # Use OpenAI Whisper API for transcription
        print(f"Transcribing audio using OpenAI Whisper model: {settings.DEFAULT_WHISPER_MODEL}")
        
        # Create a temporary file-like object for OpenAI API
        file.file.seek(0)
        
        # Ensure the file has proper content
        if len(file_content) < 100:  # Very small files might be invalid
            raise Exception(f"Audio file too small ({len(file_content)} bytes). Please ensure you're recording actual audio.")
        
        print(f"Calling OpenAI Whisper API with {len(file_content)} bytes of audio data...")
        
        # Create a proper file object for OpenAI API
        import io
        file_obj = io.BytesIO(file_content)
        file_obj.name = file.filename
        
        # Call OpenAI Whisper API
        transcription = client.audio.transcriptions.create(
            file=file_obj,
            model=settings.DEFAULT_WHISPER_MODEL,
            response_format="text"
        )
        
        # Extract text from response
        text = str(transcription).strip()
        
        if not text:
            raise Exception("No transcription text received from OpenAI Whisper")
        
        print(f"Transcription successful: '{text[:100]}{'...' if len(text) > 100 else ''}'")
        
        return {
            "status": "success",
            "model": settings.DEFAULT_WHISPER_MODEL,
            "transcription": text
        }
        
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        raise Exception(f"Transcription failed: {str(e)}")

async def transcribe_audio_with_language(file: UploadFile, language: str = "auto") -> dict:
    """
    Transcribe audio file with specific language detection.
    
    Args:
        file: Uploaded audio file
        language: Language code (e.g., 'en', 'es', 'fr') or 'auto' for auto-detection
        
    Returns:
        dict: Transcription result with language info
    """
    # Get OpenAI client
    try:
        client = get_openai_client()
    except Exception as e:
        raise Exception(f"OpenAI client initialization failed: {str(e)}")
    
    # Validate file type
    if not is_audio_file(file.filename):
        raise ValueError(
            "Invalid file type. Only .mp3, .wav, .m4a, .webm are allowed."
        )
    
    try:
        # Reset file pointer to beginning
        await file.seek(0)
        
        # Read the file content
        file_content = await file.read()
        print(f"File size: {len(file_content)} bytes, filename: {file.filename}")
        
        # Reset file pointer again after reading
        await file.seek(0)
        
        # Ensure the file has proper content
        if len(file_content) < 100:  # Very small files might be invalid
            raise Exception(f"Audio file too small ({len(file_content)} bytes). Please ensure you're recording actual audio.")
        
        print(f"Calling OpenAI Whisper API with {len(file_content)} bytes of audio data...")
        
        # Prepare parameters for OpenAI Whisper API
        params = {
            "file": file.file,
            "model": settings.DEFAULT_WHISPER_MODEL,
            "response_format": "json"
        }
        
        # Add language parameter if specified and not auto
        if language and language != "auto":
            params["language"] = language
            print(f"Transcribing with language: {language}")
        else:
            print("Transcribing with auto language detection")
        
        # Create a proper file object for OpenAI API
        import io
        file_obj = io.BytesIO(file_content)
        file_obj.name = file.filename
        params["file"] = file_obj
        
        # Call OpenAI Whisper API
        transcription = client.audio.transcriptions.create(**params)
        
        # Extract text and language from response
        if hasattr(transcription, 'text'):
            text = transcription.text.strip()
            detected_language = getattr(transcription, 'language', language if language != "auto" else "unknown")
        else:
            # Handle different response formats
            text = str(transcription).strip()
            detected_language = language if language != "auto" else "unknown"
        
        if not text:
            raise Exception("No transcription text received from OpenAI Whisper")
        
        print(f"Transcription successful: '{text[:100]}{'...' if len(text) > 100 else ''}' (Language: {detected_language})")
        
        return {
            "status": "success",
            "model": settings.DEFAULT_WHISPER_MODEL,
            "transcription": text,
            "language": detected_language,
            "requested_language": language
        }
        
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        raise Exception(f"Transcription failed: {str(e)}")