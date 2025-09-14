#!/usr/bin/env python3
"""
Debug script to test transcription and translation functionality.
"""
import os
import asyncio
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

async def test_groq_client():
    """Test Groq client initialization and API calls"""
    print("Testing Groq client...")
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("❌ GROQ_API_KEY not found")
        return False
    
    print(f"✅ GROQ_API_KEY found: {api_key[:10]}...")
    
    try:
        client = Groq(api_key=api_key)
        print("✅ Groq client initialized")
        
        # Test chat completion
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "Translate 'Hello' to Spanish. Only return the translation."}],
            max_tokens=50,
            temperature=0.3
        )
        
        result = response.choices[0].message.content.strip()
        print(f"✅ Translation test: 'Hello' -> '{result}'")
        
        return True
        
    except Exception as e:
        print(f"❌ Groq client error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_audio_transcription():
    """Test audio transcription with a dummy file"""
    print("\nTesting audio transcription...")
    
    try:
        from app.services.stt_service import transcribe_audio
        from fastapi import UploadFile
        import io
        
        # Create a dummy audio file
        dummy_audio = b"fake audio data for testing"
        file_obj = io.BytesIO(dummy_audio)
        
        # Create UploadFile object
        upload_file = UploadFile(
            file=file_obj,
            filename="test.webm",
            size=len(dummy_audio)
        )
        
        print(f"Created test file: {upload_file.filename}, size: {upload_file.size}")
        
        # This will likely fail, but we'll see the error
        result = await transcribe_audio(upload_file)
        print(f"✅ Transcription result: {result}")
        return True
        
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("🔍 Debugging transcription and translation...\n")
    
    # Test Groq client
    groq_ok = await test_groq_client()
    
    # Test transcription (this will likely fail with dummy data)
    transcription_ok = await test_audio_transcription()
    
    print(f"\n{'='*50}")
    print("SUMMARY")
    print('='*50)
    print(f"Groq client: {'✅ OK' if groq_ok else '❌ FAIL'}")
    print(f"Transcription: {'✅ OK' if transcription_ok else '❌ FAIL'}")
    
    if not groq_ok:
        print("\n❌ Groq client is not working. Check GROQ_API_KEY in .env file")
    if not transcription_ok:
        print("\n❌ Transcription is failing. Check the error above")

if __name__ == "__main__":
    asyncio.run(main())
