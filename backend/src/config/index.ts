import dotenv from "dotenv";
import type { StringValue } from "ms";
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/startup-stress-tester",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || "7d") as StringValue,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  // Gemini (free tier). The key stays server-side only — never prefix it with VITE_.
  // Tests never call the real API, even if a key is present in .env.
  geminiApiKey: process.env.NODE_ENV === "test" ? "" : process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  // Tried once when the main model is overloaded (HTTP 429/503).
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite",
  aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS || "20000", 10),
  aiDailyLimit: parseInt(process.env.AI_DAILY_LIMIT || "200", 10),
  aiHourlyLimitPerUser: parseInt(process.env.AI_HOURLY_LIMIT_PER_USER || "10", 10),
} as const;

export default config;
