const candidateProfile = require("../models/userModels");

const createProfile = async (req, res, next) => {
  try {
    const { user_id, candidateInfo, profileInfo, SocialInfo, contactInfo } =
      req.body;
    console.log("company details", req.body);

    // Validate required fields
    if (!candidateInfo.fullName || !user_id) {
      return res
        .status(400)
        .json({ message: "Company name and user ID are required." });
    }

    // Construct full profile object
    const profileData = {
      userId: user_id,
      candidateInfo,
      profileInfo,
      contactInfo,
      SocialInfo,
    };

    // Convert user_id to userId for schema compliance
    const createdProfile = await candidateProfile.create(profileData);
    return res.status(201).json({
      message: "Candidate Profile created successfully",
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

module.exports = createProfile;
