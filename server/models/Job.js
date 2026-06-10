const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: { type: String, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    stack: [{ type: String, lowercase: true }],    // ["react", "node", "mongodb"]
    location: { type: String, default: "Remote" },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      default: "full-time",
    },
    experience: {
      type: String,
      enum: ["fresher", "1-3 years", "3-5 years", "5+ years"],
      default: "1-3 years",
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: "INR" },
    isRemote: { type: Boolean, default: false },
    applications: [ApplicationSchema],
    isActive: { type: Boolean, default: true },
    isBoosted: { type: Boolean, default: false },   // paid feature
    boostExpiresAt: { type: Date },
    deadline: { type: Date },
  },
  { timestamps: true }
);

// Index for search
JobSchema.index({ title: "text", description: "text", stack: "text" });

module.exports = mongoose.model("Job", JobSchema);