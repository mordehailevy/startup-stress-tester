import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import config from "./config";
import logger from "./config/logger";
import { swaggerSpec } from "./config/swagger";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import ideaRoutes from "./routes/idea.routes";
import analysisRoutes from "./routes/analysis.routes";

const app = express();

// ── Security & parsing ──────────────────────────
app.use(helmet());
app.use(cors({ origin: config.isProduction ? config.clientOrigin || false : "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Structured logging ──────────────────────────
if (!config.isTest) {
  app.use(pinoHttp({ logger }));
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

// ── API documentation ───────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Startup Stress Tester API Docs",
}));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

// ── Error handling ──────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
