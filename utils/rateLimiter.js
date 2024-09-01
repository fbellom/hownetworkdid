const rateLimit = require("express-rate-limit");

// Set up rate limiter: 1 request per IP per day
const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 1, // Limit each IP to 1 request per windowMs
  message: {
    error:
      "You have already submitted feedback today. Please try again tomorrow.",
  },
  keyGenerator: (req) =>
    req.headers["x-forwarded-for"] || req.connection.remoteAddress, // Use IP address for rate limiting
});

module.exports = { rateLimiter };
