// import express from "express";
// import createProfile from "../controllers/candidateController";
// import protect from "../middleware/protect";
const express = require("express");
const protect = require("../middleware/protect");
const {
  createProfile,
  getProfile,
} = require("../controllers/candidateController");
const candidateRoute = express.Router();

candidateRoute.post("/create-profile", protect, createProfile);
candidateRoute.get("/getCandidateProfile", protect, getProfile);

module.exports = candidateRoute;
