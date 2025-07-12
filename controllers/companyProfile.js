const Auth = require("../models/authModels");
const companyProfile = require("../models/company/companyProfileModel");
const savedCandidate = require("../models/company/savedCandidateModel");
const candidateProfile = require("../models/userModels");

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

const saveCandidate = async (req, res) => {
  const { candidateId, jobId } = req.body;

  const companyId = req.user.userId;

  try {
    console.log("candidateId and JobId", candidateId, jobId);

    // Check if already saved

    const existingSave = await savedCandidate.findOne({
      candidateId,

      jobId,
    });

    if (existingSave) {
      return res

        .status(400)

        .json({ message: "Candidate already saved for this job." });
    }

    const candidateInfo = await candidateProfile.findOne({
      userId: candidateId,
    });

    if (!candidateInfo) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    candidateInfo.isSaved = true;

    await candidateInfo.save();

    const saved = await savedCandidate.create({
      candidateId,

      jobId,

      companyId,
    });

    return res.status(201).json({
      message: "Candidate saved successfully.",

      data: saved,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Server error." });
  }
};

const unsaveCandidate = async (req, res) => {
  const { candidateId, jobId } = req.body;

  try {
    const candidateInfo = await candidateProfile.findOne({
      userId: candidateId,
    });

    if (!candidateInfo) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    candidateInfo.isSaved = false;

    await candidateInfo.save();

    const deleted = await savedCandidate.findOneAndDelete({
      candidateId,

      jobId,
    });

    if (!deleted) {
      return res

        .status(404)

        .json({ message: "No saved candidate found for this job." });
    }

    return res.status(200).json({ message: "Candidate unsaved successfully." });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Server error." });
  }
};

const getSavedCandidates = async (req, res) => {
  const companyId = req.user.userId;

  try {
    const savedCandidates = await savedCandidate.find({ companyId });

    if (!savedCandidates) {
      return res.status(404).json({
        message: "No Candidates Saved Ate",
      });
    }

    const savedCandidateDetails = await Promise.all(
      savedCandidates.map((cd) => {
        return candidateProfile.findOne({
          userId: cd.candidateId,
        });
      })
    );

    if (!savedCandidateDetails) {
      return res.status(404).json({
        message: "No Candidates Saved Ate",
      });
    }

    res.status(200).json({
      message: "saved candidates details",

      savedCandidateDetails,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createProfile,
  getProfile,
  saveCandidate,
  unsaveCandidate,
  getSavedCandidates,
};
