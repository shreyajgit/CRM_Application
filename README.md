# 🧠 Mini CRM Platform

A modern, AI-powered Mini CRM Platform that enables **customer segmentation**, **personalized campaign delivery**, and **intelligent insights** using the MERN stack and Gemini AI APIs.

---

## 📦 Local Setup Instructions

### 🧰 Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Google OAuth credentials
- Gemini AI API Key

### ⚙️ Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mini-crm.git
   cd mini-crm
   ```

2. **Install dependencies**

   Frontend:
   ```bash
   cd frontend
   npm install
   ```

   Backend:
   ```bash
   cd ../backend
   npm install
   ```

3. **Set up environment variables**

   frontend/.env:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_BACKEND_URL=http://localhost:5000
   ```

   backend/.env:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the app**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

## 🏗️ Architecture Diagram
```
                  ┌────────────────────┐
                  │ Google OAuth 2.0   │
                  └────────┬───────────┘
                           │
                  ┌────────▼───────────┐
                  │ React + Vite Frontend │
                  └────────┬───────────┘
                           │
                           ▼
                  ┌────────────────────┐
                  │   Express Backend   │
                  ├────────────────────┤
                  │ Segment Rule Engine│
                  │ Campaign Dispatcher│
                  │ Delivery Receiver  │
                  └─────┬────┬─────────┘
                        │    │
                        ▼    ▼
         ┌──────────────┐   ┌────────────────┐
         │ MongoDB      │   │ Gemini AI API  │
         └──────────────┘   └────────────────┘
```

## 🧠 AI Tools and Tech Summary
| Tool/Tech | Usage |
|-----------|-------|
| Gemini AI API | Natural language to rule translation, message suggestions |
| Google OAuth 2.0 | Secure authentication |
| Vite + React | Fast and modern frontend |
| Express.js | RESTful backend APIs |
| MongoDB | Data storage for users, segments, campaigns |
| Redux Toolkit | Centralized state management |
| Tailwind CSS | Utility-first styling |
| React Hot Toast | User feedback and notifications |
| JWT Decode | Auth handling from Google token payload |

## ⚠️ Known Limitations / Assumptions
- 🛑 **Vendor API**: Simulated message delivery is not connected to real SMS/Email services.
- 📈 **Campaign Preview**: Audience size preview uses basic filters and doesn't auto-refresh unless triggered.
- 🤖 **AI Features**: Based on Gemini prompts; output quality depends on prompt engineering and API quota.
- 🔐 **Authentication**: Only Google OAuth is supported (no username/password or roles).
- 📊 **Scheduling Logic**: Smart schedule suggestions are mocked using hardcoded patterns.

## ✨ AI-Powered Features
| Feature | Description |
|---------|-------------|
| 🔍 **Prompt to Rules** | Type "people who spent over ₹10K and haven't visited in 6 months" and auto-generate logical filters |
| 💬 **Message Suggestions** | Given a campaign goal, AI suggests 2–3 personalized messages |
