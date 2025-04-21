const Jobs = require("../models/company/createJobModel");

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

module.exports = { createJob, getMYJobs, getAllJobs };
