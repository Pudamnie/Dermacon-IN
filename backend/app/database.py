"""
SkinCare AI - Database Module
Handles MongoDB connection using Motor async driver.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db = None


async def connect_to_database():
    """Initialize MongoDB connection."""
    global client, db
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            maxPoolSize=50,
            minPoolSize=5,
        )
        # Verify connection
        await client.admin.command("ping")
        db = client[settings.DATABASE_NAME]
        print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

        # Create indexes
        await create_indexes()
        
        # Seed admin user
        await seed_admin_user()
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise e


async def seed_admin_user():
    """Create default admin user if it doesn't exist."""
    global db
    from app.auth.jwt_handler import hash_password
    from datetime import datetime, timezone
    
    admin_email = "admin@skincare.ai"
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if not existing_admin:
        print("Seeding default admin user...")
        admin_doc = {
            "email": admin_email,
            "password": hash_password("adminpassword123"),
            "full_name": "System Administrator",
            "role": "admin",
            "is_active": True,
            "is_approved": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(admin_doc)
        print(f"Admin user created: {admin_email}")
    else:
        print("Admin user already exists.")


async def close_database_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


async def create_indexes():
    """Create necessary database indexes for performance."""
    global db
    # Users indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")

    # Reports indexes
    await db.reports.create_index("patient_id")
    await db.reports.create_index("created_at")

    # Products indexes
    await db.products.create_index("pharmacy_id")
    await db.products.create_index("category")

    # Orders indexes
    await db.orders.create_index("patient_id")
    await db.orders.create_index("pharmacy_id")
    await db.orders.create_index("status")

    # Chats indexes
    await db.chats.create_index([("sender_id", 1), ("receiver_id", 1)])
    await db.chats.create_index("created_at")

    # Consultations indexes
    await db.consultations.create_index("patient_id")
    await db.consultations.create_index("doctor_id")

    print("Database indexes created.")


def get_database():
    """Get the database instance."""
    return db
