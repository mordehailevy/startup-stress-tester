import type { IncomingMessage, ServerResponse } from "http";
import mongoose from "mongoose";
import app from "../app";
import config from "../config";

/**
 * Entry point for serverless hosts (Vercel): the Express app as a request
 * handler, with one MongoDB connection reused across invocations of a warm instance.
 */
let connecting: Promise<typeof mongoose> | null = null;

function connectOnce(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (!connecting) {
    if (!process.env.MONGODB_URI) {
      return Promise.reject(new Error("MONGODB_URI is not set"));
    }
    connecting = mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 }).catch((err) => {
      connecting = null; // let the next request retry
      throw err;
    });
  }
  return connecting;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    await connectOnce();
  } catch (err) {
    console.error("Database connection failed:", err);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: { message: "Le service est momentanément indisponible, réessaie dans un instant" } }));
    return;
  }
  (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
