// models/Subscription.js

const mongoose = require("mongoose");
const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // reference to your User model
  },
  planName: {
    type: String,
    required: true,
  },
  price: {
    type: String,
  },
  priceId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending", // updated to "active" after payment success
  },
  stripeSessionId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  features: {
    type: [],
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
