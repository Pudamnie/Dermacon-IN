"""
SkinCare AI - Main FastAPI Application
Production-grade healthcare backend with ML integration.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_to_database, close_database_connection
from app.ml.inference import load_model, warmup_model
from app.routers import auth, reports, products, orders, chat, consultations, chatbot, upload, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    await connect_to_database()
    load_model()
    warmup_model()
    print("SkinCare AI Backend is running!")
    yield
    # Shutdown
    await close_database_connection()


app = FastAPI(
    title="SkinCare AI",
    description="AI-Powered Skin Disease Detection & Healthcare Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(consultations.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": "SkinCare AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    from app.ml.inference import MODEL_LOADED
    return {
        "status": "healthy",
        "database": "connected",
        "ml_model": "loaded" if MODEL_LOADED else "not loaded",
    }
