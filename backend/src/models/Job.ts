import { Schema, model } from "mongoose";

const jobSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["applied", "interviewing", "offered", "rejected"],
      default: "applied",
    },
    appliedDate: { type: Date, default: Date.now },
    jobUrl: { type: String },
    salary: { type: Number },
    notes: { type: String },
    cv: { type: String },
    // tags/labels for categorization
    tags: { type: [String], default: [] },
    // timeline of status changes
    timeline: {
      type: [
        {
          status: {
            type: String,
            enum: ["applied", "interviewing", "offered", "rejected"],
          },
          date: { type: Date, default: Date.now },
          // optional note could be added in future
        },
      ],
      default: [],
    },

    // follow-up reminder
    followUpDate: { type: Date },
    reminderSent: { type: Boolean, default: false },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default model("Job", jobSchema);
