const Auth = require("../models/authModels");
const companyProfile = require("../models/company/companyProfileModel");

const createProfile = async (req, res, next) => {
  try {
    const {
      user_id,
      companyInfo,
      foundingInfo,
      contactInfo,
      SocialInfo,
      profileCreated,
    } = req.body;

    console.log("company details", req.body);

    // Validate required fields
    if (!companyInfo.companyName || !user_id) {
      return res
        .status(400)
        .json({ message: "Company name and user ID are required." });
    }

    // Construct full profile object
    const profileData = {
      userId: user_id,
      companyInfo,
      foundingInfo,
      contactInfo,
      SocialInfo,
      profileCreated,
    };

    // Convert user_id to userId for schema compliance
    const createdProfile = await companyProfile.create(profileData);

    await Auth.findByIdAndUpdate(user_id, {
      profileCreated: true,
      profileId: createdProfile._id,
    });

    return res.status(201).json({
      message: "Company Profile created successfully",
      data: createdProfile,
      profileId: createdProfile._id,
    });
  } catch (error) {
    console.error("Error creating profile:", error);

    return res.status(500).json({
      message: "Failed to create company profile",
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  const userId = req.query.userId; // ✅ Extract from query string
  console.log("i am working in this error");
  try {
    const userProfile = await companyProfile.findOne({ userId });
    return res.status(201).json({
      userProfile,
    });
  } catch (error) {
    console.error("Error fettching profile:", error);

    // Send error response
    return res.status(500).json({
      message: "Failed to fetch company profile",
      error: error.message,
    });
  }
};

module.exports = { createProfile, getProfile };
