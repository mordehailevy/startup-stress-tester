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
} as const;

export default config;
