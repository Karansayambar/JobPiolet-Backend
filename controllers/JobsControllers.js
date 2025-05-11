// const Auth = require("../models/authModels");
const Jobs = require("../models/company/createJobModel");
const favoriteJobs = require("../models/favoriteJobs");
const candidateProfile = require("../models/userModels");

const createJob = async (req, res) => {
  const {
    responsibilities,
    requirements,
    preferences,
    languagesRequired,
    applicants,
    ...rest
  } = req.body;
  console.log(req.body);

  const { userId } = req.user; // Retrieved from JWT middleware

  try {
    // Validate required fields
    if (!rest.jobTitle || !userId) {
      return res
        .status(400)
        .json({ message: "Job title and user ID are required." });
    }

    // Construct full job object
    const jobData = {
      userId,
      ...(rest || []),
      jobResponsibilities: responsibilities,
      jobRequirements: requirements,
      jobPreferences: preferences,
      languages: languagesRequired,
      applicants: applicants || [],
    };

    // Create new job
    const createdJob = await Jobs.create(jobData);

    console.log("createdJob", createdJob);

    return res.status(201).json({
      message: "Job created successfully",
      data: createdJob,
      jobId: createdJob._id,
    });
  } catch (error) {
    console.error("Create Job Error:", error.message);
    res.status(500).json({ message: "Server error while creating job" });
  }
};

const getMYJobs = async (req, res) => {
  const { userId } = req.user;
  console.log("userId", userId);
  try {
    const jobs = await Jobs.find({ userId: userId });
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found for this user" });
    }
    return res
      .status(200)
      .json({ message: "Jobs retrieved successfully", jobs });
  } catch (error) {}
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Jobs.find();
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found" });
    }

    return res
      .status(200)
      .json({ message: "Jobs retrieved successfully", jobs });
  } catch (error) {
    console.error("Error retrieving jobs:", error.message);
    res.status(500).json({ message: "Server error while retrieving jobs" });
  }
};

