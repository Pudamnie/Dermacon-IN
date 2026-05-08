"""
SkinCare AI - Pydantic Schemas
Defines request/response models for all API endpoints.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    PHARMACY = "pharmacy"


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class ConsultationStatus(str, Enum):
    REQUESTED = "requested"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ─── Auth Schemas ─────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: UserRole
    phone: Optional[str] = None
    id_number: Optional[str] = None
    # Doctor fields
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    # Pharmacy fields
    pharmacy_name: Optional[str] = None
    pharmacy_address: Optional[str] = None
    pharmacy_license: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    id_number: Optional[str] = None
    avatar_url: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    pharmacy_name: Optional[str] = None
    pharmacy_address: Optional[str] = None
    bio: Optional[str] = None


# ─── Report Schemas ───────────────────────────────────────

class ReportCreate(BaseModel):
    image_url: str
    prediction: str
    confidence: float
    probabilities: dict
    gradcam_url: Optional[str] = None
    notes: Optional[str] = None


class ReportResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    image_url: str
    prediction: str
    confidence: float
    probabilities: dict
    gradcam_url: Optional[str] = None
    doctor_feedback: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime


# ─── Product Schemas ──────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float = Field(..., gt=0)
    category: str
    images: List[str] = Field(..., min_items=1, max_items=3)
    stock: int = Field(default=0, ge=0)
    ingredients: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    ingredients: Optional[str] = None


class ProductResponse(BaseModel):
    id: str
    pharmacy_id: str
    pharmacy_name: Optional[str] = None
    name: str
    description: str
    price: float
    category: str
    images: List[str]
    stock: int
    ingredients: Optional[str] = None
    created_at: datetime


# ─── Order Schemas ────────────────────────────────────────

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int = Field(..., gt=0)
    price: float


class OrderCreate(BaseModel):
    pharmacy_id: str
    items: List[OrderItem]
    delivery_address: str
    total_amount: float


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    pharmacy_id: str
    pharmacy_name: Optional[str] = None
    items: List[dict]
    delivery_address: str
    total_amount: float
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


# ─── Chat Schemas ─────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    receiver_id: str
    message: str
    message_type: str = "text"  # text, image, report


class ChatMessageResponse(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    receiver_id: str
    receiver_name: str
    message: str
    message_type: str
    is_read: bool
    created_at: datetime


# ─── Consultation Schemas ─────────────────────────────────

class ConsultationCreate(BaseModel):
    doctor_id: str
    report_id: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None


class ConsultationUpdate(BaseModel):
    status: Optional[ConsultationStatus] = None
    doctor_notes: Optional[str] = None
    prescription: Optional[str] = None


class DoctorFeedback(BaseModel):
    report_id: str
    feedback: str
    severity: Optional[str] = None  # low, medium, high, critical
    recommendations: Optional[str] = None


# ─── Chatbot Schemas ──────────────────────────────────────

class ChatbotMessage(BaseModel):
    message: str


class ChatbotResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None
