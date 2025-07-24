import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from .core.database import engine
from .models import database
from .routers import pages, ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    database.Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="AI Fact-Check Editor API",
    description="Backend API for AI fact-checking editor with Plate.js",
    version="1.0.0",
    lifespan=lifespan
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pages.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "AI Fact-Check Editor API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}