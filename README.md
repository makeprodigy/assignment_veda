# VedaAI — AI Assessment Creator

A full-stack AI-powered assessment creation platform built for teachers. Create structured question papers with AI in seconds.

![VedaAI](https://img.shields.io/badge/VedaAI-AI%20Assessment%20Creator-FF5623?style=for-the-badge)

---

## 🏗️ Architecture

```
VedaAI/
├── frontend/          # Next.js 14 + TypeScript + Zustand
├── backend/           # Node.js + Express + TypeScript
├── docker-compose.yml # MongoDB 7 + Redis 7
└── README.md
```

### System Flow

```
Teacher Form Submit
      │
      ▼
POST /api/assignments  ──►  MongoDB (status: pending)
      │                          │
      ▼                          ▼
Return { jobId }         BullMQ Job Enqueued
      │                          │
Frontend: WS subscribe   Worker picks up job
      │                     │
      │                     ├─ Build structured prompt
      │                     ├─ Call Gemini 2.5 Flash
      │                     ├─ Parse + validate JSON
      │                     ├─ Save to MongoDB
      │                     ├─ Cache in Redis
      │                     └─ Broadcast job:complete via WS
      │                          │
      └──────── WS event ◄────────┘
                    │
             Redirect to /assignments/result/:jobId
                    │
             Fetch result (Redis → MongoDB)
                    │
             Render Question Paper
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **State** | Zustand |
| **Styling** | Tailwind CSS + Custom CSS (Figma design tokens) |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | MongoDB 7 (Mongoose) |
| **Cache/Queue** | Redis 7 + BullMQ |
| **Real-time** | WebSocket (`ws` library) |
| **AI** | Google Gemini 2.5 Flash |
| **PDF** | PDFKit |
| **Auth** | JWT (httpOnly approach) |

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Google Gemini API key

### 1. Clone & Setup

```bash
git clone <repo-url>
cd VedaAI
```

### 2. Start Infrastructure

```bash
docker-compose up -d
# MongoDB on :27017, Redis on :6379
```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY
npm run dev
# Backend running on http://localhost:4000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
# Frontend running on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_HOST` | Redis host (default: localhost) |
| `REDIS_PORT` | Redis port (default: 6379) |
| `JWT_SECRET` | Secret for JWT signing |
| `GEMINI_API_KEY` | Google Gemini API key |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL |

---

## 📱 Features

### Core
- **Assignment Creation** — Multi-step form with file upload, question types, marks configuration
- **AI Generation** — Gemini 2.5 Flash generates structured question papers with sections A/B/C
- **Real-time Updates** — WebSocket shows live progress (0% → 100%)
- **Output Page** — Exam-style paper with school header, student info fields, difficulty badges
- **Authentication** — Teacher and Student roles with JWT

### Bonus
- **PDF Export** — Download question paper as formatted PDF
- **Regenerate** — Re-run AI generation for the same assignment
- **Redis Caching** — Results cached for fast repeat access
- **Mobile Responsive** — Works on all screen sizes

---

## 🎨 Design

Built pixel-perfectly from Figma designs:
- **Font**: Bricolage Grotesque (UI) + Inter (content)
- **Primary**: `#FF5623` (orange)
- **Dark**: `#171717`
- Responsive layout with sidebar (304px) on desktop, bottom tab bar on mobile

---

## 📁 API Endpoints

```
POST   /api/auth/register        Register user
POST   /api/auth/login           Login
GET    /api/auth/me              Get current user

POST   /api/assignments          Create assignment + queue job
GET    /api/assignments          List user's assignments  
GET    /api/assignments/:id      Get single assignment
DELETE /api/assignments/:id      Delete assignment

GET    /api/results/:jobId       Get generated paper (cached)
POST   /api/results/:jobId/regenerate  Regenerate paper
GET    /api/results/:jobId/pdf   Download as PDF

WS     ws://localhost:4000       WebSocket for job updates
```

---

## 🧪 Testing

```bash
# Type check
cd backend && npm run typecheck
cd frontend && npm run typecheck

# Lint
cd frontend && npm run lint
```

---

## 📄 Approach

1. **Prompt Engineering**: Built a structured prompt that forces Gemini to output valid JSON matching our `QuestionPaper` schema. Never renders raw LLM output.
2. **Job Queue**: BullMQ ensures reliable background processing. Frontend subscribes to WebSocket channel by `jobId` for real-time status.
3. **Caching**: Redis caches generated papers for 1 hour, avoiding repeated LLM calls.
4. **Validation**: Zod validates all inputs on both frontend (react-hook-form) and backend middleware.
5. **PDF**: PDFKit generates properly formatted A4 exam papers server-side.
