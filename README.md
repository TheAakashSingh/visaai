# VisaAI Pro — Complete Production Codebase

## Stack
- **Frontend**: React 18 + Vite + Zustand + Framer Motion + Recharts + TailwindCSS
- **Backend**: Node.js + Express + MongoDB (Mongoose) + Socket.IO + JWT
- **AI Service**: Python FastAPI + OpenAI GPT-4 + LangChain + Google Vision OCR
- **Infrastructure**: Docker Compose, Redis, Nginx

## Quick Start

```bash
# 1. Clone & install
git clone <repo>
cd visaai

# 2. Environment setup
cp .env.example .env
# Fill in your keys (OpenAI, Twilio, WhatsApp, MongoDB, etc.)

# 3. Start everything with Docker
docker-compose up --build

# OR run manually:

# Terminal 1 — MongoDB + Redis (or use cloud)
# Terminal 2 — AI Service
cd ai-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# Terminal 3 — Backend API
cd backend && npm install && npm run dev

# Terminal 4 — Frontend
cd frontend && npm install && npm run dev
```

## Architecture
```
visaai/
├── frontend/          React SPA (port 5173)
├── backend/           Express API (port 3001)
├── ai-service/        FastAPI AI (port 8000)
├── docker-compose.yml
└── nginx/             Reverse proxy (port 80)
```

## Key Features
- WhatsApp Business API chatbot (bilingual EN/HI)
- AI Voice Bot (Twilio + ElevenLabs TTS)
- OCR Document Processing (Google Vision API)
- Lead CRM with real-time updates (Socket.IO)
- GPT-4 fine-tuned AI assistant
- Analytics dashboard
- JWT auth + role-based access
