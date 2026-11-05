import app from "./app";
import config from "./config";
import { connectInMemoryDatabase } from "./config/memoryDb";
import { scheduleDemoPurge, DEMO_EMAIL, DEMO_PASSWORD, DEMO_IDEAS, DEMO_TTL_HOURS } from "./demo/demoAccount";

/**
 * Demo server — in-memory MongoDB; every visitor gets a private, pre-filled demo space.
 * No external dependencies needed. Perfect for demos and reviews.
 */
async function startDemo(): Promise<void> {
  console.info("🎬 Starting Startup Stress Tester in DEMO mode…");
  console.info("📦 Launching in-memory MongoDB…");

  await connectInMemoryDatabase();
  scheduleDemoPurge();
  console.info(`🌱 Each demo opens a private space with ${DEMO_IDEAS.length} ideas and their report history`);

  app.listen(config.port, () => {
    console.info("");
    console.info("═══════════════════════════════════════════════════");
    console.info("🚀 Startup Stress Tester — DEMO MODE");
    console.info(`🌐 API running at http://localhost:${config.port}`);
    console.info("");
    console.info(`📧 Demo login: ${DEMO_EMAIL} (or the "Essayer la démo" button)`);
    console.info(`🔑 Password:   ${DEMO_PASSWORD}`);
    console.info(`   Every demo login gets its own space, fully usable, deleted after ${DEMO_TTL_HOURS} h.`);
    console.info("═══════════════════════════════════════════════════");
    console.info("");
  });
}

startDemo().catch((err) => {
  console.error("Demo startup failed:", err);
  process.exit(1);
});
