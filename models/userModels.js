const mongoose = require("mongoose");

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    candidateInfo: {
      avatar: {
        type: String,
      },
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      experience: {
        type: Number,
        required: true,
        min: 0,
      },
      education: {
        type: String,
        required: true,
        trim: true,
      },
      personalWebsite: {
        type: String,
        trim: true,
        // match: [/^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/, "Please enter a valid URL"],
      },
      resume: {
        type: String,
        trim: true,
      },
    },

    profileInfo: {
      nationality: {
        type: String,
        trim: true,
      },
      dob: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      maritalStatus: {
        type: String,
        enum: ["unmarried", "married"],
      },
      biography: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },

    socialInfo: {
      type: [
        {
          platform: { type: String },
          url: {
            type: String,
            trim: true,
            // match: [/^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/, "Invalid URL"],
          },
        },
      ],
      default: [],
    },

    contactInfo: {
      address: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        // match: [/^\d{10,15}$/, "Please enter a valid phone number"],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    appliedJobs: [
      {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs" },
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "shortlisted", "rejected"],
          default: "pending",
        },
        isApplied: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

const candidateProfile = mongoose.model("Candidate", candidateProfileSchema);
module.exports = candidateProfile;
