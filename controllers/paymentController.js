const Subscription = require("../models/company/subscriptionSchema");
require("dotenv").config();

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

const makePayment = async (req, res) => {
  const { plan } = req.body;
  const { userId } = req.user;

  console.log("priceId", plan);

  const YOUR_DOMAIN = process.env.CLIENT_URL || "http://localhost:5173"; // Use environment variable for production domain

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // Setting the payment mode to 'subscription'
      line_items: [
        {
          price: plan.priceId, // priceId from Stripe
          quantity: 1,
        },
      ],
      success_url: `${YOUR_DOMAIN}/company/dashboard`, // Redirect to the dashboard after success
      cancel_url: `${YOUR_DOMAIN}/company/dashboard/payment-cancel`, // Redirect if payment is cancelled
    });

    // Save subscription info in the database
    await Subscription.create({
      userId,
      planName: plan.name,
      priceId: plan.priceId,
      price: plan.price,
      status: "pending", // Status is 'pending' until the payment is successful
      stripeSessionId: session.id,
      features: plan.features,
    });

    // Respond with the Stripe session URL
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong creating checkout session" });
  }
};

const stripeWebhook = async (req, res) => {
  console.log("Webhook received!");

  const sig = req.headers["stripe-signature"]; // Webhook signature for security

  let event;

  try {
    // Construct the Stripe event
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // The secret from your Stripe Dashboard
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object; // Extract session object

    try {
      // Update the subscription status to "active" based on the session ID
      const updated = await Subscription.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: "active" },
        { new: true } // Ensure the updated subscription is returned
      );

      if (updated) {
        console.log("✅ Subscription activated:", updated);
      } else {
        console.warn("⚠️ Subscription not found for session:", session.id);
      }
    } catch (error) {
      console.error("❌ DB Update error:", error.message);
    }
  }

  res.status(200).json({ received: true }); // Respond that webhook is received successfully
};

const getPaymentDetails = async (req, res) => {
  try {
    const { userId } = req.user;

    const paymentDetails = await Subscription.findOne({ userId });

    if (!paymentDetails) {
      return res
        .status(200)
        .json({ message: "No subscription found", data: null });
    }

    return res.status(200).json({
      message: "Subscription details fetched successfully",
      data: paymentDetails,
    });
  } catch (error) {
    console.error("Error fetching subscription details:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { makePayment, stripeWebhook, getPaymentDetails };
