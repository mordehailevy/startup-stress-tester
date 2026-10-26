import app from "./app";
import config from "./config";
import { connectInMemoryDatabase } from "./config/memoryDb";
import { ensureDemoAccount, DEMO_EMAIL, DEMO_PASSWORD } from "./demo/demoAccount";

/**
 * Demo server — in-memory MongoDB pre-loaded with the showcase account.
 * No external dependencies needed. Perfect for demos and reviews.
 */
async function startDemo(): Promise<void> {
  console.info("🎬 Starting Startup Stress Tester in DEMO mode…");
  console.info("📦 Launching in-memory MongoDB…");

  await connectInMemoryDatabase();
  await ensureDemoAccount();
  console.info("🌱 Demo account ready: 5 ideas with their report history");

  app.listen(config.port, () => {
    console.info("");
    console.info("═══════════════════════════════════════════════════");
    console.info("🚀 Startup Stress Tester — DEMO MODE");
    console.info(`🌐 API running at http://localhost:${config.port}`);
    console.info("");
    console.info(`📧 Demo login: ${DEMO_EMAIL} (or the "Essayer la démo" button)`);
    console.info(`🔑 Password:   ${DEMO_PASSWORD}`);
    console.info("   The demo account is read-only — register to create your own ideas.");
    console.info("═══════════════════════════════════════════════════");
    console.info("");
  });
}

startDemo().catch((err) => {
  console.error("Demo startup failed:", err);
  process.exit(1);
});
