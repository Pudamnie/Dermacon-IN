"""
SkinCare AI - Upload Router
Handles image upload, ML prediction, Grad-CAM generation, and Cloud Storage.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.auth.jwt_handler import get_current_user, require_role
from app.ml.inference import predict, generate_gradcam, MODEL_LOADED
from app.config import get_settings
from app.database import get_database
import cloudinary
import cloudinary.uploader
from datetime import datetime, timezone
import base64

settings = get_settings()
router = APIRouter(prefix="/upload", tags=["Upload & ML"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

@router.post("/predict")
async def predict_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("patient"))
):
    """Upload a skin image, get AI prediction, and store in cloud."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")

    # Run prediction
    result = predict(image_bytes)

    # Generate Grad-CAM
    gradcam_b64 = None
    gradcam_bytes = generate_gradcam(image_bytes)
    if gradcam_bytes:
        gradcam_b64 = base64.b64encode(gradcam_bytes).decode("utf-8")

    # Encode original image for immediate mobile rendering
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    cloud_image_url = ""
    cloud_gradcam_url = ""
    
    # Try uploading to Cloudinary
    try:
        # We only upload if the cloudinary credentials are not empty placeholders
        if settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_KEY != "your_api_key":
            upload_result = cloudinary.uploader.upload(
                image_bytes, 
                folder="skincare_ai/patients"
            )
            cloud_image_url = upload_result.get("secure_url")

            if gradcam_bytes:
                gc_upload = cloudinary.uploader.upload(
                    gradcam_bytes,
                    folder="skincare_ai/gradcam"
                )
                cloud_gradcam_url = gc_upload.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        # Continue even if cloud upload fails so the user still gets prediction

    # Auto-save report to DB
    try:
        db = get_database()
        report_doc = {
            "patient_id": current_user["_id"],
            "patient_name": current_user.get("full_name", ""),
            "image_url": cloud_image_url or "base64_fallback",
            "prediction": result["prediction"],
            "short_name": result.get("short_name", ""),
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "xai_info": result.get("xai_info", ""),
            "full_details": result.get("full_details", {}),
            "gradcam_url": cloud_gradcam_url or "base64_fallback",
            "notes": "",
            "doctor_feedback": None,
            "doctor_id": None,
            "severity": result.get("full_details", {}).get("severity", "unknown"),
            "recommendations": result.get("full_details", {}).get("risk", ""),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await db.reports.insert_one(report_doc)
        report_doc["_id"] = str(report_doc["_id"])
    except Exception as e:
        print(f"Failed to auto-save report: {e}")

    return {
        "prediction": result["prediction"],
        "short_name": result.get("short_name", ""),
        "confidence": result["confidence"],
        "probabilities": result["probabilities"],
        "xai_info": result.get("xai_info", ""),
        "full_details": result.get("full_details", {}),
        "image_base64": image_b64,
        "gradcam_base64": gradcam_b64,
        "cloud_url": cloud_image_url,
        "model_loaded": MODEL_LOADED,
    }

@router.get("/model-status")
async def model_status(current_user: dict = Depends(get_current_user)):
    """Check if the ML model is loaded."""
    return {"model_loaded": MODEL_LOADED}

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a profile avatar to Cloudinary and update user profile."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="Image too large (max 5MB)")

    try:
        # We only upload if the cloudinary credentials are not empty placeholders
        if settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_KEY != "your_api_key":
            upload_result = cloudinary.uploader.upload(
                image_bytes, 
                folder="skincare_ai/avatars",
                transformation=[{"width": 400, "height": 400, "crop": "fill"}]
            )
            cloud_image_url = upload_result.get("secure_url")
        else:
            # Fallback to base64 if Cloudinary is not configured
            # This allows the app to work even without cloud setup
            b64_image = base64.b64encode(image_bytes).decode("utf-8")
            cloud_image_url = f"data:image/jpeg;base64,{b64_image}"
            
        # Update user profile in database
        db = get_database()
        from bson import ObjectId
        await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": {"avatar_url": cloud_image_url, "updated_at": datetime.now(timezone.utc)}}
        )
        
        return {"avatar_url": cloud_image_url}
    except Exception as e:
        print(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")
