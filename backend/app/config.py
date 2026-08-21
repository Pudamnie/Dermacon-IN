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
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "skincare_ai")

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "skincare_ai_jwt_secret_key_2026_prod")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # ML Model (DermaCon-IN 3-class ConvNeXt classifier)
    MODEL_PATH: str = os.getenv("MODEL_PATH", "app/ml/dermacon/final_development_model.keras")

    # Optional body-region scope verifier. Not yet trained/present -- see
    # app/ml/inference.py SCOPE_VERIFIER_LOADED for the real runtime status.
    SCOPE_MODEL_PATH: str = os.getenv("SCOPE_MODEL_PATH", "app/ml/dermacon/scope_verifier.keras")

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
