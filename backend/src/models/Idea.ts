import mongoose, { Schema, Document, Types } from "mongoose";

export type Stage = "idea" | "prototype" | "mvp" | "growth" | "scale";

export interface IIdea extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  marketSizeEstimate: string;
  teamSummary: string;
  techStack: string;
  revenueModel: string;
  stage: Stage;
  createdAt: Date;
  updatedAt: Date;
}

const ideaSchema = new Schema<IIdea>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 5000,
    },
    marketSizeEstimate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    teamSummary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    techStack: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    revenueModel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    stage: {
      type: String,
      enum: ["idea", "prototype", "mvp", "growth", "scale"],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  }
);

export const Idea = mongoose.model<IIdea>("Idea", ideaSchema);
