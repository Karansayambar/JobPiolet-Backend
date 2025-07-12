const express = require("express");
const {
  createProfile,
  getProfile,
  saveCandidate,
  unsaveCandidate,
  getSavedCandidates,
} = require("../controllers/companyProfile");
const companyRoute = express.Router();
const protect = require("../middleware/protect");
const upload = require("../middleware/upload");

companyRoute.post("/create-profile", createProfile);
companyRoute.get("/get-profile", protect, getProfile);
companyRoute.post("/save-candidate", protect, saveCandidate);
companyRoute.post("/unsave-candidate", protect, unsaveCandidate);
companyRoute.get("/get-saved-candidates", protect, getSavedCandidates);

module.exports = companyRoute;
