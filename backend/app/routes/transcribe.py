"""
Transcription routes for speech-to-text using OpenAI Whisper models.
"""
from fastapi import APIRouter, Depends, UploadFile, File, Query
from fastapi.responses import JSONResponse
from app.auth import verify_api_key
from app.services.stt_service import transcribe_audio, transcribe_audio_with_language

router = APIRouter()

@router.post("/transcribe", dependencies=[Depends(verify_api_key)])
async def transcribe(file: UploadFile = File(...), language: str = Query("auto", description="Language code for transcription (e.g., 'en', 'es', 'fr') or 'auto' for auto-detection")):
    """
    Secured endpoint for audio transcription using OpenAI Whisper model.
    Accepts audio file upload, returns transcription result with language detection.
    """
    try:
        print(f"Transcription request received: filename={file.filename}, content_type={file.content_type}, language={language}")
        result = await transcribe_audio_with_language(file, language)
        print(f"Transcription successful: {result}")
        return result
    except ValueError as e:
        print(f"Transcription ValueError: {e}")
        return JSONResponse(
            status_code=400,
            content={"status": "error", "detail": str(e)}
        )
    except Exception as e:
        print(f"Transcription Exception: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"status": "error", "detail": str(e)}
        )
