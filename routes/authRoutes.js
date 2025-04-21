const express = require("express");
const userController = require("../controllers/authControllers");
const userRoute = express.Router();

userRoute.post(
  "/register",
  userController.registerUser,
  userController.sendOTP
);

userRoute.post("/verify", userController.verifyOTP);
userRoute.post("/sendOtp", userController.sendOTP);
userRoute.post("/login", userController.login);
userRoute.post("/forgotPassword", userController.forgotPassword);
userRoute.post("/resetPassword", userController.resetPassword);

module.exports = userRoute;
