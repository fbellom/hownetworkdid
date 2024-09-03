const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { rateLimiter } = require("../utils/rateLimiter");
const { captureUserInfo } = require("../utils/userInfo");
const { tokenizeReason } = require("../utils/tokenizeReason");
const { db } = require("../db/db");
const { setFeedbackCookies } = require("../utils/cookieUtils");
const { generateToken } = require("../utils/tokenUtils");
const {
  insertNewFeedback,
  insertFeedback,
} = require("../utils/insertFeedback");

// Middleware for rate limiting
//router.use(rateLimiter);

// Handle feedback submission
router.post("/", async (req, res) => {
  try {
    const { response, reason } = req.body;
    const date = new Date().toISOString().split("T")[0];
    const time = new Date().toISOString().split("T")[1].split(".")[0];
    const keywords = reason ? tokenizeReason(reason) : "";
    const { browser, os, location, ip } = captureUserInfo(req);
    const token = await generateToken();
    const eventCode = "";
    const orgId = "";

    await insertFeedback(db, {
      eventCode,
      orgId,
      response,
      date,
      time,
      reason,
      keywords,
      browser,
      os,
      location,
      ip,
      token,
    });

    setFeedbackCookies(res, { token, eventCode });

    res.json({ message: "Feedback submitted successfully!" });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      console.log("Duplicate submit_hash detected, generating a new one.");
      return res.status(409).json({
        error: "Duplicate feedback submission detected. Please try again.",
      });
    }
    console.error("Error inserting feedback:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/o/:orgId/:eventCode", async (req, res) => {
  try {
    const eventCode = req.params.eventCode;
    const orgId = req.params.orgId;
    const { response, reason } = req.body;
    const keywords = reason ? tokenizeReason(reason) : "";
    const { browser, os, location, ip } = captureUserInfo(req);
    const token = await generateToken();

    // console.log(orgId); // Output: "9999991"
    // console.log(eventCode); // Output: "cloud-security-pod"

    await insertNewFeedback(db, {
      eventCode,
      orgId,
      response,
      reason,
      keywords,
      browser,
      os,
      location,
      ip,
      token,
    });

    setFeedbackCookies(res, { token, eventCode });

    res.json({ message: "Feedback submitted successfully!" });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      console.log("Duplicate submit_hash detected, generating a new one.");
      return res.status(409).json({
        error: "Duplicate feedback submission detected. Please try again.",
      });
    }
    console.error("Error inserting feedback:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
