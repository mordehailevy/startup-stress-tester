import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import config from "./config";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import ideaRoutes from "./routes/idea.routes";
import analysisRoutes from "./routes/analysis.routes";

const app = express();

// ── Security & parsing ──────────────────────────
app.use(helmet());
app.use(cors({ origin: config.isProduction ? "https://your-domain.com" : "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ─────────────────────────────────────
if (!config.isTest) {
  app.use(morgan("dev"));
}

// ── Rate limiting ───────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many requests, please try again later" } },
});
app.use("/api", limiter);

// ── Health check ────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/analyses", analysisRoutes);

// ── Error handling ──────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
