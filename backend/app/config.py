"""
SkinCare AI - Configuration Module
Loads environment variables and provides app-wide settings.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "SkinCare AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # MongoDB
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL",
        "mongodb+srv://madunikaishara9_db_user:skincancer2026@cluster0.iuonyq3.mongodb.net/?appName=Cluster0"
    )
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "skincare_ai")

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "skincare_ai_jwt_secret_key_2026_prod")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # ML Model
    MODEL_PATH: str = os.getenv("MODEL_PATH", "app/ml/model.h5")

    # Disease classes for the skin cancer model
    DISEASE_CLASSES: list = [
        "Actinic Keratosis",
        "Basal Cell Carcinoma",
        "Dermatofibroma",
        "Melanoma",
        "Nevus",
        "Pigmented Benign Keratosis",
        "Seborrheic Keratosis",
        "Squamous Cell Carcinoma",
        "Vascular Lesion"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
