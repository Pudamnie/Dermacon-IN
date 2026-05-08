"""
SkinCare AI - Orders Router
Handles order creation, tracking, and status updates.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import OrderCreate, OrderStatusUpdate
from app.auth.jwt_handler import get_current_user, require_role
from app.database import get_database
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate, current_user: dict = Depends(require_role("patient"))):
    db = get_database()
    try:
        pharmacy = await db.users.find_one({"_id": ObjectId(order.pharmacy_id), "role": "pharmacy"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid pharmacy ID")
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")

    order_doc = {
        "patient_id": current_user["_id"],
        "patient_name": current_user.get("full_name", ""),
        "pharmacy_id": order.pharmacy_id,
        "pharmacy_name": pharmacy.get("pharmacy_name", pharmacy.get("full_name", "")),
        "items": [item.model_dump() for item in order.items],
        "delivery_address": order.delivery_address,
        "total_amount": order.total_amount,
        "status": "pending",
        "status_history": [{"status": "pending", "timestamp": datetime.now(timezone.utc).isoformat(), "note": "Order placed"}],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.orders.insert_one(order_doc)
    order_doc["_id"] = str(result.inserted_id)
    order_doc["id"] = str(result.inserted_id)
    await db.users.update_one({"_id": ObjectId(order.pharmacy_id)}, {"$inc": {"orders_count": 1}})
    for item in order.items:
        await db.products.update_one({"_id": ObjectId(item.product_id)}, {"$inc": {"stock": -item.quantity}})
    return {"order": order_doc}


@router.get("/my-orders")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    db = get_database()
    if current_user["role"] == "patient":
        query = {"patient_id": current_user["_id"]}
    elif current_user["role"] == "pharmacy":
        query = {"pharmacy_id": current_user["_id"], "is_cleared": {"$ne": True}}
    else:
        query = {}
    cursor = db.orders.find(query).sort("created_at", -1)
    orders = []
    async for order in cursor:
        order["_id"] = str(order["_id"])
        order["id"] = order["_id"]
        orders.append(order)
    return {"orders": orders}


@router.get("/history")
async def get_order_history(
    current_user: dict = Depends(get_current_user)
):
    """Get past records (History) for Pharmacy and Doctor."""
    db = get_database()
    if current_user["role"] == "pharmacy":
        # For pharmacy, history = delivered or cleared orders
        cursor = db.orders.find({
            "pharmacy_id": current_user["_id"],
            "$or": [{"status": "delivered"}, {"is_cleared": True}]
        }).sort("created_at", -1)
        records = []
        async for r in cursor:
            r["_id"] = str(r["_id"])
            r["id"] = r["_id"]
            records.append(r)
        return {"history": records}
    elif current_user["role"] == "doctor":
        # For doctor, history = reviewed reports OR hidden reports
        cursor = db.reports.find({
            "$or": [
                {"doctor_feedback": {"$ne": None}},
                {"hidden_for_doctor": current_user["_id"]}
            ]
        }).sort("created_at", -1)
        records = []
        async for r in cursor:
            r["_id"] = str(r["_id"])
            r["id"] = r["_id"]
            records.append(r)
        return {"history": records}
    return {"history": []}


@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid order ID")
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user["role"] == "patient" and order["patient_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user["role"] == "pharmacy" and order["pharmacy_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    order["_id"] = str(order["_id"])
    order["id"] = order["_id"]
    return {"order": order}


@router.put("/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, current_user: dict = Depends(require_role("pharmacy"))):
    db = get_database()
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid order ID")
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["pharmacy_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not your order")
    history_entry = {"status": status_update.status.value, "timestamp": datetime.now(timezone.utc).isoformat(), "note": f"Status updated to {status_update.status.value}"}
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status_update.status.value, "updated_at": datetime.now(timezone.utc)}, "$push": {"status_history": history_entry}}
    )
    return {"message": f"Order status updated to {status_update.status.value}"}

@router.put("/{order_id}/clear")
async def clear_order(
    order_id: str,
    current_user: dict = Depends(require_role("pharmacy"))
):
    """Mark an order as cleared (hidden from dashboard)."""
    db = get_database()
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"is_cleared": True, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Order cleared"}
@router.put("/clear-all")
async def clear_all_orders(current_user: dict = Depends(require_role("pharmacy"))):
    """Mark all active orders as cleared for the current pharmacy."""
    db = get_database()
    
    result = await db.orders.update_many(
        {"pharmacy_id": current_user["_id"], "is_cleared": {"$ne": True}},
        {"$set": {"is_cleared": True, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {
        "message": "All orders cleared from dashboard",
        "updated_count": result.modified_count
    }