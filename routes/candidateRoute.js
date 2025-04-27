// import express from "express";
// import createProfile from "../controllers/candidateController";
// import protect from "../middleware/protect";
const express = require("express");
const createProfile = require("../controllers/candidateController");
const protect = require("../middleware/protect");
const candidateRoute = express.Router();

candidateRoute.post("/create-profile", protect, createProfile);

module.exports = candidateRoute;
