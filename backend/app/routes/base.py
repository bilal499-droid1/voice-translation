from fastapi import APIRouter, Depends
from app.auth import verify_api_key

router = APIRouter()

@router.get("/")
def root():
    """Root endpoint for service status."""
    return {"message": "Voice AI Bot Backend is running"}

@router.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}

@router.get("/auth/me", dependencies=[Depends(verify_api_key)])
async def get_current_user():
    """Get current user information."""
    return {
        "status": "success",
        "user": "authenticated",
        "message": "API key is valid"
    }
