import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load env from backend
load_dotenv(os.path.join('backend', '.env'))

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "skincare_ai")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    admin_email = "admin@skincare.ai"
    admin_password = "adminpassword123"
    
    # Check if exists
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print(f"Admin already exists: {admin_email}")
        return

    admin_doc = {
        "email": admin_email,
        "password": pwd_context.hash(admin_password),
        "full_name": "System Administrator",
        "role": "admin",
        "phone": "0000000000",
        "is_active": True,
        "is_approved": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(admin_doc)
    print("SUCCESS: Admin user created successfully!")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")

if __name__ == "__main__":
    asyncio.run(create_admin())
