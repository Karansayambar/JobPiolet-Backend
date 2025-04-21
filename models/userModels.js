const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
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
    },
    cv: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    DOB: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married"],
    },
    biography: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isApplied: {
      type: Boolean,
      default: false,
    },
    isFavirote: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      match: [/^\d{10,15}$/, "Please enter a valid phone number"], // Regex validation
    },
    socialLinks: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedIn: { type: String, trim: true },
      youtube: { type: String, trim: true },
    },
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt
);

const User = mongoose.model("User", userSchema);
module.exports = User;
