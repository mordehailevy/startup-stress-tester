import app from "./app";
import config from "./config";
import { connectDatabase } from "./config/database";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  app.listen(config.port, () => {
    console.info(`🚀 Server running on http://localhost:${config.port}`);
    console.info(`📚 Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
