import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer | null = null;

/**
 * Starts an in-memory MongoDB instance and connects Mongoose.
 * Used when no external MongoDB is available (local dev without Docker).
 */
export async function connectInMemoryDatabase(): Promise<string> {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.info("✅ Connected to in-memory MongoDB at", uri);
  return uri;
}

export async function disconnectInMemoryDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
