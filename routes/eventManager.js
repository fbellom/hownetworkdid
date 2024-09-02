// routes/eventManager.js
const express = require("express");
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require("../utils/authUtils");
const tenantsDb = require("../db/initTenantsDB");
const generateUniqueEventCode = require("../utils/generateEventCode"); // Import the utility function

// Create a new event (only owner or root admin can create)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const { name, start_date, end_date, daily_schedule, status } = req.body;
    const org_id = req.user.orgId;
    const owner = req.user.userId;

    if (!name || !start_date || !end_date || !org_id || !owner) {
      return res.status(400).json({
        message: "Name, start_date, end_date, org_id, and owner are required.",
      });
    }

    // Generate a unique event_code
    generateUniqueEventCode((err, eventCode) => {
      if (err) {
        console.error("Error generating unique event_code", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }

      tenantsDb.run(
        `INSERT INTO events (event_code, name, start_date, end_date, daily_schedule, status, feedback_url, org_id, owner)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventCode, // Use the generated event code
          name,
          start_date,
          end_date,
          JSON.stringify(daily_schedule), // Convert schedule to JSON string
          status,
          `/feedback/o/${org_id}/${encodeURIComponent(eventCode)}`, // Use event_code in feedback URL
          org_id,
          owner,
        ],
        function (err) {
          if (err) {
            console.error("Error creating new event", err.message);
            return res.status(500).json({ error: "Internal server error" });
          }

          res.status(201).json({
            message: "Event created successfully.",
            eventId: this.lastID,
            eventCode: eventCode,
          });
        }
      );
    });
  }
);

// List all events (only accessible by SuperUser)
router.get("/", authenticateJWT, authorizeRoles("rootadm"), (req, res) => {
  tenantsDb.all(`SELECT * FROM events`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching all events", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json(rows);
  });
});

// Get all events for a specific tenant (only root admin, owner, or admin of the tenant)
router.get(
  "/o/:orgId",
  authenticateJWT,
  authorizeRoles("rootadm", "owner", "admin"),
  (req, res) => {
    const orgId = req.params.orgId;

    tenantsDb.all(
      `SELECT * FROM events WHERE org_id = ?`,
      [orgId],
      (err, rows) => {
        if (err) {
          console.error("Error fetching events for tenant", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.status(200).json(rows);
      }
    );
  }
);

// Get a specific event by event_code (only root admin or owner can access)
router.get(
  "/o/:orgId/:eventCode",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const orgId = req.params.orgId;
    const eventCode = req.params.eventCode;

    tenantsDb.get(
      `SELECT * FROM events WHERE event_code = ? AND org_id = ?`,
      [eventCode, orgId],
      (err, event) => {
        if (err) {
          console.error("Error fetching event", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (!event) {
          return res.status(404).json({ message: "Event not found." });
        }

        res.status(200).json(event);
      }
    );
  }
);

// Update an event (only owner or root admin can update)
router.put(
  "/o/:orgId/:eventCode",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const orgId = req.params.orgId;
    const eventCode = req.params.eventCode;
    const { name, start_date, end_date, daily_schedule, status } = req.body;

    tenantsDb.run(
      `UPDATE events SET name = ?, start_date = ?, end_date = ?, daily_schedule = ?, status = ? WHERE event_code = ? AND org_id = ?`,
      [
        name,
        start_date,
        end_date,
        JSON.stringify(daily_schedule),
        status,
        eventCode,
        orgId,
      ],
      function (err) {
        if (err) {
          console.error("Error updating event", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (this.changes === 0) {
          return res
            .status(404)
            .json({ message: "Event not found or no changes made." });
        }

        res.status(200).json({ message: "Event updated successfully." });
      }
    );
  }
);

// Delete an event (only owner or root admin can delete)
router.delete(
  "/o/:orgId/:eventCode",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const orgId = req.params.orgId;
    const eventCode = req.params.eventCode;

    tenantsDb.run(
      `DELETE FROM events WHERE event_code = ? AND org_id = ?`,
      [eventCode, orgId],
      function (err) {
        if (err) {
          console.error("Error deleting event", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: "Event not found." });
        }

        res.status(200).json({ message: "Event deleted successfully." });
      }
    );
  }
);

module.exports = router;
