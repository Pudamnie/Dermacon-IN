import pytest
import pytest_asyncio
from httpx import AsyncClient
from app.main import app
from app.database import connect_to_database, close_database_connection, get_database

# Pytest configuration to run async tests
pytestmark = pytest.mark.asyncio

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    # Setup test DB connection
    await connect_to_database()
    db = get_database()
    
    # Clean up test data before tests run
    await db.users.delete_many({"email": {"$regex": "^test_"}})
    await db.products.delete_many({"name": {"$regex": "^Test "}})
    
    yield
    
    # Cleanup after tests
    await db.users.delete_many({"email": {"$regex": "^test_"}})
    await db.products.delete_many({"name": {"$regex": "^Test "}})
    await close_database_connection()

@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://testserver/api") as client:
        yield client

# ─── Auth Tests ────────────────────────────────────────────────

async def test_register_patient(async_client: AsyncClient):
    payload = {
        "email": "test_patient@example.com",
        "password": "password123",
        "full_name": "Test Patient",
        "role": "patient"
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_patient@example.com"
    assert data["user"]["role"] == "patient"

async def test_register_pharmacy(async_client: AsyncClient):
    payload = {
        "email": "test_pharmacy@example.com",
        "password": "password123",
        "full_name": "Test Pharmacy User",
        "role": "pharmacy",
        "pharmacy_name": "Test Pharmacy Inc"
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["user"]["pharmacy_name"] == "Test Pharmacy Inc"

async def test_login_user(async_client: AsyncClient):
    # Register first
    await async_client.post("/auth/register", json={
        "email": "test_login@example.com",
        "password": "password123",
        "full_name": "Login Test",
        "role": "patient"
    })
    
    # Login
    response = await async_client.post("/auth/login", json={
        "email": "test_login@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_login@example.com"

# ─── Product Tests ─────────────────────────────────────────────

async def test_create_and_list_product(async_client: AsyncClient):
    # 1. Register a pharmacy to get a token
    reg_response = await async_client.post("/auth/register", json={
        "email": "test_pharmacy_prod@example.com",
        "password": "password123",
        "full_name": "Test Pharm",
        "role": "pharmacy"
    })
    token = reg_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a product using the pharmacy token
    prod_payload = {
        "name": "Test Sunscreen SPF 50",
        "description": "High protection",
        "price": 19.99,
        "category": "Skincare",
        "stock": 100
    }
    response = await async_client.post("/products/", json=prod_payload, headers=headers)
    assert response.status_code == 201
    created_prod = response.json()["product"]
    assert created_prod["name"] == "Test Sunscreen SPF 50"

    # 3. List all products
    list_response = await async_client.get("/products/", headers=headers)
    assert list_response.status_code == 200
    products = list_response.json()["products"]
    assert any(p["name"] == "Test Sunscreen SPF 50" for p in products)

# ─── Access Control Tests ──────────────────────────────────────

async def test_patient_cannot_create_product(async_client: AsyncClient):
    # Register a patient
    reg_response = await async_client.post("/auth/register", json={
        "email": "test_patient_prod@example.com",
        "password": "password123",
        "full_name": "Test Patient",
        "role": "patient"
    })
    token = reg_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to create product (should be forbidden)
    prod_payload = {
        "name": "Test Patient Prod",
        "description": "Should fail",
        "price": 10.0,
        "category": "Test",
        "stock": 1
    }
    response = await async_client.post("/products/", json=prod_payload, headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]
