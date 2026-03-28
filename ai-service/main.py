"""
VisaAI Pro — Python AI Service
FastAPI + LangChain + Google Vision OCR + OpenAI
"""
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

from routers import ocr, chat, knowledge, analytics
from services.cache import init_cache

app = FastAPI(
    title="VisaAI Pro — AI Service",
    description="AI backend: OCR, NLP, Lead Scoring, Knowledge Base",
    version="1.0.0",
    docs_url="/docs" if os.getenv("NODE_ENV") != "production" else None,
)

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", os.getenv("BACKEND_URL", "")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

def verify_service_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    expected = os.getenv("AI_SERVICE_SECRET", "internal_service_secret")
    if credentials.credentials != expected:
        raise HTTPException(status_code=403, detail="Invalid service token")
    return credentials.credentials

# Routers
app.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
app.include_router(chat.router, prefix="/chat", tags=["Chat AI"])
app.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@app.on_event("startup")
async def startup():
    await init_cache()
    print("🤖 VisaAI Python AI Service started")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "visaai-ai", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("NODE_ENV") != "production",
        workers=2,
    )
