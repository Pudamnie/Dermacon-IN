import asyncio
from app.database import connect_to_database, get_database

async def fix_doctors():
    await connect_to_database()
    db = get_database()
    if db is not None:
        # Approve all doctors for testing purposes
        result = await db.users.update_many(
            {"role": "doctor"},
            {"$set": {"is_approved": True, "is_active": True}}
        )
        print(f"Updated {result.modified_count} doctors to approved status.")
    else:
        print("Failed to connect to database.")

if __name__ == "__main__":
    asyncio.run(fix_doctors())
