const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { rateLimiter } = require("../utils/rateLimiter");
const { captureUserInfo } = require("../utils/userInfo");
const { tokenizeReason } = require("../utils/tokenizeReason");
const { db } = require("../db/db");
const { setFeedbackCookies } = require("../utils/cookieUtils");
const { generateToken } = require("../utils/tokenUtils");
const { checkForDuplicateSubmission } = require("../utils/dbUtils");

// Middleware for rate limiting
router.use(rateLimiter);

// Handle feedback submission
router.post("/", async (req, res) => {
  try {
    const { event, response, reason } = req.body;
    const date = new Date().toISOString().split("T")[0];
    const time = new Date().toISOString().split("T")[1].split(".")[0];
    const keywords = reason ? tokenizeReason(reason) : "";
    const { browser, os, location, ip } = captureUserInfo(req);

    // Check if a token already exists in the cookies
    let token = req.cookies.feedbackToken;

    // Generate a new token only if the cookie token does not exist
    if (!token) {
      token = await generateToken();
    }

    // Check for duplicate submissions
    const isDuplicate = await checkForDuplicateSubmission(db, ip, token);
    if (isDuplicate) {
      console.log("Duplicate submission detected.");
      return res.status(409).json({
        error: "Duplicate feedback submission detected. Please try again.",
      });
    }

    await insertFeedback(db, {
      event,
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

    setFeedbackCookies(res, { token, event });

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

// Insert feedback into the database
function insertFeedback(db, feedbackData) {
  return new Promise((resolve, reject) => {
    const {
      event,
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
    } = feedbackData;

    db.run(
      `INSERT INTO feedback (event, response, date, time, reason, keywords, browser, os, location, ipaddr, submit_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event,
        response,
        date,
        time,
        reason || "",
        keywords,
        browser,
        os,
        location,
        ip,
        token,
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = router;
