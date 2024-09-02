const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { authenticateJWT, authorizeRoles } = require("../utils/authUtils");
const tenantsDb = require("../db/initTenantsDB");
const generateUniqueOrgId = require("../utils/generateOrgId");

// Middleware for rate limiting (uncomment if needed)
// router.use(rateLimiter);

// List all tenants (only accessible by SuperUser)
router.get("/", authenticateJWT, authorizeRoles("rootadm"), (req, res) => {
  tenantsDb.all(`SELECT * FROM tenants`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching tenants", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json(rows);
  });
});

// Create a new tenant (SuperUser or owner can create)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  async (req, res) => {
    const { name, owner } = req.body;

    if (!name || !owner) {
      return res.status(400).json({ message: "Name and owner are required." });
    }

    try {
      const tenantUuid = uuidv4(); // Generate a unique UUID for the tenant
      const creationDate = new Date().toISOString();

      // Generate a unique org_id
      generateUniqueOrgId((err, orgId) => {
        if (err) {
          console.error("Error generating unique org_id", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Create the tenant with the unique org_id
        tenantsDb.run(
          `INSERT INTO tenants (name, custom_prefix_url, uuid, org_id, owner, creation_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            name,
            `/tenants/o/${orgId}`,
            tenantUuid,
            orgId,
            owner,
            creationDate,
            1,
          ],
          function (err) {
            if (err) {
              console.error("Error creating new tenant", err.message);
              return res.status(500).json({ error: "Internal server error" });
            }

            res.status(201).json({
              message: "Tenant created successfully.",
              tenantId: this.lastID,
              orgId: orgId,
            });
          }
        );
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Read tenant by orgId (SuperUser or owner can access)
router.get(
  "/o/:orgId",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const orgId = req.params.orgId;

    tenantsDb.get(
      `SELECT * FROM tenants WHERE org_id = ?`,
      [orgId],
      (err, tenant) => {
        if (err) {
          console.error("Error fetching tenant", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (!tenant) {
          return res.status(404).json({ message: "Tenant not found." });
        }

        res.status(200).json(tenant);
      }
    );
  }
);

// Update tenant (SuperUser or owner can update)
router.put(
  "/o/:orgId",
  authenticateJWT,
  authorizeRoles("rootadm", "owner"),
  (req, res) => {
    const orgId = req.params.orgId;
    const { name, owner, status } = req.body;

    tenantsDb.run(
      `UPDATE tenants SET name = ?, owner = ?, status = ? WHERE org_id = ?`,
      [name, owner, status, orgId],
      function (err) {
        if (err) {
          console.error("Error updating tenant", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (this.changes === 0) {
          return res
            .status(404)
            .json({ message: "Tenant not found or no changes made." });
        }

        res.status(200).json({ message: "Tenant updated successfully." });
      }
    );
  }
);

// Delete tenant (SuperUser can delete)
router.delete(
  "/o/:orgId",
  authenticateJWT,
  authorizeRoles("rootadm"),
  (req, res) => {
    const orgId = req.params.orgId;

    tenantsDb.run(
      `DELETE FROM tenants WHERE org_id = ?`,
      [orgId],
      function (err) {
        if (err) {
          console.error("Error deleting tenant", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: "Tenant not found." });
        }

        res.status(200).json({ message: "Tenant deleted successfully." });
      }
    );
  }
);

// List all tenants owned by the logged-in user (owner role)
router.get("/owned", authenticateJWT, authorizeRoles("owner"), (req, res) => {
  const userId = req.user.userId;
  tenantsDb.all(
    `SELECT * FROM tenants WHERE owner = ?`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Error fetching user's tenants", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json(rows);
    }
  );
});

// List all users belonging to a specific tenant by orgId (only owner of the tenant)
router.get(
  "/o/:orgId/users",
  authenticateJWT,
  authorizeRoles("owner"),
  (req, res) => {
    const userId = req.user.userId;
    const orgId = req.params.orgId;

    // Verify the logged-in user is the owner of the tenant
    tenantsDb.get(
      `SELECT * FROM tenants WHERE org_id = ? AND owner = ?`,
      [orgId, userId],
      (err, tenant) => {
        if (err) {
          console.error("Error fetching tenant", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!tenant) {
          return res
            .status(403)
            .json({ message: "You do not own this tenant." });
        }

        tenantsDb.all(
          `SELECT * FROM users WHERE tenant_org_id = ?`, // Changed tenant_id to tenant_org_id
          [orgId],
          (err, rows) => {
            if (err) {
              console.error("Error fetching users", err.message);
              return res.status(500).json({ error: "Internal server error" });
            }
            res.status(200).json(rows);
          }
        );
      }
    );
  }
);

// List all users belonging to a specific tenant by orgId (only owner of the tenant)
router.get(
  "/o/:orgId/users/:userId",
  authenticateJWT,
  authorizeRoles("owner"),
  (req, res) => {
    const userId = req.user.userId;
    const orgId = req.params.orgId;
    const tenantUserId = req.params.userId;

    // Verify the logged-in user is the owner of the tenant
    tenantsDb.get(
      `SELECT * FROM tenants WHERE org_id = ? AND owner = ?`,
      [orgId, userId],
      (err, tenant) => {
        if (err) {
          console.error("Error fetching tenant", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!tenant) {
          return res
            .status(403)
            .json({ message: "You do not own this tenant." });
        }

        tenantsDb.all(
          `SELECT * FROM users WHERE tenant_org_id = ? AND id = ?`, // Changed tenant_id to tenant_org_id
          [orgId, tenantUserId],
          (err, rows) => {
            if (err) {
              console.error("Error fetching users", err.message);
              return res.status(500).json({ error: "Internal server error" });
            }
            res.status(200).json(rows);
          }
        );
      }
    );
  }
);

// Add a new user to a tenant by orgId (only owner)
router.post(
  "/o/:orgId/users",
  authenticateJWT,
  authorizeRoles("owner"),
  async (req, res) => {
    const userId = req.user.userId;
    const orgId = req.params.orgId;
    const { username, email, full_name, role, password } = req.body;

    // Verify the logged-in user is the owner of the tenant
    tenantsDb.get(
      `SELECT * FROM tenants WHERE org_id = ? AND owner = ?`,
      [orgId, userId],
      async (err, tenant) => {
        if (err) {
          console.error("Error fetching tenant", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!tenant) {
          return res
            .status(403)
            .json({ message: "You do not own this tenant." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        tenantsDb.run(
          `INSERT INTO users (username, email, tenant_org_id, full_name, passwordHash, role, created_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, // Changed tenant_id to tenant_org_id
          [
            username,
            email,
            orgId, // Use orgId instead of tenant.id
            full_name,
            hashedPassword,
            role,
            new Date().toISOString(),
            1,
          ],
          function (err) {
            if (err) {
              console.error("Error adding user", err.message);
              return res.status(500).json({ error: "Internal server error" });
            }
            res.status(201).json({ userId: this.lastID });
          }
        );
      }
    );
  }
);

// Modify a user in a tenant by orgId (only owner)
router.put(
  "/o/:orgId/users/:userId",
  authenticateJWT,
  authorizeRoles("owner"),
  (req, res) => {
    const userId = req.user.userId;
    const orgId = req.params.orgId;
    const targetUserId = req.params.userId;
    const { email, full_name, role, status } = req.body;

    // Verify the logged-in user is the owner of the tenant
    tenantsDb.get(
      `SELECT * FROM tenants WHERE org_id = ? AND owner = ?`,
      [orgId, userId],
      (err, tenant) => {
        if (err) {
          console.error("Error fetching tenant", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!tenant) {
          return res
            .status(403)
            .json({ message: "You do not own this tenant." });
        }

        tenantsDb.run(
          `UPDATE users SET email = ?, full_name = ?, role = ?, status = ? WHERE id = ? AND tenant_org_id = ?`, // Changed tenant_id to tenant_org_id
          [email, full_name, role, status, targetUserId, orgId], // Use orgId instead of tenant.id
          function (err) {
            if (err) {
              console.error("Error updating user", err.message);
              return res.status(500).json({ error: "Internal server error" });
            }
            res.status(200).json({ message: "User updated successfully." });
          }
        );
      }
    );
  }
);

// Remove a user from a tenant by orgId (only owner)
router.delete(
  "/o/:orgId/users/:userId",
  authenticateJWT,
  authorizeRoles("owner"),
  (req, res) => {
    const userId = req.user.userId;
    const orgId = req.params.orgId;
    const targetUserId = req.params.userId;

    // Verify the logged-in user is the owner of the tenant
    tenantsDb.get(
      `SELECT * FROM tenants WHERE org_id = ? AND owner = ?`,
      [orgId, userId],
      (err, tenant) => {
        if (err) {
          console.error("Error fetching tenant", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!tenant) {
          return res
            .status(403)
            .json({ message: "You do not own this tenant." });
        }

        tenantsDb.run(
          `DELETE FROM users WHERE id = ? AND tenant_org_id = ?`, // Changed tenant_id to tenant_org_id
          [targetUserId, orgId], // Use orgId instead of tenant.id
          function (err) {
            if (err) {
              console.error("Error deleting user", err.message);
              return res.status(500).json({ error: "Internal server error" });
            }
            res.status(200).json({ message: "User deleted successfully." });
          }
        );
      }
    );
  }
);

module.exports = router;
