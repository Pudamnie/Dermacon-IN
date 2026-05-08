"""
SkinCare AI - Consultations Router
Handles patient-doctor consultation requests and management.
"""
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ConsultationCreate, ConsultationUpdate
from app.auth.jwt_handler import get_current_user, require_role
from app.database import get_database
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/consultations", tags=["Consultations"])


@router.post("/", status_code=201)
async def create_consultation(data: ConsultationCreate, current_user: dict = Depends(require_role("patient"))):
    db = get_database()
    try:
        doctor = await db.users.find_one({"_id": ObjectId(data.doctor_id), "role": "doctor"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid doctor ID")
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doc = {
        "patient_id": current_user["_id"],
        "patient_name": current_user.get("full_name", ""),
        "doctor_id": data.doctor_id,
        "doctor_name": doctor.get("full_name", ""),
        "report_id": data.report_id,
        "symptoms": data.symptoms or "",
        "notes": data.notes or "",
        "status": "requested",
        "doctor_notes": "",
        "prescription": "",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.consultations.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["id"] = str(result.inserted_id)

    # Send automated message to doctor
    chat_doc = {
        "sender_id": current_user["_id"],
        "sender_name": current_user.get("full_name", ""),
        "sender_role": "patient",
        "receiver_id": data.doctor_id,
        "receiver_name": doctor.get("full_name", ""),
        "receiver_role": "doctor",
        "message": f"Hello Dr. {doctor.get('full_name', '')}, I have requested a consultation regarding my skin health. Symptoms: {data.symptoms or 'Not specified'}.",
        "message_type": "text",
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.chats.insert_one(chat_doc)

    return {"consultation": doc}


@router.get("/my-consultations")
async def get_my_consultations(current_user: dict = Depends(get_current_user)):
    db = get_database()
    if current_user["role"] == "patient":
        query = {"patient_id": current_user["_id"]}
    elif current_user["role"] == "doctor":
        query = {"doctor_id": current_user["_id"]}
    else:
        query = {}
    cursor = db.consultations.find(query).sort("created_at", -1)
    consultations = []
    async for c in cursor:
        c["_id"] = str(c["_id"])
        c["id"] = c["_id"]
        consultations.append(c)
    return {"consultations": consultations}


@router.put("/{consultation_id}")
async def update_consultation(consultation_id: str, updates: ConsultationUpdate, current_user: dict = Depends(require_role("doctor"))):
    db = get_database()
    try:
        consultation = await db.consultations.find_one({"_id": ObjectId(consultation_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid consultation ID")
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    if consultation["doctor_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not your consultation")

    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if "status" in update_data:
        update_data["status"] = update_data["status"].value
    update_data["updated_at"] = datetime.now(timezone.utc)
    await db.consultations.update_one({"_id": ObjectId(consultation_id)}, {"$set": update_data})
    return {"message": "Consultation updated"}
