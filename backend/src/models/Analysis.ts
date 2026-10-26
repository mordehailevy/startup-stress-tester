import mongoose, { Schema, Document, Types } from "mongoose";

// ── Sub-types ───────────────────────────────────
export interface Risk {
  title: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  role: string; // which AI panelist raised this
}

export interface Recommendation {
  text: string;
  priority: "low" | "medium" | "high";
  role: string;
}

export interface Scores {
  tech: number;        // 0-100
  market: number;      // 0-100
  goToMarket: number;  // 0-100
  scalability: number; // 0-100
  financial: number;   // 0-100
}

export interface PanelistFeedback {
  role: string;
  summary: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface IAnalysis extends Document {
  ideaId: Types.ObjectId;
  userId: Types.ObjectId;
  overallScore: number;
  scores: Scores;
  risks: Risk[];
  recommendations: Recommendation[];
  panelistFeedbacks: PanelistFeedback[];
  mvpSteps: string[];
  shortPitch: string;
  verdict: "strong" | "promising" | "needs-work" | "weak";
  engine: "gemini" | "rules"; // who wrote the panel text
  createdAt: Date;
}

const analysisSchema = new Schema<IAnalysis>(
  {
    ideaId: { type: Schema.Types.ObjectId, ref: "Idea", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    scores: {
      tech: { type: Number, required: true, min: 0, max: 100 },
      market: { type: Number, required: true, min: 0, max: 100 },
      goToMarket: { type: Number, required: true, min: 0, max: 100 },
      scalability: { type: Number, required: true, min: 0, max: 100 },
      financial: { type: Number, required: true, min: 0, max: 100 },
    },
    risks: [
      {
        title: String,
        reason: String,
        severity: { type: String, enum: ["low", "medium", "high", "critical"] },
        role: String,
      },
    ],
    recommendations: [
      {
        text: String,
        priority: { type: String, enum: ["low", "medium", "high"] },
        role: String,
      },
    ],
    panelistFeedbacks: [
      {
        role: String,
        summary: String,
        score: Number,
        strengths: [String],
        weaknesses: [String],
      },
    ],
    mvpSteps: [String],
    shortPitch: { type: String, maxlength: 1000 },
    verdict: {
      type: String,
      enum: ["strong", "promising", "needs-work", "weak"],
      required: true,
    },
    engine: { type: String, enum: ["gemini", "rules"], default: "rules" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  }
);

export const Analysis = mongoose.model<IAnalysis>("Analysis", analysisSchema);
