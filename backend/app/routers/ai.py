from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

from ..services.ai_service import ai_service

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

class FactCheckRequest(BaseModel):
    text: str

class FactCheckResponse(BaseModel):
    result: str
    confidence: float
    sources: list = []

@router.post("/fact-check", response_model=FactCheckResponse)
async def fact_check(request: FactCheckRequest):
    try:
        logger.info(f"Received fact-check request for text: '{request.text}'")
        
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text is required")
            
        result = await ai_service.fact_check(request.text)
        logger.info(f"Fact-check result: {result}")
        
        return FactCheckResponse(**result)
    except Exception as e:
        logger.error(f"Fact check error: {e}")
        raise HTTPException(status_code=500, detail=f"Fact check failed: {str(e)}")