const rateLimit = require("express-rate-limit");

const rateLimitWindow = 60 * 1000;
const maxLimit = 3;
const requests = {};
const limiter = (req, res, next) => {
  const ip = req.ip;

  if (!requests[ip]) {
    requests[ip] = { count: 1, startTime: Date.now() };
  } else {
    requests[ip].count++;
  }

  if (Date.now() - requests[ip].startTime > rateLimitWindow) {
    requests[ip].count = 1;
    requests[ip].startTime = Date.now();
  }

  if (requests[ip].count > maxLimit) {
    return res
      .status(429)
      .json(
        `To many request please wait for ${Date.now(-requests[ip].startTime)}`
      );
  }
  next();
};

module.exports = limiter;
