# 📐 DESIGN.md — Architecture & Technical Decisions

## 1. High-Level Architecture

The system follows a **classic 3-tier architecture** optimized for clarity, testability, and deployment flexibility:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  React 18 + Vite + TypeScript + Tailwind CSS + Recharts     │
│  SPA with React Router, Axios for HTTP, Context for Auth    │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST / JSON
┌─────────────────────▼───────────────────────────────────────┐
│                        API LAYER                            │
│  Node.js + Express + TypeScript                             │
│  JWT Authentication, Zod Validation, Rate Limiting          │
│  Business Logic: Analysis Engine (4 AI panelists)           │
└─────────────────────┬───────────────────────────────────────┘
                      │ Mongoose ODM
┌─────────────────────▼───────────────────────────────────────┐
│                      DATA LAYER                             │
│  MongoDB 7 — Collections: users, ideas, analyses            │
└─────────────────────────────────────────────────────────────┘
```

## 2. Data Model

### Users
```
{
  _id: ObjectId,
  email: string (unique, lowercase),
  password: string (bcrypt hashed, select: false),
  fullName: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Ideas
```
{
  _id: ObjectId,
  userId: ObjectId → User,
  title: string,
  description: string,
  marketSizeEstimate: string,
  teamSummary: string,
  techStack: string,
  revenueModel: string,
  stage: enum("idea" | "prototype" | "mvp" | "growth" | "scale"),
  createdAt: Date,
  updatedAt: Date
}
```

### Analyses
```
{
  _id: ObjectId,
  ideaId: ObjectId → Idea,
  userId: ObjectId → User,
  overallScore: number (0-100),
  scores: { tech, market, goToMarket, scalability, financial },
  risks: [{ title, reason, severity, role }],
  recommendations: [{ text, priority, role }],
  panelistFeedbacks: [{ role, summary, score, strengths[], weaknesses[] }],
  mvpSteps: string[],
  shortPitch: string,
  verdict: enum("strong" | "promising" | "needs-work" | "weak"),
  createdAt: Date
}
```

## 3. Analysis Engine Design

The core differentiator of this application is the **multi-role AI evaluation panel**.

### Panelist Roles

| # | Role | Focus Areas |
|---|------|-------------|
| 1 | **Venture Capital Investor** | Market size, revenue model, team strength, investment readiness |
| 2 | **CTO / Tech Lead** | Tech stack maturity, scalability architecture, complexity vs team |
| 3 | **Marketing Strategist** | Go-to-market channels, target audience, competitive differentiation |
| 4 | **Operations & Supply Analyst** | Operational complexity, cost structure, dependencies |

### Scoring Algorithm

1. Each panelist evaluates independently, producing a score (0–100) plus strengths/weaknesses
2. Scores are aggregated with weighted formulas:
   - `tech` = CTO score
   - `market` = 50% Investor + 50% Marketer
   - `goToMarket` = Marketer score
   - `scalability` = 40% CTO + 60% Operations
   - `financial` = 60% Investor + 40% Operations
3. Overall score = weighted average: tech(20%) + market(25%) + goToMarket(20%) + scalability(15%) + financial(20%)
4. Stage multiplier adjusts baseline expectations

### Verdict Thresholds
- **Strong**: ≥ 75
- **Promising**: ≥ 55
- **Needs Work**: ≥ 35
- **Weak**: < 35

### Extensibility

The engine is designed to be swappable:
- Current: deterministic keyword-based scoring (no external API dependency)
- Future: plug in OpenAI/Claude API calls for each panelist role (swap function implementations)

## 4. Security Decisions

| Concern | Implementation |
|---------|---------------|
| Password storage | bcrypt with 12 salt rounds |
| Authentication | JWT tokens (7-day expiry) |
| Input validation | Zod schemas on all endpoints |
| Rate limiting | 100 req/15min per IP |
| Headers | Helmet.js for secure HTTP headers |
| CORS | Restricted in production |
| Data isolation | All queries filtered by `userId` |

## 5. Frontend Architecture

- **State management**: React Context for auth; local state for page data (kept simple, no Redux needed at this scale)
- **Routing**: React Router v6 with layout routes and private route wrapper
- **API layer**: Axios instance with interceptors for token injection and 401 handling
- **Styling**: Tailwind CSS utility-first with custom brand color palette
- **Charts**: Recharts radar chart for score visualization

## 6. Testing Strategy

| Level | Tool | Coverage |
|-------|------|----------|
| Unit | Jest + ts-jest | Analysis engine (scoring logic, edge cases) |
| Integration | Supertest + mongodb-memory-server | API routes (planned) |
| E2E | Cypress/Playwright (future) | Full user flows |

## 7. Deployment Options

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Local Dev | Vite dev server (:3000) | ts-node (:4000) | Local MongoDB |
| Docker | nginx (:80) | Node (:4000) | MongoDB container |
| Production | Vercel | Render / Heroku | MongoDB Atlas |

---

*Document maintained by Annah Benyamine — Last updated April 2026*