const applyToJob = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const score = req.body;

  console.log("jobId", id);
  console.log("userId", userId);
  const jobId = id;

  try {
    const job = await Jobs.findById(jobId).maxTimeMS(30000);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const alreadyApplied = job.applicants.some(
      (applicant) => applicant.userId.toString() === userId
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    job.applicants.push({ userId });
    await job.save();

    // 2. Check if candidate exists
    const candidate = await candidateProfile.findOne({ userId: userId });
    console.log("candidate info", candidate);

    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });

    // 3. Add job to candidate's appliedJobs (match schema structure)
    candidate.appliedJobs.push({
      jobId, // Schema expects `jobId`, not just `id`
      status: "pending", // Optional, if schema requires
      isApplied: true,
      score: score,
    });
    await candidate.save();

    res.status(200).json({ message: "Applied successfully", job });
  } catch (error) {
    console.error("Apply error", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAppliedStatus = async (req, res) => {
  const { jobId } = req.params;
  const { userId } = req.user;

  try {
    // 1. Check if candidate exists
    const candidate = await candidateProfile.findOne({ userId }).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: "Candidate profile not found",
      });
    }

    console.log(" candidate", candidate);
    console.log("jobId", jobId);
    // Using find() to get the first matching job
    const appliedJob = candidate.appliedJobs.find((job) => {
      console.log("Checking job:", job.jobId.toString() === jobId);
      return job.jobId.toString() === jobId; // Note the 'return' statement
    });

    console.log("applied jobs", appliedJob);

    // 3. Return application status
    res.status(200).json({
      isApplied: appliedJob.isApplied, // Convert to boolean
    });
  } catch (error) {
    console.error("Error checking application status:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAppliedJobs = async (req, res) => {
  const { userId } = req.user;

  try {
    // 1. Find candidate by userId (not _id)
    const candidate = await candidateProfile
      .findOne({ userId }) // Use findOne instead of findById
      .populate({
        path: "appliedJobs.jobId",
        select: "jobTitle companyName city minSalary maxSalary workMode", // Select only needed fields
        options: { maxTimeMS: 30000 }, // Timeout option
      })
      .lean(); // Convert to plain JS object for better performance

    // console.log("candidate", candidate);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    // 2. Transform the data for better client response
    const appliedJobs = candidate.appliedJobs.map((job) => ({
      jobDetails: job.jobId,
      applicationDate: job.appliedAt,
      status: job.status,
    }));

    res.status(200).json({
      success: true,
      message: "Applied jobs fetched successfully",
      appliedJobs,
      count: appliedJobs.length,
    });
  } catch (error) {
    console.error("Get Applied Jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getJobDetails = async (req, res, next) => {
  const { jobId } = req.params;
  const jobDetail = await Jobs.findById(jobId);
  if (!jobDetail) {
    return res.status(404).json({
      success: false,
      message: "Job Details not found",
    });
  }

  console.log("job details", jobDetail);

  res.status(200).json({
    success: true,
    message: "job Detail fetched successfully",
    data: jobDetail,
  });
};

const addToFavorite = async (req, res) => {
  const { jobId } = req.params;
  const candidateId = req.user.userId;

  try {
    const existingFavorite = await favoriteJobs.findOne({ candidateId, jobId });

    if (existingFavorite) {
      return res
        .status(400)
        .json({ message: "This job is already in your favorites" });
    }

    const favoriteJob = new favoriteJobs({
      candidateId,
      jobId,
    });

    // Save to the database
    await favoriteJob.save();

    res.status(201).json({
      message: "Job added to favorites successfully",
      favoriteJob,
    });

    console.log(
      "job id from add to favorite",
      jobId,
      "candidate id",
      candidateId
    );
  } catch (error) {
    console.error("Error adding job to favorites:", error);
    res
      .status(500)
      .json({ message: "Server error while adding job to favorites" });
  }
};

const getFavoriteJobs = async (req, res) => {
  try {
    // Get the authenticated candidate's ID
    const candidateId = req.user.userId;

    // Find all favorite jobs for this candidate and populate the job details
    const allFavoriteJobs = await favoriteJobs.find({ candidateId }).populate({
      path: "jobId",
      // You can populate nested fields if needed, for example:
      // populate: { path: "companyId", select: "name logo" },
    });
    // console.log("allFavoriteJobs", allFavoriteJobs);

    res.status(200).json({
      message: "Favorite jobs retrieved successfully",
      favoriteJobs: allFavoriteJobs.map((fav) => fav.jobId), // Extract just the job objects
    });
  } catch (error) {
    console.error("Error getting favorite jobs:", error);
    res
      .status(500)
      .json({ message: "Server error while getting favorite jobs" });
  }
};

const checkIfJobIsFavorited = async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user.userId;
    console.log("jobId and candidateId from favorite", jobId, candidateId);

    const favoriteJobStatus = await favoriteJobs.findOne({
      candidateId,
      jobId,
    });
    // console.log("favoriteJob", favoriteJobStatus);

    res.status(200).json({
      isFavorited: !!favoriteJobStatus, // Returns true if exists, false otherwise
      // favoriteJob, // Optional: you can return the full favorite job document if needed
    });
  } catch (error) {
    console.error("Error checking if job is favorited:", error);
    res
      .status(500)
      .json({ message: "Server error while checking favorite status" });
  }
};

const getApplicants = async (req, res) => {
  const { jobId } = req.params;
  console.log("jobId from get Applicants", jobId);

  try {
    const job = await Jobs.findById(jobId);
    const userIds = job.applicants.map((li) => {
      console.log(li.userId);
      return li.userId; // If you want to keep the original values
    });

    const usersData = await Promise.all(
      userIds.map(async (userId) => {
        console.log("user from map", userId);
        const profile = await candidateProfile.findOne({
          userId: userId.toString(),
        });

        console.log("profile data", profile);
        return profile;
      })
    );

    return res.status(200).json({
      success: true,
      message: "All Applied Candidated Data",
      usersData,
    });
  } catch (error) {
    console.error("Error checking if job is favorited:", error);
    res
      .status(500)
      .json({ message: "Server error while checking favorite status" });
  }
};

module.exports = {
  createJob,
  getMYJobs,
  getAllJobs,
  applyToJob,
  getAppliedJobs,
  getJobDetails,
  getAppliedStatus,
  addToFavorite,
  getFavoriteJobs,
  checkIfJobIsFavorited,
  getApplicants,
};
