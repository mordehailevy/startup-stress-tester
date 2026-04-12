import mongoose from "mongoose";
import config from "./index";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.info("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.info("🔌 MongoDB disconnected");
}
