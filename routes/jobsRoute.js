const express = require("express");
const jobRoute = require("express").Router();
const protect = require("../middleware/protect");
const { createJob, getMYJobs } = require("../controllers/JobsControllers");

// Route to create a new job
jobRoute.post("/create-job", protect, createJob);
jobRoute.get("/get-my-jobs", protect, getMYJobs); // Route to get user's jobs
// Route to get all jobs

module.exports = jobRoute;
