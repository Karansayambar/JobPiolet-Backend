const express = require("express");
const jobRoute = require("express").Router();
const protect = require("../middleware/protect");
const {
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
} = require("../controllers/JobsControllers");
const limiter = require("../utils/rateLimiter");
// const rateLimit = require("express-rate-limit");

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 5,
//   handler: (req, res) => {
//     res.status(429).json({
//       status: "fail",
//       message: "To Many Requests",
//     });
//   },
// });

// Route to create a new job
jobRoute.post("/create-job", protect, createJob);
jobRoute.get("/get-my-jobs", protect, getMYJobs); // Route to get user's jobs
jobRoute.get("/getAllJobs", protect, getAllJobs);
jobRoute.post("/apply-to-job/:id", protect, applyToJob); // Route to get all jobs
jobRoute.get("/getAppliedJobs", protect, getAppliedJobs);
jobRoute.get("/getJobDetails/:jobId", getJobDetails);
jobRoute.get("/getAppliedStatus/:jobId", protect, getAppliedStatus);
jobRoute.post("/addToFavorite/:jobId", protect, addToFavorite);
jobRoute.get("/favorites", protect, getFavoriteJobs); // Get all favorite jobs for the current user
jobRoute.get("/is-favorited/:jobId", protect, checkIfJobIsFavorited); // Check if a specific job is favorited
jobRoute.get("/viewApplicants/:jobId", getApplicants);

module.exports = jobRoute;
