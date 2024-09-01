const rateLimit = require("express-rate-limit");

// Set up rate limiter: 1 request per IP per day
const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 1, // Limit each IP to 1 request per windowMs
  message: {
    error:
      "You have already submitted feedback today. Please try again tomorrow.",
  },
  keyGenerator: (req) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // Use IP address for rate limiting
    const token = req.cookies.feedbackToken || "";
    const userIdentifier = `${ip}-${token}`; // Get the cookie token (use an empty string if not token set)

    // Logging
    console.log(`User ${userIdentifier} submitted feedback at ${new Date()}`);
    return userIdentifier;
  },
});

module.exports = { rateLimiter };
