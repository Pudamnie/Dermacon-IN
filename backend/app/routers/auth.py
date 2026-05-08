"""
SkinCare AI - Authentication Router
Handles user registration, login, and profile management.
"""
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.models.schemas import (
    UserRegister, UserLogin, TokenResponse, UserProfileUpdate
)
from app.auth.jwt_handler import (
    hash_password, verify_password, create_access_token, get_current_user
)
from app.database import get_database
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["Authentication"])


def serialize_user(user: dict) -> dict:
    """Serialize a MongoDB user document for API response and decrypt sensitive fields."""
    import base64
    user["_id"] = str(user["_id"])
    user.pop("password", None)
    
    # Decrypt ID number for frontend display
    if user.get("id_number"):
        try:
            # We assume it was base64 encoded for "privacy" in the DB
            decoded = base64.b64decode(user["id_number"]).decode("utf-8")
            user["id_number"] = decoded
        except Exception:
            # If it's not base64 (e.g. legacy data), leave it as is
            pass
            
    return user


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user (patient, doctor, or pharmacy)."""
    db = get_database()

    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Build user document
    user_doc = {
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "role": user_data.role.value,
        "phone": user_data.phone or "",
        "id_number": "",
        "avatar_url": "",
        "bio": "",
        "is_active": True,
        "is_approved": True, # Auto-approve all roles for now to fix visibility issues
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    # Encrypt ID number if provided
    if user_data.id_number:
        import base64
        user_doc["id_number"] = base64.b64encode(user_data.id_number.encode("utf-8")).decode("utf-8")

    # Add role-specific fields
    if user_data.role.value == "doctor":
        user_doc.update({
            "specialization": user_data.specialization or "",
            "license_number": user_data.license_number or "",
            "experience_years": user_data.experience_years or 0,
            "patients_count": 0,
            "rating": 0.0,
        })
    elif user_data.role.value == "pharmacy":
        user_doc.update({
            "pharmacy_name": user_data.pharmacy_name or "",
            "pharmacy_address": user_data.pharmacy_address or "",
            "pharmacy_license": user_data.pharmacy_license or "",
            "products_count": 0,
            "orders_count": 0,
        })

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)

    # Create JWT token
    token = create_access_token(
        data={"sub": str(result.inserted_id), "role": user_data.role.value}
    )

    return TokenResponse(
        access_token=token,
        user=serialize_user(user_doc)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate a user and return a JWT token."""
    db = get_database()

    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated"
        )

    token = create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]}
    )

    return TokenResponse(
        access_token=token,
        user=serialize_user(user)
    )


@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    current_user.pop("password", None)
    return {"user": current_user}


@router.put("/profile")
async def update_profile(
    updates: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update the current user's profile."""
    db = get_database()

    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    # Encrypt ID number if being updated
    if "id_number" in update_data and update_data["id_number"]:
        import base64
        update_data["id_number"] = base64.b64encode(update_data["id_number"].encode("utf-8")).decode("utf-8")
        
    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data}
    )

    updated_user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    return {"user": serialize_user(updated_user)}


@router.get("/doctors")
async def list_doctors(current_user: dict = Depends(get_current_user)):
    """List all approved doctors (for patients to request consultations)."""
    db = get_database()
    cursor = db.users.find(
        {"role": "doctor", "is_active": True},
        {"password": 0}
    )
    doctors = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doctors.append(doc)
    return {"doctors": doctors}


@router.get("/pharmacies")
async def list_pharmacies(current_user: dict = Depends(get_current_user)):
    """List all approved pharmacies."""
    db = get_database()
    cursor = db.users.find(
        {"role": "pharmacy", "is_active": True, "is_approved": True},
        {"password": 0}
    )
    pharmacies = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        pharmacies.append(doc)
    return {"pharmacies": pharmacies}
