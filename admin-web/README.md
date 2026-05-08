# SkinCare AI Admin Dashboard

A premium web-based administration panel for managing users and monitoring system analytics.

## Features
- **Analytics Dashboard**: Real-time stats on users, reports, orders, and revenue.
- **User Management**: Add, update, ban, or delete users across all roles (Patient, Doctor, Pharmacy).
- **Security**: Protected routes with JWT authentication.

## Setup Instructions

1. **Navigate to the directory**:
   ```bash
   cd admin-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the dashboard**:
   ```bash
   npm run dev
   ```

4. **Login Credentials**:
   - **Email**: `admin@skincare.ai`
   - **Password**: `adminpassword123`

## Technical Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Vanilla CSS (Premium Custom Design)
- **Icons**: Lucide React
- **Charts**: Recharts
- **API**: Axios connected to FastAPI backend
