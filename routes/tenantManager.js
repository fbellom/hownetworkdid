const express = require("express");
const router = express.Router();
const { rateLimiter } = require("../utils/rateLimiter");

// Middleware for rate limiting
// router.use(rateLimiter);

router.get("/", (req, res) => {
  res.send("Tenant Manager");
});

module.exports = router;
