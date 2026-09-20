from fastapi import APIRouter
from utils.config import is_openaq_configured, is_groq_configured, GROQ_MODEL

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CleanAir AI Backend",
        "openaq_connected": is_openaq_configured(),
        "groq_connected": is_groq_configured(),
        "groq_model": GROQ_MODEL,
        "mode": "Live" if (is_openaq_configured() and is_groq_configured()) else "Demo / Hybrid"
    }
