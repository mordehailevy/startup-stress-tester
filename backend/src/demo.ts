import app from "./app";
import config from "./config";
import { connectInMemoryDatabase } from "./config/memoryDb";
import { User } from "./models/User";
import { Idea } from "./models/Idea";

/**
 * Demo server — starts with in-memory MongoDB + pre-seeded data.
 * No external dependencies needed. Perfect for demos and reviews.
 */
async function startDemo(): Promise<void> {
  console.info("🎬 Starting Startup Stress Tester in DEMO mode…");
  console.info("📦 Launching in-memory MongoDB…");

  await connectInMemoryDatabase();

  // Seed demo data
  const user = await User.create({
    email: "demo@startup-tester.com",
    password: "Demo1234!",
    fullName: "Demo User",
  });

  const ideas = [
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

  for (const ideaData of ideas) {
    await Idea.create({ ...ideaData, userId: user._id });
  }

  console.info("🌱 Demo data seeded: 1 user, 3 ideas");

  app.listen(config.port, () => {
    console.info("");
    console.info("═══════════════════════════════════════════════════");
    console.info("🚀 Startup Stress Tester — DEMO MODE");
    console.info(`🌐 API running at http://localhost:${config.port}`);
    console.info("");
    console.info("📧 Demo login: demo@startup-tester.com");
    console.info("🔑 Password:   Demo1234!");
    console.info("═══════════════════════════════════════════════════");
    console.info("");
  });
}

startDemo().catch((err) => {
  console.error("Demo startup failed:", err);
  process.exit(1);
});
