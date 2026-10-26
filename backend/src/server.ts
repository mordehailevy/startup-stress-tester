import app from "./app";
import config from "./config";
import { connectDatabase } from "./config/database";
import { connectInMemoryDatabase } from "./config/memoryDb";
import { ensureDemoAccount } from "./demo/demoAccount";

async function bootstrap(): Promise<void> {
  // Try connecting to external MongoDB; fall back to in-memory if unavailable
  try {
    await connectDatabase();
  } catch {
    console.info("⚠️  External MongoDB unavailable — starting in-memory MongoDB…");
    await connectInMemoryDatabase();
  }

  await ensureDemoAccount();

  app.listen(config.port, () => {
    console.info(`🚀 Server running on http://localhost:${config.port}`);
    console.info(`📚 Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
