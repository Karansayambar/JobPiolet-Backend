const express = require("express");
const connectDB = require("./services/db");
const cors = require("cors");
const userRoute = require("./routes/authRoutes");
const companyRoute = require("./routes/companyRoutes");
const jobRoute = require("./routes/jobsRoute");
const paymentRoute = require("./routes/paymentRoute");
const candidateRoute = require("./routes/candidateRoute");
const { stripeWebhook } = require("./controllers/paymentController");
const http = require("http");
const { Server } = require("socket.io");
const limiter = require("./utils/rateLimiter");
const protect = require("./middleware/protect");
const Jobs = require("./models/company/createJobModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const candidateProfile = require("./models/userModels");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const dotenv = require("dotenv").config();
// const http = require("http")
// const {Server} = require("socket.io")

// const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:5173",
    origin : "https://job-piolet-frontend.vercel.app",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  },
});
global.io = io;

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
    origin: "https://job-piolet-frontend.vercel.app",
    // origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use("/api/auth", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/candidate", candidateRoute);
server.listen(5000, () => {
  console.log(`server working on http://localhost:${port}`);
  connectDB();
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "User:", socket.user);

  socket.on("getJobsForUser", async () => {
    try {
      const profile = await candidateProfile.findOne({
        userId: socket.user.userId,
      });

      if (!profile) {
        return socket.emit("jobsForUser", {
          success: false,
          message: "Candidate profile not found.",
        });
      }

      const matchingJobs = await Jobs.find({
        $or: [
          { jobRole: { $regex: new RegExp(profile.candidateInfo.title, "i") } },
          { jobTitle: { $regex: new RegExp(profile.candidateInfo.title, "i") } },
        ],
      });

      if (!matchingJobs || matchingJobs.length === 0) {
        socket.emit("jobsForUser", {
          success: false,
          message: "No jobs found",
        });
      } else {
        socket.emit("jobsForUser", {
          success: true,
          matchingJobs,
        });
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      socket.emit("jobsForUser", {
        success: false,
        message: "Server Error",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
