const mongoose = require("mongoose");

const jobsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    jobTitle: { type: String, required: true },
    jobRole: { type: String, required: true },
    companyName: { type: String, required: true },
    jobDescription: { type: String, required: true },
    minSalary: { type: String, required: true },
    maxSalary: { type: String, required: true }, // ✅ fixed typo
    salaryType: {
      type: String,
      enum: ["hourly", "monthly", "yearly"],
      required: true,
      default: "monthly",
    },
    education: { type: String, required: true },
    experience: { type: String, required: true },
    vacancies: { type: String, required: true },

    workMode: {
      type: String,
      required: true,
    },
    jobLevel: {
      type: String,
      enum: ["entry", "mid", "senior"],
      required: true,
    },
    industry: {
      type: String,
    },
    jobStatus: {
      type: String,
      enum: ["open", "closed", "paused"],
      default: "open",
    },
    jobFunction: {
      type: String,
    },
    workingHours: {
      type: String,
    },

    contractLength: { type: String },
    expeditedJoiningDate: { type: Date },
    ApplicationDedline: { type: Date },

    jobBenefits: { type: [String], required: true },
    sills: { type: [String], required: true },

    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },

    jobResponsibilities: {
      type: [String],
      required: true,
    },
    jobRequirements: {
      type: [String],
      required: true,
    },
    jobPreferences: {
      type: [String],
      required: true,
    },
    languages: {
      type: [String],
      required: true,
    },

    applicants: { type: Array, default: [] },
  },
  { timestamps: true }
);

const Jobs = mongoose.model("Jobs", jobsSchema);
module.exports = Jobs;
