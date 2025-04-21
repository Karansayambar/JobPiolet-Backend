const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { type } = require("os");

const authSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Firstname is required"],
  },

  lastName: {
    type: String,
    require: [true, "Lastname is required"],
  },

  avatar: {
    type: String,
  },

  role: {
    type: String,
    enum: ["candidate", "company", "admin"],
    default: "candidate",
  },

  email: {
    type: String,
    required: [true, "Email is required"],
  },

  password: {
    type: String,
  },

  passwordChangedAt: {
    type: Date,
  },

  passwordResetToken: {
    type: String,
  },

  passwordResetExpires: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  verified: {
    type: Boolean,
    default: false,
  },

  otp: {
    type: String,
  },

  otp_expiry_time: {
    type: Date,
  },
  profileCreated: {
    type: Boolean,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyProfile",
  },
});

authSchema.pre("save", async function (next) {
  if (!this.isModified("otp") || !this.otp) return next();
  this.otp = await bcrypt.hash(this.otp.toString(), 12);

  console.log(this.otp.toString(), "FROM PRE SAVE HOOK");
  next();
});

authSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  this.password = await bcrypt.hash(this.password.toString(), 12);

  console.log(this.password.toString(), "FROM PRE SAVE HOOK PASSWORD");
  next();
});

authSchema.methods.correctOTP = async function (candidateOTP, userOTP) {
  return await bcrypt.compare(candidateOTP, userOTP);
};

authSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

authSchema.methods.changedPasswordAfter = async function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }

  // FALSE MEANS NOT CHANGED
  return false;
};

authSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
