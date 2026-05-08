"""
SkinCare AI - Admin Router
Handles system-wide management and analytics.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.auth.jwt_handler import get_current_user, require_role
from app.database import get_database
from app.models.schemas import UserProfileUpdate
from bson import ObjectId
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(require_role("admin"))):
    """Get system-wide analytics for the dashboard."""
    db = get_database()
    
    # Counts
    total_users = await db.users.count_documents({})
    total_patients = await db.users.count_documents({"role": "patient"})
    total_doctors = await db.users.count_documents({"role": "doctor"})
    total_pharmacies = await db.users.count_documents({"role": "pharmacy"})
    
    total_reports = await db.reports.count_documents({})
    total_orders = await db.orders.count_documents({})
    
    # Recent activity (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_users = await db.users.count_documents({"created_at": {"$gte": seven_days_ago}})
    recent_reports = await db.reports.count_documents({"created_at": {"$gte": seven_days_ago}})
    
    # Revenue (Total of all delivered orders)
    cursor = db.orders.find({"status": "delivered"})
    total_revenue = 0
    async for order in cursor:
        total_revenue += order.get("total_amount", 0)

    return {
        "stats": {
            "totalUsers": total_users,
            "totalPatients": total_patients,
            "totalDoctors": total_doctors,
            "totalPharmacies": total_pharmacies,
            "totalReports": total_reports,
            "totalOrders": total_orders,
            "totalRevenue": total_revenue,
            "recentGrowth": recent_users
        },
        "activity": {
            "newReports": recent_reports,
        }
    }

@router.get("/users")
async def list_users(current_user: dict = Depends(require_role("admin"))):
    """List all users in the system."""
    db = get_database()
    cursor = db.users.find({}, {"password": 0}).sort("created_at", -1)
    users = []
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)
    return {"users": users}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_role("admin"))):
    """Delete a user from the system."""
    db = get_database()
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

@router.put("/users/{user_id}")
async def update_user_status(user_id: str, is_active: bool, current_user: dict = Depends(require_role("admin"))):
    """Enable or disable a user."""
    db = get_database()
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": is_active, "updated_at": datetime.now(timezone.utc)}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": f"User {'activated' if is_active else 'deactivated'} successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

@router.get("/logs")
async def get_system_logs(current_user: dict = Depends(require_role("admin"))):
    """Get recent system-wide activity logs."""
    db = get_database()
    logs = []
    
    # Recent Users
    cursor = db.users.find().sort("created_at", -1).limit(10)
    async for u in cursor:
        logs.append({
            "id": str(u["_id"]),
            "type": "USER_REGISTRATION",
            "message": f"New user registered: {u.get('full_name')} ({u.get('role')})",
            "timestamp": u.get("created_at"),
            "severity": "info"
        })
        
    # Recent Reports
    cursor = db.reports.find().sort("created_at", -1).limit(10)
    async for r in cursor:
        logs.append({
            "id": str(r["_id"]),
            "type": "REPORT_CREATED",
            "message": f"AI Scan performed by {r.get('patient_name')}: {r.get('prediction')}",
            "timestamp": r.get("created_at"),
            "severity": "warning" if r.get("confidence", 0) > 80 else "info"
        })
        
    # Recent Orders
    cursor = db.orders.find().sort("created_at", -1).limit(10)
    async for o in cursor:
        logs.append({
            "id": str(o["_id"]),
            "type": "ORDER_PLACED",
            "message": f"New order placed by {o.get('patient_name')} for Rs. {o.get('total_amount')}",
            "timestamp": o.get("created_at"),
            "severity": "success"
        })
        
    # Sort all by timestamp
    logs.sort(key=lambda x: x["timestamp"] if x["timestamp"] else datetime.min, reverse=True)
    return {"logs": logs[:20]}
