const express = require("express");
const {
  makePayment,
  getPaymentDetails,
  stripeWebhook,
} = require("../controllers/paymentController");
const protect = require("../middleware/protect");
const paymentRoute = express.Router();

paymentRoute.post("/create-subscription", protect, makePayment);
paymentRoute.get("/get-payment-details", protect, getPaymentDetails);
paymentRoute.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = paymentRoute;
