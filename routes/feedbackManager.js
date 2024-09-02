// routes/feedbackManager.js
const express = require("express");
const router = express.Router();
const tenantsDb = require("../db/initTenantsDB");
const { authenticateJWT, authorizeRoles } = require("../utils/authUtils");
const generateSubmitHash = require("../utils/generateSubmitHash");
const { captureUserInfo } = require("../utils/userInfo");
const { tokenizeReason } = require("../utils/tokenizeReason");
const { setFeedbackCookies } = require("../utils/cookieUtils");
const generateFeedbackToken = require("../utils/generateFeedbackToken");

// Create new feedback entry (accessible to all users, including guests)
router.post("/o/:orgId/:eventCode", (req, res) => {
  const { response, reason } = req.body;
  const tenantOrgId = req.params.orgId; // Extract org_id from the URL
  const eventCode = req.params.eventCode; // Extract event_code from the URL
  const { browser, os, location, ipaddr } = captureUserInfo(req);
  const keywords = reason ? tokenizeReason(reason) : "";

  // Validation checks
  if (!eventCode || !response) {
    return res
      .status(400)
      .json({ message: "Event code and response are required." });
  }

  // Check if a token already exists in the cookies
  let token = req.cookies.feedbackToken;

  // Generate a new token only if the cookie token does not exist
  if (!token) {
    token = generateFeedbackToken();
  }

  const owner = null; // No owner since it's a guest submission
  const submitHash = generateSubmitHash(
    eventCode,
    tenantOrgId,
    response,
    owner
  ); // Unique hash to prevent duplicates

  tenantsDb.run(
    `INSERT INTO feedback (event_code, tenant_org_id, owner, response, reason, keywords, browser, os, location, ipaddr, submit_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      eventCode,
      tenantOrgId,
      owner,
      response,
      reason,
      keywords,
      browser,
      os,
      location,
      ipaddr,
      token,
    ],
    function (err) {
      if (err) {
        console.error("Error creating feedback", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(201).json({
        message: "Feedback submitted successfully.",
        feedbackId: this.lastID,
      });
    }
  );
});

// List all feedback entries (only accessible by superuser)
router.get("/", authenticateJWT, authorizeRoles("rootadm"), (req, res) => {
  tenantsDb.all(`SELECT * FROM feedback`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching feedback entries", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json(rows);
  });
});

// List feedback for a specific tenant in all events (tenant owners and superuser can view)
router.get(
  "/o/:orgId",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const orgId = req.params.orgId;
    const eventCode = req.params.eventCode;

    tenantsDb.all(
      `SELECT * FROM feedback WHERE tenant_org_id = ?`,
      [orgId],
      (err, rows) => {
        if (err) {
          console.error("Error fetching feedback for all events", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json(rows);
      }
    );
  }
);

// List feedback for a specific event (tenant owners and superuser can view)
router.get(
  "/o/:orgId/:eventCode",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const orgId = req.params.orgId;
    const eventCode = req.params.eventCode;

    tenantsDb.all(
      `SELECT * FROM feedback WHERE event_code = ? AND tenant_org_id = ?`,
      [eventCode, orgId],
      (err, rows) => {
        if (err) {
          console.error("Error fetching feedback for event", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json(rows);
      }
    );
  }
);

// Get specific feedback entry by ID (only accessible by owner or superuser)
router.get(
  "/:feedbackId",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const feedbackId = req.params.feedbackId;

    tenantsDb.get(
      `SELECT * FROM feedback WHERE id = ?`,
      [feedbackId],
      (err, feedback) => {
        if (err) {
          console.error("Error fetching feedback", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (!feedback) {
          return res.status(404).json({ message: "Feedback not found." });
        }

        // Ensure the owner or superuser is accessing the feedback
        if (req.user.role !== "rootadm" && req.user.userId !== feedback.owner) {
          return res
            .status(403)
            .json({ message: "Unauthorized to view this feedback." });
        }

        res.status(200).json(feedback);
      }
    );
  }
);

// Update a feedback entry (only owner or superuser can update)
router.put(
  "/:feedbackId",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const feedbackId = req.params.feedbackId;
    const { response, reason, keywords } = req.body;

    tenantsDb.run(
      `UPDATE feedback SET response = ?, reason = ?, keywords = ? WHERE id = ?`,
      [response, reason, keywords, feedbackId],
      function (err) {
        if (err) {
          console.error("Error updating feedback", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (this.changes === 0) {
          return res
            .status(404)
            .json({ message: "Feedback not found or no changes made." });
        }

        res.status(200).json({ message: "Feedback updated successfully." });
      }
    );
  }
);

// Delete a feedback entry (only owner or superuser can delete)
router.delete(
  "/:feedbackId",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const feedbackId = req.params.feedbackId;

    tenantsDb.run(
      `DELETE FROM feedback WHERE id = ?`,
      [feedbackId],
      function (err) {
        if (err) {
          console.error("Error deleting feedback", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: "Feedback not found." });
        }

        res.status(200).json({ message: "Feedback deleted successfully." });
      }
    );
  }
);

module.exports = router;
