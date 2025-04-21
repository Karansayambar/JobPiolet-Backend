const mongoose = require("mongoose");

const companyProfileModelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyInfo: {
    companyName: String,
    about: String,
    logoUrl: String,
    bannerUrl: String,
  },
  foundingInfo: {
    organisationType: String,
    industryType: String,
    teamSize: Number,
    companyWebsite: String,
    companyVision: String,
  },
  SocialInfo: [
    {
      platform: String,
      url: String,
    },
  ],
  contactInfo: {
    address: String,
    phone: String,
    email: String,
  },
});

const companyProfile = mongoose.model(
  "CompanyProfile",
  companyProfileModelSchema
);

module.exports = companyProfile;
