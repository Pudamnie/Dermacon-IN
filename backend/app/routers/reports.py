"""
SkinCare AI - Reports Router
Handles AI prediction reports, Grad-CAM results, and doctor feedback.
"""
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.models.schemas import ReportCreate, DoctorFeedback
from app.auth.jwt_handler import get_current_user, require_role
from app.database import get_database
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_report(
    report: ReportCreate,
    current_user: dict = Depends(require_role("patient"))
):
    """Create a new AI prediction report for a patient."""
    db = get_database()

    report_doc = {
        "patient_id": current_user["_id"],
        "patient_name": current_user.get("full_name", ""),
        "image_url": report.image_url,
        "prediction": report.prediction,
        "confidence": report.confidence,
        "probabilities": report.probabilities,
        "gradcam_url": report.gradcam_url,
        "notes": report.notes or "",
        "doctor_feedback": None,
        "doctor_id": None,
        "severity": None,
        "recommendations": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await db.reports.insert_one(report_doc)
    report_doc["_id"] = str(result.inserted_id)
    report_doc["id"] = str(result.inserted_id)

    return {"report": report_doc}


@router.get("/my-reports")
async def get_my_reports(current_user: dict = Depends(require_role("patient"))):
    """Get reports for the current patient that are not hidden from dashboard."""
    db = get_database()

    cursor = db.reports.find(
        {
            "patient_id": current_user["_id"],
            "hidden_on_dashboard": {"$ne": True}
        }
    ).sort("created_at", -1)

    reports = []
    async for report in cursor:
        report["_id"] = str(report["_id"])
        report["id"] = report["_id"]
        reports.append(report)

    return {"reports": reports}


@router.get("/my-history")
async def get_my_history(current_user: dict = Depends(require_role("patient"))):
    """Get ALL reports for the current patient, including hidden ones."""
    db = get_database()

    cursor = db.reports.find(
        {"patient_id": current_user["_id"]}
    ).sort("created_at", -1)

    reports = []
    async for report in cursor:
        report["_id"] = str(report["_id"])
        report["id"] = report["_id"]
        reports.append(report)

    return {"history": reports}


@router.get("/all-patient-reports")
async def get_all_patient_reports(
    current_user: dict = Depends(require_role("doctor"))
):
    """Get all patient reports (for doctors to review)."""
    db = get_database()

    # Get patient IDs from consultations assigned to this doctor
    consultation_cursor = db.consultations.find({"doctor_id": current_user["_id"]})
    assigned_patient_ids = []
    async for consultation in consultation_cursor:
        assigned_patient_ids.append(consultation["patient_id"])
    
    # Also include reports where this doctor has already provided feedback
    query = {
        "$and": [
            {
                "$or": [
                    {"patient_id": {"$in": assigned_patient_ids}},
                    {"doctor_id": current_user["_id"]}
                ]
            },
            {"hidden_for_doctor": {"$ne": current_user["_id"]}}
        ]
    }
    
    cursor = db.reports.find(query).sort("created_at", -1)

    reports = []
    async for report in cursor:
        report["_id"] = str(report["_id"])
        report["id"] = report["_id"]
        # Fetch patient details
        if report.get("patient_id"):
            try:
                patient = await db.users.find_one(
                    {"_id": ObjectId(report["patient_id"])},
                    {"password": 0}
                )
                if patient:
                    report["patient_name"] = patient.get("full_name", "Unknown")
                    report["patient_email"] = patient.get("email", "")
                    report["patient_phone"] = patient.get("phone", "")
            except Exception:
                pass
        reports.append(report)

    return {"reports": reports}


@router.get("/{report_id}")
async def get_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific report by ID."""
    db = get_database()

    try:
        report = await db.reports.find_one({"_id": ObjectId(report_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid report ID")

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Access control
    if current_user["role"] == "patient" and report["patient_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    report["_id"] = str(report["_id"])
    report["id"] = report["_id"]
    return {"report": report}


@router.post("/feedback")
async def add_doctor_feedback(
    feedback: DoctorFeedback,
    current_user: dict = Depends(require_role("doctor"))
):
    """Add doctor feedback to a patient report."""
    db = get_database()

    try:
        report = await db.reports.find_one({"_id": ObjectId(feedback.report_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid report ID")

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    update_data = {
        "doctor_feedback": feedback.feedback,
        "doctor_id": current_user["_id"],
        "doctor_name": current_user.get("full_name", ""),
        "severity": feedback.severity,
        "recommendations": feedback.recommendations,
        "updated_at": datetime.now(timezone.utc),
    }

    await db.reports.update_one(
        {"_id": ObjectId(feedback.report_id)},
        {"$set": update_data}
    )

    return {"message": "Feedback added successfully"}
    

@router.put("/clear-all")
async def clear_all_reports(current_user: dict = Depends(require_role("patient"))):
    """Mark all scan reports as hidden for the current patient."""
    db = get_database()
    
    result = await db.reports.update_many(
        {"patient_id": current_user["_id"]},
        {"$set": {"hidden_on_dashboard": True}}
    )
    
    return {
        "message": "Dashboard reports cleared",
        "updated_count": result.modified_count
    }

@router.put("/clear-for-doctor")
async def clear_for_doctor(current_user: dict = Depends(require_role("doctor"))):
    """Mark all currently visible reports as hidden for this doctor."""
    db = get_database()
    
    # We only hide reports that are already reviewed to avoid missing new ones
    # or just hide all that are currently assigned. Let's hide all currently visible.
    
    # 1. Get assigned patients
    consultation_cursor = db.consultations.find({"doctor_id": current_user["_id"]})
    assigned_patient_ids = []
    async for consultation in consultation_cursor:
        assigned_patient_ids.append(consultation["patient_id"])

    # 2. Update them
    result = await db.reports.update_many(
        {
            "$or": [
                {"patient_id": {"$in": assigned_patient_ids}},
                {"doctor_id": current_user["_id"]}
            ]
        },
        {"$set": {"hidden_for_doctor": current_user["_id"]}}
    )
    
    return {
        "message": "Doctor dashboard cleared",
        "updated_count": result.modified_count
    }
