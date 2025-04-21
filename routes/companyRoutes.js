const express = require("express");
const { createProfile, getProfile } = require("../controllers/companyProfile");
const companyRoute = express.Router();
const protect = require("../middleware/protect");
const upload = require("../middleware/upload");

companyRoute.post("/create-profile", createProfile);
companyRoute.get("/get-profile", protect, getProfile);

module.exports = companyRoute;
