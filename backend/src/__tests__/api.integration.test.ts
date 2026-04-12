import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import { User } from "../models/User";
import { Idea } from "../models/Idea";

let mongo: MongoMemoryServer;
let token: string;
let userId: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Idea.deleteMany({});
});

// ── Auth ────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("should register a new user and return a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "Test1234!", fullName: "Test User" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe("test@example.com");
    expect(res.body.data.user.password).toBeUndefined(); // password not leaked
  });

  it("should reject duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "Test1234!", fullName: "User" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", password: "Test1234!", fullName: "User 2" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should reject invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "Test1234!", fullName: "Test" });

    expect(res.status).toBe(400);
  });

  it("should reject short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "short@example.com", password: "123", fullName: "Test" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "login@example.com", password: "Test1234!", fullName: "Login User" });
  });

  it("should login with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "Test1234!" });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it("should reject wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "wrong" });

    expect(res.status).toBe(401);
  });

  it("should reject non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nope@example.com", password: "Test1234!" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("should return current user with valid token", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "me@example.com", password: "Test1234!", fullName: "Me User" });

    token = reg.body.data.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("me@example.com");
  });

  it("should reject request without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("should reject invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.status).toBe(401);
  });
});

// ── Ideas CRUD ──────────────────────────────────

describe("Ideas CRUD", () => {
  const ideaPayload = {
    title: "Test Startup",
    description: "A great startup idea for testing purposes with enough detail to be meaningful.",
    marketSizeEstimate: "$10B market",
    teamSummary: "3 co-founders with 30 years combined experience",
    techStack: "React, Node.js, PostgreSQL",
    revenueModel: "SaaS subscription $49/mo",
    stage: "mvp",
  };

  beforeEach(async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "crud@example.com", password: "Test1234!", fullName: "CRUD User" });
    token = reg.body.data.token;
    userId = reg.body.data.user._id;
  });

  it("POST /api/ideas — should create an idea", async () => {
    const res = await request(app)
      .post("/api/ideas")
      .set("Authorization", `Bearer ${token}`)
      .send(ideaPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.idea.title).toBe("Test Startup");
    expect(res.body.data.idea.userId).toBe(userId);
  });

  it("GET /api/ideas — should list ideas with pagination", async () => {
    // Create 3 ideas
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post("/api/ideas")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...ideaPayload, title: `Idea ${i}` });
    }

    const res = await request(app)
      .get("/api/ideas?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.pagination.totalPages).toBe(2);
    expect(res.body.pagination.hasNextPage).toBe(true);
  });

  it("GET /api/ideas/:id — should get a single idea", async () => {
    const created = await request(app)
      .post("/api/ideas")
      .set("Authorization", `Bearer ${token}`)
      .send(ideaPayload);

    const res = await request(app)
      .get(`/api/ideas/${created.body.data.idea._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.idea.title).toBe("Test Startup");
  });

  it("PUT /api/ideas/:id — should update an idea", async () => {
    const created = await request(app)
      .post("/api/ideas")
      .set("Authorization", `Bearer ${token}`)
      .send(ideaPayload);

    const res = await request(app)
      .put(`/api/ideas/${created.body.data.idea._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.data.idea.title).toBe("Updated Title");
  });

  it("DELETE /api/ideas/:id — should delete an idea", async () => {
    const created = await request(app)
      .post("/api/ideas")
      .set("Authorization", `Bearer ${token}`)
      .send(ideaPayload);

    const res = await request(app)
      .delete(`/api/ideas/${created.body.data.idea._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("should not access another user's ideas", async () => {
    const created = await request(app)
      .post("/api/ideas")
      .set("Authorization", `Bearer ${token}`)
      .send(ideaPayload);

    // Register second user
    const reg2 = await request(app)
      .post("/api/auth/register")
      .send({ email: "other@example.com", password: "Test1234!", fullName: "Other" });
    const token2 = reg2.body.data.token;

    const res = await request(app)
      .get(`/api/ideas/${created.body.data.idea._id}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(404);
  });
});

// ── Analysis ────────────────────────────────────

describe("Analysis", () => {
  let ideaId: string;

  beforeEach(async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: "analysis@example.com", password: "Test1234!", fullName: "Analyst" });
    token = reg.body.data.token;

    const idea = await request(app)
      .post("/api/ideas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Analyzable Startup",
        description: "A fintech platform for micro-lending with AI-driven credit scoring for emerging markets.",
        marketSizeEstimate: "$50B global micro-lending market",
        teamSummary: "CTO ex-Stripe, CEO 10 years banking, 2 ML engineers",
        techStack: "Python, FastAPI, React, PostgreSQL, TensorFlow, Kubernetes",
        revenueModel: "Interest margin + SaaS licensing to banks at $2K/mo",
        stage: "prototype",
      });
    ideaId = idea.body.data.idea._id;
  });

  it("POST /api/ideas/:ideaId/analyze — should run analysis", async () => {
    const res = await request(app)
      .post(`/api/ideas/${ideaId}/analyze`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.data.analysis.overallScore).toBeGreaterThanOrEqual(0);
    expect(res.body.data.analysis.overallScore).toBeLessThanOrEqual(100);
    expect(res.body.data.analysis.verdict).toBeDefined();
    expect(res.body.data.analysis.scores.tech).toBeDefined();
    expect(res.body.data.analysis.panelistFeedbacks).toHaveLength(4);
    expect(res.body.data.analysis.mvpSteps.length).toBeGreaterThan(0);
    expect(res.body.data.analysis.shortPitch).toBeDefined();
  });

  it("GET /api/analyses/:id — should retrieve analysis with populated idea", async () => {
    const created = await request(app)
      .post(`/api/ideas/${ideaId}/analyze`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .get(`/api/analyses/${created.body.data.analysis._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.analysis.ideaId.title).toBe("Analyzable Startup");
  });

  it("GET /api/ideas/:ideaId/analyses — should list analyses with pagination", async () => {
    // Run 2 analyses
    await request(app).post(`/api/ideas/${ideaId}/analyze`).set("Authorization", `Bearer ${token}`);
    await request(app).post(`/api/ideas/${ideaId}/analyze`).set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .get(`/api/ideas/${ideaId}/analyses`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
  });
});

// ── Edge cases ──────────────────────────────────

describe("Edge cases", () => {
  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
  });

  it("should reject idea creation without auth", async () => {
    const res = await request(app)
      .post("/api/ideas")
      .send({ title: "No Auth" });

    expect(res.status).toBe(401);
  });
});
