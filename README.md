<div align="center">
  <h1 align="center">VedaAI Assessment Creator</h1>
  <p align="center">
    <strong>An AI-powered assessment creation platform for teachers</strong>
    <br/>
    A full-stack application that allows teachers to create custom assignments, generate structured question papers using AI, and view the output in real-time.
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3-cyan?logo=tailwind-css" alt="Tailwind CSS" />
    <br/>
    <img src="https://img.shields.io/badge/Express.js-Node.js-green?logo=node.js" alt="Express" />
    <img src="https://img.shields.io/badge/BullMQ-Queue-red" alt="BullMQ" />
    <img src="https://img.shields.io/badge/Redis-Cache-red?logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Live_Demo-Vercel-black?logo=vercel" alt="Live Demo" />
  </p>

  <p align="center">
    <a href="https://assignment-veda.vercel.app/">Live Demo</a>
    ·
    <a href="#architecture">Architecture</a>
    ·
    <a href="#quick-start">Quick Start</a>
  </p>
</div>

---

## 🎯 Overview

Built as a Full Stack Engineering Assignment, **VedaAI** is an AI Assessment Creator that faithfully implements the provided Figma designs. We have built a complete, production-ready system that enables teachers to instantly generate, regenerate, and manage structured assessment papers using AI.

---

## 💻 Frontend System (Assignment Creation)

We built the frontend to be highly responsive and heavily reliant on smooth, modern UX, closely matching the Figma blueprints.

- **Form Implementation:** A multi-step form utilizing React hooks and `Zustand` for global state management to handle complex user inputs (Question counts, types, time allowance, and contextual text). We custom-built UI elements like sleek dropdowns to replace native OS selectors.
- **Validation:** Implemented strict input validation to ensure marks and question counts cannot be negative or empty.
- **Real-Time UX (WebSockets):** The moment an assignment generation is queued, the UI connects to a WebSocket server. It displays a live toast notification reflecting the AI's exact progress (e.g., "Connecting to AI... 35%"), so the teacher never stares at a frozen screen.

---

## ⚙️ Backend System

Our Node.js + Express (TypeScript) backend is designed for reliability and asynchronous processing, effectively separating the API from heavy AI tasks.

- **Job Queuing with BullMQ:** When a request hits `/api/assignments`, the backend saves a pending record in **MongoDB** and offloads the intensive LLM request to a **BullMQ** worker.
- **Caching Layer:** We use **Redis** to aggressively cache generated question papers (for 1 hour). When a user reloads the result page, the paper is served instantly from memory without hitting MongoDB.
- **Real-time Notifications:** As the BullMQ worker processes the Gemini response, it emits progress updates to a custom WebSocket (`ws`) server, which instantly broadcasts them to the connected frontend client.

---

## 🧠 AI Question Generation

The core engine is powered by **Google Gemini 2.5 Flash**. We took strict measures to ensure the AI operates deterministically.

- **Prompt Engineering & Schema Enforcement:** We avoid raw LLM responses. Our prompt strictly instructs Gemini to return a specific JSON schema matching our internal `QuestionPaper` interface.
- **Structured Segregation:** The worker parses the JSON to automatically group questions into Sections (A, B, etc.) and tags each question with its appropriate Difficulty (Easy/Moderate/Hard) and marks.
- **Resilience:** The worker verifies the parsed JSON. If the structure is invalid or the API fails, it safely catches the error and notifies the frontend queue to display an error state.

---

## 📄 Output Page (Enhanced)

The output view was crafted to replicate a professional, real-world exam paper with a high degree of polish.

- **Structured Layout:** The paper is organized cleanly with a Top Header (School Name, Time Allowed), a Student Info section (Name, Roll No., Section), and perfectly aligned Question Sections containing specific instructions.
- **Visual Difficulty Badges:** Each question dynamically renders a color-coded difficulty tag (Green for Easy, Yellow for Moderate, Red for Hard).
- **PDF Export:** We built a dedicated `usePdfExport` hook using `html2pdf.js` that locks the internal viewport width (1024px) during generation. This ensures the downloaded A4 PDF maintains perfect desktop formatting and margins, even if the teacher downloads it from a mobile device.
- **Regenerate Flow:** We added an intuitive "Regenerate" button next to the download action. This fires off a new background job and effortlessly transitions the user through the live WebSocket loading flow to the new paper.

---

## 🏗️ Architecture

```text
VedaAI/
├── frontend/          # Next.js 15, TypeScript, Zustand, Tailwind CSS, Lucide Icons
├── backend/           # Node.js, Express, BullMQ, Mongoose, Redis, WebSocket
├── docker-compose.yml # MongoDB 7 + Redis 7 configuration
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Google Gemini API key

### 1. Clone & Setup
```bash
git clone https://github.com/makeprodigy/assignment_veda.git
cd assignment_veda
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
