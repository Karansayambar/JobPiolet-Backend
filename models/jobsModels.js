const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      enum: ["fullTime", "partTime", "internship"],
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    locationType: {
      type: String,
      enum: ["remote", "in-office", "hybrid"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 30,
      maxlength: 500,
    },
    requirements: {
      type: String,
      required: true,
      minlength: 30,
      maxlength: 500,
    },
    desirable: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
    },
    benefits: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
    },
    salary: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    jobOverview: {
      jobPosted: { type: Date, default: Date.now },
      jobExpireIn: Date,
      jobLevel: String,
      experience: String,
      education: String,
      jobTags: [String],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    applicants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "shortlisted", "rejected"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

jobSchema.virtual("daysLeft").get(function () {
  if (!this.jobOverview.jobExpireIn) return "No Expiry";

  const today = new Date();
  const expiryDate = new Date(this.jobOverview.jobExpireIn);
  const differTime = expiryDate - today;
  const daysLeft = Math.ceil(differTime / (1000 * 60 * 60 * 24));
  return daysLeft > 0 ? `${daysLeft} days left` : "Expired";
});

// ✅ Indexing for faster search
jobSchema.index({ position: "text", company: "text", location: "text" });

const Jobs = mongoose.model("Job", jobSchema);

module.exports = Jobs;
