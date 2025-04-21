const jwt = require("jsonwebtoken");
const secreatKey = "sdnbsmndbcsnm";

const protect = (req, res, next) => {
  const authHeader = req.headers?.authorization;
  // Check if authorization header is present

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, secreatKey);
      req.user = decoded; // { _id, email, etc. }
      next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      res.status(401).json({ message: "Token failed or is invalid" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;
