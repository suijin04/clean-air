from fastapi import APIRouter
from models.schemas import ChatRequest, ChatResponse
from services.ai_service import ai_service

router = APIRouter(tags=["AI Assistant"])

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    CleanAir AI Assistant endpoint.
    Processes user queries using current city air quality data as contextual grounding.
    """
    return await ai_service.ask_question(
        question=request.message,
        city=request.city,
        current_data=request.current_data
    )
