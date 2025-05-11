const express = require("express");
const connectDB = require("./services/db");
const cors = require("cors");
const userRoute = require("./routes/authRoutes");
const companyRoute = require("./routes/companyRoutes");
const jobRoute = require("./routes/jobsRoute");
const paymentRoute = require("./routes/paymentRoute");
const candidateRoute = require("./routes/candidateRoute");
const { stripeWebhook } = require("./controllers/paymentController");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

// const cookieParser = require("cookie-parser");

const app = express();

const port = 5000;

app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    next(); // handled as raw
  } else {
    express.json()(req, res, next);
  }
});

app.use(
  cors({
    origin: "https://jobpiolet-backend-1.onrender.com",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use("/api/auth", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/candidate", candidateRoute);
app.listen(5000, () => {
  console.log(`server working on http://localhost:${port}`);
  connectDB();
});
