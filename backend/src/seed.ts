import { User } from "./models/User";
import { Idea } from "./models/Idea";
import { Analysis } from "./models/Analysis";
import { connectDatabase } from "./config/database";
import { connectInMemoryDatabase } from "./config/memoryDb";

const SEED_USERS = [
  { email: "demo@startup-tester.com", password: "Demo1234!", fullName: "Demo User" },
];

const SEED_IDEAS = [
  {
    title: "EcoTrack — Carbon Footprint Tracker for SMBs",
    description:
      "A SaaS platform that helps small and medium businesses track, report, and reduce their carbon footprint. " +
      "Integrates with accounting software (Xero, QuickBooks) to automatically calculate emissions from expenses. " +
      "Provides AI-driven recommendations for reduction and generates compliance reports for ESG regulations. " +
      "Unique value: automated data ingestion and benchmarking against industry peers.",
    marketSizeEstimate: "Global carbon management market worth $12 billion by 2027, growing 22% CAGR",
    teamSummary: "CEO with 10 years sustainability consulting, CTO ex-Stripe senior engineer, 1 data scientist, 1 full-stack developer",
    techStack: "React, TypeScript, Node.js, PostgreSQL, Docker, AWS Lambda, Python ML pipeline",
    revenueModel: "SaaS subscription: $49/mo starter, $199/mo pro, $499/mo enterprise. Annual discounts. B2B sales.",
    stage: "prototype",
  },
  {
    title: "LinguaFlash — AI Language Tutor",
    description:
      "Mobile app using conversational AI to teach languages through real-life scenario simulations. " +
      "Users practice ordering food, job interviews, travel situations. Adaptive difficulty based on performance.",
    marketSizeEstimate: "Language learning market: $65 billion globally, mobile segment growing fast",
    teamSummary: "Solo founder, experienced mobile developer, working with 2 freelancers",
    techStack: "Flutter, Firebase, Python, OpenAI API",
    revenueModel: "Freemium with premium subscription at $9.99/month",
    stage: "idea",
  },
  {
    title: "FreightMate — Logistics Aggregator",
    description:
      "Platform connecting shippers with local carriers for last-mile delivery in emerging markets. " +
      "Real-time tracking, automated dispatch, and dynamic pricing based on demand and route optimization.",
    marketSizeEstimate: "Last-mile delivery market in emerging economies: $40 billion, fragmented",
    teamSummary: "3 co-founders: logistics veteran (15 years), CTO from Uber Freight, operations lead",
    techStack: "React Native, Node.js, MongoDB, Redis, Google Maps API, Docker, Kubernetes, AWS",
    revenueModel: "Commission per delivery (8-12%) + SaaS fee for enterprise shippers",
    stage: "mvp",
  },
];

async function seed(): Promise<void> {
  try {
    await connectDatabase();
  } catch {
    console.info("⚠️  External MongoDB unavailable — using in-memory MongoDB for seed…");
    await connectInMemoryDatabase();
  }

  // Clean existing data
  await Promise.all([User.deleteMany({}), Idea.deleteMany({}), Analysis.deleteMany({})]);

  console.info("🌱 Seeding users...");
  const user = await User.create(SEED_USERS[0]);

  console.info("🌱 Seeding ideas...");
  for (const ideaData of SEED_IDEAS) {
    await Idea.create({ ...ideaData, userId: user._id });
  }

  console.info("✅ Seed complete — 1 user, 3 ideas");
  console.info("   Login: demo@startup-tester.com / Demo1234!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
