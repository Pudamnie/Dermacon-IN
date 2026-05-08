"""
SkinCare AI - Products Router
Handles pharmacy product management - CRUD operations.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import ProductCreate, ProductUpdate
from app.auth.jwt_handler import get_current_user, require_role
from app.database import get_database
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    current_user: dict = Depends(require_role("pharmacy"))
):
    """Create a new product (pharmacy only)."""
    db = get_database()

    product_doc = {
        "pharmacy_id": current_user["_id"],
        "pharmacy_name": current_user.get("pharmacy_name", current_user.get("full_name", "")),
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "images": product.images or [],
        "stock": product.stock,
        "ingredients": product.ingredients or "",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await db.products.insert_one(product_doc)
    product_doc["_id"] = str(result.inserted_id)
    product_doc["id"] = str(result.inserted_id)

    # Update pharmacy product count
    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$inc": {"products_count": 1}}
    )

    return {"product": product_doc}


@router.get("/")
async def list_all_products(current_user: dict = Depends(get_current_user)):
    """List all active products (for patients to browse)."""
    db = get_database()

    cursor = db.products.find({"is_active": True}).sort("created_at", -1)
    products = []
    async for product in cursor:
        product["_id"] = str(product["_id"])
        product["id"] = product["_id"]
        products.append(product)

    return {"products": products}


@router.get("/my-products")
async def get_my_products(
    current_user: dict = Depends(require_role("pharmacy"))
):
    """Get all products for the current pharmacy."""
    db = get_database()

    cursor = db.products.find(
        {"pharmacy_id": current_user["_id"], "is_active": True}
    ).sort("created_at", -1)

    products = []
    async for product in cursor:
        product["_id"] = str(product["_id"])
        product["id"] = product["_id"]
        products.append(product)

    return {"products": products}


@router.get("/{product_id}")
async def get_product(product_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific product by ID."""
    db = get_database()

    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid product ID")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product["_id"] = str(product["_id"])
    product["id"] = product["_id"]
    return {"product": product}


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    updates: ProductUpdate,
    current_user: dict = Depends(require_role("pharmacy"))
):
    """Update a product (pharmacy owner only)."""
    db = get_database()

    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid product ID")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product["pharmacy_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not your product")

    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )

    updated = await db.products.find_one({"_id": ObjectId(product_id)})
    updated["_id"] = str(updated["_id"])
    updated["id"] = updated["_id"]
    return {"product": updated}


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(require_role("pharmacy"))
):
    """Soft-delete a product."""
    db = get_database()

    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid product ID")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product["pharmacy_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not your product")

    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
    )

    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$inc": {"products_count": -1}}
    )

    return {"message": "Product deleted successfully"}
