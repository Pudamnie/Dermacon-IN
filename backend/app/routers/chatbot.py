"""
SkinCare AI - Chatbot Router
Smart medical chatbot for skin health questions and database queries.
"""
from fastapi import APIRouter, Depends
from app.models.schemas import ChatbotMessage, ChatbotResponse
from app.auth.jwt_handler import get_current_user
from app.database import get_database

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

SKIN_KNOWLEDGE = {
    "melanoma": "Melanoma is the most serious type of skin cancer. It develops in melanocytes. Early detection is crucial. Look for asymmetry, border irregularity, color variation, diameter >6mm, and evolving size (ABCDE rule).",
    "actinic keratosis": "Actinic keratosis is a rough, scaly patch caused by years of sun exposure. It can develop into squamous cell carcinoma if untreated.",
    "basal cell carcinoma": "Basal cell carcinoma is the most common type of skin cancer. It often appears as a pearly bump or flat lesion. It rarely metastasizes but can be locally destructive.",
    "squamous cell carcinoma": "Squamous cell carcinoma develops in the squamous cells of the outer layer of skin. Early treatment has a high success rate.",
    "sunscreen": "Use broad-spectrum SPF 30+ sunscreen daily, even on cloudy days. Reapply every 2 hours when outdoors. Check out the Pharmacy Store in the app to buy some!",
    "mole": "Most moles are harmless. Monitor for changes using the ABCDE rule. If a mole changes in size, shape, or color, consult a dermatologist immediately.",
    "skin check": "Regular skin self-examinations are recommended monthly. See a dermatologist annually for a professional skin check.",
    "treatment": "Treatment depends on the type and stage of skin cancer. Options include surgery, radiation, chemotherapy, immunotherapy, and targeted therapy.",
    "prevention": "Key prevention tips: wear sunscreen, avoid tanning beds, wear protective clothing, seek shade during peak UV hours (10am-4pm), and perform regular skin checks.",
}

SUGGESTIONS = [
    "What was my last scan?",
    "How many reports do I have?",
    "Are there any dermatologists available?",
    "What is melanoma?",
]

@router.post("/ask", response_model=ChatbotResponse)
async def ask_chatbot(msg: ChatbotMessage, current_user: dict = Depends(get_current_user)):
    user_msg = msg.message.lower().strip()
    db = get_database()

    # DB Query: Check Reports
    if any(k in user_msg for k in ["last scan", "recent scan", "last report"]):
        last_report = await db.reports.find_one(
            {"patient_id": str(current_user["_id"])}, 
            sort=[("created_at", -1)]
        )
        if last_report:
            return ChatbotResponse(
                response=f"Your last scan was on {last_report['created_at'].strftime('%Y-%m-%d')}. The AI predicted '{last_report['prediction']}' with a confidence of {last_report['confidence']:.1f}%.",
                suggestions=["How many reports do I have?", "What is melanoma?"]
            )
        else:
            return ChatbotResponse(response="You don't have any scans yet. Go to the 'Upload' tab to analyze a skin image!", suggestions=SUGGESTIONS)

    if any(k in user_msg for k in ["how many scans", "how many reports", "total scans"]):
        count = await db.reports.count_documents({"patient_id": str(current_user["_id"])})
        return ChatbotResponse(
            response=f"You have completed a total of {count} AI skin scans.",
            suggestions=["What was my last scan?", "Are there any dermatologists available?"]
        )

    # DB Query: Check Doctors
    if any(k in user_msg for k in ["doctor", "dermatologist", "consult"]):
        doc_count = await db.users.count_documents({"role": "doctor"})
        return ChatbotResponse(
            response=f"There are currently {doc_count} registered dermatologists on the platform. Go to the 'Consult' tab to book an appointment or send them a message.",
            suggestions=["Tell me about skin checks.", "What does an abnormal mole look like?"]
        )

    # DB Query: Check Pharmacy Products
    if any(k in user_msg for k in ["buy", "pharmacy", "store", "product", "cream", "sunscreen"]):
        product_count = await db.products.count_documents({})
        if product_count > 0:
            return ChatbotResponse(
                response=f"Yes! We currently have {product_count} products available in our Pharmacy Store, including sunscreens and creams. Head to the 'Store' tab to browse and place an order.",
                suggestions=SUGGESTIONS
            )

    # Check knowledge base
    for key, value in SKIN_KNOWLEDGE.items():
        if key in user_msg:
            return ChatbotResponse(response=value, suggestions=SUGGESTIONS[:3])

    # General responses
    if any(w in user_msg for w in ["hello", "hi", "hey"]):
        return ChatbotResponse(
            response=f"Hello {current_user.get('full_name', '')}! I'm your AI assistant. I can answer medical questions or fetch details from your account (like your recent scans). How can I help?",
            suggestions=SUGGESTIONS
        )

    return ChatbotResponse(
        response="I'm specialized in skin health. Ask me about your past scans, available doctors, pharmacy products, or general skin conditions like melanoma.",
        suggestions=SUGGESTIONS
    )
