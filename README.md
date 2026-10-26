# 🚀 Startup Stress Tester

> **AI-powered investor panel that stress-tests your startup ideas** — submit an idea and receive instant, multi-perspective feedback from a simulated panel of experts (VC investor, CTO, marketing strategist, operations analyst).

![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Author](#author)

---

## Overview

**Startup Stress Tester** is a full-stack web application designed for entrepreneurs who want honest, data-driven feedback on their startup ideas before pitching to real investors.

The user submits a startup idea (title, description, market size, team, tech stack, revenue model, stage), and the system runs a **simulated AI investor panel** that evaluates the idea across 5 dimensions:

| Dimension | Description |
|-----------|-------------|
| **Tech** | Technical feasibility, stack maturity, architecture |
| **Market** | Market size, opportunity, competitive landscape |
| **Go-to-Market** | Customer acquisition, channels, differentiation |
| **Scalability** | Ability to grow operations and technology |
| **Financial** | Revenue model viability, unit economics potential |

The system produces:
- ✅ Overall score (0–100) and per-dimension scores
- ✅ Verdict (Strong / Promising / Needs Work / Weak)
- ✅ Detailed feedback from 4 AI panelists
- ✅ Prioritized risks and actionable recommendations
- ✅ Refined short pitch
- ✅ MVP roadmap (3–5 steps)

---

## Features

- 🔐 **Authentication** — Secure JWT-based registration and login
- 📝 **CRUD Ideas** — Create, read, update, delete startup ideas
- 🧠 **AI Analysis Engine** — Multi-role scoring with 4 simulated expert panelists
- 📊 **Interactive Dashboard** — Visual radar charts (Recharts), score breakdowns
- 🛡️ **Security** — Helmet, rate limiting, bcrypt password hashing, input validation (Zod)
- 🐳 **Docker Ready** — Full docker-compose for one-command startup
- ✅ **Tested** — Unit tests (analysis engine) + integration-ready
- 📱 **Responsive** — Tailwind CSS, mobile-first design

---

## Architecture

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Frontend   │──────▶│   Backend    │──────▶│   MongoDB    │
│  React/Vite  │ REST  │ Express/TS   │       │   Database   │
│  Tailwind    │◀──────│ JWT Auth     │◀──────│              │
│  Recharts    │       │ Zod Valid.   │       │              │
└──────────────┘       │ Analysis Eng.│       └──────────────┘
     :3000             └──────────────┘            :27017
                            :4000
```

See [DESIGN.md](./DESIGN.md) for detailed architecture decisions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Node.js 20, Express 4, TypeScript, Mongoose 8 |
| Database | MongoDB 7 |
| Validation | Zod |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Security | Helmet, express-rate-limit, CORS |
| Testing | Jest, ts-jest, mongodb-memory-server |
| CI/CD | GitHub Actions |
| Containerization | Docker, Docker Compose |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or Docker)
- **Docker & Docker Compose** (optional)

### Option 1 — Docker (recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/startup-stress-tester.git
cd startup-stress-tester

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up --build
```

Open **http://localhost:3000** in your browser.

### Option 2 — Manual setup

```bash
# Backend
cd backend
npm install
cp ../.env.example .env   # edit MONGODB_URI for local Mongo
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### Seed demo data

```bash
cd backend
npm run seed
# → Creates demo user: demo@startup-tester.com / Demo1234!
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, get JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `GET` | `/api/ideas` | ✅ | List user's ideas |
| `POST` | `/api/ideas` | ✅ | Create idea |
| `GET` | `/api/ideas/:id` | ✅ | Get idea details |
| `PUT` | `/api/ideas/:id` | ✅ | Update idea |
| `DELETE` | `/api/ideas/:id` | ✅ | Delete idea |
| `POST` | `/api/ideas/:id/analyze` | ✅ | Run stress test |
| `GET` | `/api/ideas/:id/analyses` | ✅ | List analyses for idea |
| `GET` | `/api/analyses/:id` | ✅ | Get analysis details |
| `GET` | `/api/health` | ❌ | Health check |

---

## Project Structure

```
startup-stress-tester/
├── .github/workflows/ci.yml     # GitHub Actions CI
├── .env.example                  # Environment variables template
├── docker-compose.yml            # Full-stack Docker setup
├── DESIGN.md                     # Architecture documentation
├── README.md
│
├── backend/
│   ├── src/
│   │   ├── config/               # App config, DB connection
│   │   ├── controllers/          # Route handlers
│   │   ├── middleware/            # Auth, validation, errors
│   │   ├── models/               # Mongoose schemas (User, Idea, Analysis)
│   │   ├── routes/               # Express routers
│   │   ├── services/             # Analysis engine (core business logic)
│   │   ├── validators/           # Zod schemas
│   │   ├── __tests__/            # Unit & integration tests
│   │   ├── seed.ts               # Database seeder
│   │   ├── app.ts                # Express app setup
│   │   └── server.ts             # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/           # Layout, shared UI
    │   ├── context/              # Auth context (React Context)
    │   ├── pages/                # Login, Register, Dashboard, IdeaDetail, Analysis
    │   ├── services/             # API client (Axios)
    │   ├── App.tsx               # Router setup
    │   └── main.tsx              # Entry point
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── vite.config.ts
```

---

## Testing

```bash
cd backend

# Run all tests
npm test

# With coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

Test coverage targets:
- ✅ Analysis engine — strong idea, weak idea, average idea, output shape
- ✅ Score clamping (0–100)
- ✅ Panelist feedback structure
- ✅ Risk severity ordering

---

## Deployment

### Vercel (frontend) + Render/Heroku (backend)

1. **Frontend** — Connect `frontend/` folder to Vercel, set build command `npm run build`, output `dist/`
2. **Backend** — Deploy `backend/` to Render or Heroku, set env vars from `.env.example`
3. **MongoDB** — Use MongoDB Atlas free tier

### Docker (self-hosted)

```bash
docker compose -f docker-compose.yml up -d
```

---

## Author

**Mordehai Levy** — AI Automation & Full-Stack Developer · [GitHub](https://github.com/mordehailevy) · [LinkedIn](https://www.linkedin.com/in/mordehai-levy-593455426)

---

## License

MIT © 2026 Mordehai Levy
