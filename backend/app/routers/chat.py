"""
SkinCare AI - Chat Router
Handles real-time messaging between patients and doctors.
"""
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ChatMessageCreate
from app.auth.jwt_handler import get_current_user
from app.database import get_database
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/send")
async def send_message(msg: ChatMessageCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        receiver = await db.users.find_one({"_id": ObjectId(msg.receiver_id)}, {"password": 0})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid receiver ID")
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    chat_doc = {
        "sender_id": current_user["_id"],
        "sender_name": current_user.get("full_name", ""),
        "sender_role": current_user.get("role", ""),
        "receiver_id": msg.receiver_id,
        "receiver_name": receiver.get("full_name", ""),
        "receiver_role": receiver.get("role", ""),
        "message": msg.message,
        "message_type": msg.message_type,
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.chats.insert_one(chat_doc)
    chat_doc["_id"] = str(result.inserted_id)
    chat_doc["id"] = str(result.inserted_id)
    return {"message": chat_doc}


@router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    db = get_database()
    uid = current_user["_id"]
    pipeline = [
        {"$match": {"$or": [{"sender_id": uid}, {"receiver_id": uid}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": {"$cond": [{"$eq": ["$sender_id", uid]}, "$receiver_id", "$sender_id"]},
            "last_message": {"$first": "$message"},
            "last_time": {"$first": "$created_at"},
            "other_name": {"$first": {"$cond": [{"$eq": ["$sender_id", uid]}, "$receiver_name", "$sender_name"]}},
            "other_role": {"$first": {"$cond": [{"$eq": ["$sender_id", uid]}, "$receiver_role", "$sender_role"]}},
            "unread": {"$sum": {"$cond": [{"$and": [{"$eq": ["$receiver_id", uid]}, {"$eq": ["$is_read", False]}]}, 1, 0]}},
        }},
        {"$sort": {"last_time": -1}},
    ]
    conversations = []
    async for conv in db.chats.aggregate(pipeline):
        conv["user_id"] = conv.pop("_id")
        conversations.append(conv)
    return {"conversations": conversations}


@router.get("/messages/{other_user_id}")
async def get_messages(other_user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    uid = current_user["_id"]
    cursor = db.chats.find({
        "$or": [
            {"sender_id": uid, "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": uid},
        ]
    }).sort("created_at", 1)
    messages = []
    async for msg in cursor:
        msg["_id"] = str(msg["_id"])
        msg["id"] = msg["_id"]
        messages.append(msg)
    # Mark as read
    await db.chats.update_many(
        {"sender_id": other_user_id, "receiver_id": uid, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"messages": messages}
