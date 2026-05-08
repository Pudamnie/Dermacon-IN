# SkinCare AI Platform

A full-stack AI-powered mobile healthcare application.

## 🚀 Technologies

- **Backend**: FastAPI (Python), MongoDB Atlas, TensorFlow (.h5), Grad-CAM, JWT
- **Frontend**: Expo (React Native), React Navigation, Axios, Context API
- **Design Theme**: Modern Blue and Green theme with clean styling

## ⚙️ Features

1. **Role-Based Authentication**: Separate experiences for Patient, Doctor, and Pharmacy.
2. **AI Skin Analysis**: Upload image, predict using a TensorFlow model, and visualize using Grad-CAM.
3. **Medical Feedback**: Doctors can review reports and provide feedback.
4. **AI Chatbot**: Intelligent medical assistant for patients.
5. **Pharmacy Store**: Browse products and place/track orders.

## 🛠️ Setup Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Swagger UI available at: `http://localhost:8000/docs`

### 2. Frontend Setup (Mobile App)

```bash
cd mobile
npm install
```

Configure `mobile/src/api/client.ts` to point to your backend API URL. (e.g., your local IP address for physical devices).

To run the app:
```bash
npx expo start
```

To run admin-web
```bash
cd admin-web
npm run dev
```

Scan the QR code using the Expo Go app on your phone, or press 'a' to open on an Android Emulator.
How to Access the Dashboard
I have included a detailed README.md in the admin-web folder with setup instructions.

Directory: admin-web/
Start Command: cd admin-web then npm run dev
Login Credentials:
Email: admin@skincare.ai
Password: adminpassword123


## 🎨 Design System

- **Primary (Sky Blue)**: `#0284c7`
- **Secondary (Emerald Green)**: `#10b981`
- **Background**: `#f0f9ff`
- **Surface**: `#ffffff`

## 📊 Database (MongoDB)

All data is stored in the provided MongoDB Atlas cluster.
Collections: `users`, `reports`, `products`, `orders`, `chats`, `consultations`.






