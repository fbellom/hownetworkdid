// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const tenantsDb = require("../db/initTenantsDB"); // Import the tenants database
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const { authenticateJWT, authorizeRoles } = require("../utils/authUtils");
const generateOrgId = require("../utils/generateOrgId");

//Create Root Admin
// Endpoint to create a Root Admin (only allowed if no Root Admin exists or accessed by an existing Root Admin)
router.post("/setup/create-root", async (req, res) => {
  const { username, email, full_name, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  try {
    // Check if a Root Admin already exists
    tenantsDb.get(
      `SELECT * FROM users WHERE role = 'rootadm'`,
      [],
      async (err, existingRootAdmin) => {
        if (err) {
          console.error("Error checking for existing Root Admin", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        // If a Root Admin already exists and the requester is not a Root Admin, deny the request
        if (existingRootAdmin) {
          // Ensure the request is authenticated
          if (!req.user) {
            return res
              .status(401)
              .json({ message: "Authentication required." });
          }

          // Esure the authenticated user is Root Admin
          if (req.user.role !== "rootadm") {
            return res.status(403).json({
              message:
                "Root Admin already exists. Only Root Admin can create another one.",
            });
          }
        }

        // If no Root Admin exists or the requester is a Root Admin, proceed to create a new Root Admin
        const hashedPassword = await bcrypt.hash(password, 10);
        const creationDate = new Date().toISOString();

        tenantsDb.run(
          `INSERT INTO users (username, email, tenant_org_id, full_name, passwordHash, role, created_date, status) VALUES (?, ?, 1000001, ?, ?, 'rootadm', ?, 1)`,
          [username, email, full_name, hashedPassword, creationDate],
          function (err) {
            if (err) {
              console.error("Error creating Root Admin", err.message);
              return res.status(500).json({ error: "Internal server error" });
            }

            res.status(201).json({
              message: "Root Admin created successfully.",
              userId: this.lastID,
            });
          }
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register a new user
router.post("/register", async (req, res) => {
  const { tenantName, username, email, full_name, password, role } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  try {
    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    let tenantId;

    tenantsDb.serialize(() => {
      // Check if the tenant already exists
      tenantsDb.get(
        `SELECT * FROM tenants WHERE name = ?`,
        [tenantName],
        (err, tenant) => {
          if (err) {
            console.error("Error fetching tenant from database", err.message);
            return res.status(500).json({ error: "Internal server error" });
          }

          // If tenant does not exist and the user is an owner, create a new tenant
          if (!tenant && role === "owner") {
            const tenantUuid = uuidv4(); // Generate a unique UUID for the tenant

            const creationDate = new Date().toISOString();

            generateOrgId((err, orgId) => {
              if (err) {
                console.error("Error generating unique org_id", err.message);
                return res.status(500).json({ error: "Internal server error" });
              }
              tenantsDb.run(
                `INSERT INTO tenants (name, custom_prefix_url, uuid, org_id , owner, creation_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  tenantName,
                  `/tenants/o/${orgId}`,
                  tenantUuid,
                  orgId,
                  null,
                  creationDate,
                  1,
                ],
                function (err) {
                  if (err) {
                    console.error("Error creating new tenant", err.message);
                    return res
                      .status(500)
                      .json({ error: "Internal server error" });
                  }

                  tenantId = this.lastID; // Get the newly created tenant ID

                  // Insert the new user as the owner
                  tenantsDb.run(
                    `INSERT INTO users (username, email, tenant_org_id, full_name, passwordHash, role, created_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                      username,
                      email,
                      orgId,
                      full_name,
                      hashedPassword,
                      role,
                      creationDate,
                      1,
                    ],
                    function (err) {
                      if (err) {
                        console.error("Error creating new user", err.message);
                        return res
                          .status(500)
                          .json({ error: "Internal server error" });
                      }

                      // Update the tenant's owner field with the new user ID
                      tenantsDb.run(
                        `UPDATE tenants SET owner = ? WHERE org_id = ?`,
                        [this.lastID, orgId],
                        (err) => {
                          if (err) {
                            console.error(
                              "Error updating tenant owner",
                              err.message
                            );
                            return res
                              .status(500)
                              .json({ error: "Internal server error" });
                          }

                          return res.status(201).json({
                            message:
                              "Tenant and owner user created successfully.",
                            userId: this.lastID,
                            tenantId: tenantId,
                            orgId: orgId,
                          });
                        }
                      );
                    }
                  );
                }
              );
            });
          } else if (tenant && role !== "owner") {
            // Register a new user under an existing tenant
            const creationDate = new Date().toISOString();

            tenantsDb.run(
              `INSERT INTO users (username, email, tenant_org_id, full_name, passwordHash, role, created_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                username,
                email,
                orgId,
                full_name,
                hashedPassword,
                role,
                creationDate,
                1,
              ],
              function (err) {
                if (err) {
                  console.error("Error creating new user", err.message);
                  return res
                    .status(500)
                    .json({ error: "Internal server error" });
                }

                return res.status(201).json({
                  message: "User created successfully under existing tenant.",
                  userId: this.lastID,
                  tenantId: tenant.id,
                  orgId: tenant.org_id,
                });
              }
            );
          } else {
            // Cannot create a tenant with a non-owner role
            return res
              .status(403)
              .json({ message: "Only an owner can create a new tenant." });
          }
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { orgId, username, password } = req.body;

  try {
    let query = "";
    let params = [];

    if (orgId) {
      // Regular user login
      query = `SELECT * FROM users WHERE tenant_org_id = ? AND username = ?`;
      params = [orgId, username];
    } else {
      // Root user login
      query = `SELECT * FROM users WHERE tenant_org_id IS '1000001' AND username = ? AND role = 'rootadm'`;
      params = [username];
    }

    // Fetch the user from the database
    tenantsDb.get(query, params, async (err, user) => {
      if (err) {
        console.error("Error fetching user from database", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Compare the provided password with the stored hash
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid password." });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
          orgId: user.tenant_org_id, // This will be null for root user
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || "1d" }
      );

      // Generate refresh token
      const refreshToken = await generateRefreshToken(user.id);

      res.status(200).json({ token, refreshToken });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout a user (no middleware required)
router.post("/logout", async (req, res) => {
  const { refreshToken, accessToken } = req.body; // Ensure both tokens are provided

  try {
    tenantsDb.serialize(() => {
      // Step 1: Blacklist the access token
      tenantsDb.run(
        `INSERT INTO blacklisted_tokens (token, blacklisted_at) VALUES (?, ?)`,
        [accessToken, new Date().toISOString()],
        function (err) {
          if (err) {
            console.error("Error blacklisting token in database", err.message);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Step 2: Delete the refresh token from the database
          tenantsDb.run(
            `DELETE FROM refresh_tokens WHERE refresh_token = ?`,
            [refreshToken],
            function (err) {
              if (err) {
                console.error(
                  "Error deleting refresh token from database",
                  err.message
                );
                return res.status(500).json({ error: "Internal server error" });
              }

              return res.status(200).json({
                message: "Successfully logged out and tokens invalidated.",
              });
            }
          );
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Refresh token endpoint
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    tenantsDb.get(
      `SELECT * FROM refresh_tokens WHERE refresh_token = ?`,
      [refreshToken],
      (err, tokenRecord) => {
        if (err) {
          console.error(
            "Error fetching refresh token from database",
            err.message
          );
          return res.status(500).json({ error: "Internal server error" });
        }

        if (!tokenRecord) {
          return res.status(403).json({ message: "Invalid refresh token." });
        }

        // Check if the refresh token is expired
        if (new Date(tokenRecord.expires_at) < new Date()) {
          tenantsDb.run(
            `DELETE FROM refresh_tokens WHERE refresh_token = ?`,
            [refreshToken],
            (err) => {
              if (err) {
                console.error(
                  "Error deleting expired refresh token",
                  err.message
                );
              }
            }
          );

          return res.status(403).json({ message: "Refresh token expired." });
        }

        // Fetch user data
        tenantsDb.get(
          `SELECT * FROM users WHERE id = ?`,
          [tokenRecord.user_id],
          (err, user) => {
            if (err) {
              console.error("Error fetching user from database", err.message);
              return res.status(500).json({ error: "Internal server error" });
            }

            if (!user) {
              return res.status(404).json({ message: "User not found." });
            }

            // Generate a new JWT token
            const newToken = jwt.sign(
              {
                userId: user.id,
                username: user.username,
                role: user.role,
                orgId: user.tenant_org_id,
              },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRY || "1d" }
            );

            res.status(200).json({ token: newToken });
          }
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to generate a new refresh token
function generateRefreshToken(userId) {
  return new Promise((resolve, reject) => {
    const refreshToken = uuidv4(); // Generate a unique refresh token
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(); // Set expiry to 30 days from now

    tenantsDb.run(
      `INSERT INTO refresh_tokens (user_id, refresh_token, created_at, expires_at) VALUES (?, ?, ?, ?)`,
      [userId, refreshToken, createdAt, expiresAt],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(refreshToken);
        }
      }
    );
  });
}

//// List all users (only accessible by SuperUser)
router.get("/", authenticateJWT, authorizeRoles("rootadm"), (req, res) => {
  tenantsDb.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching tenants", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json(rows);
  });
});

//// Get One user by Username (only accessible by SuperUser)
router.get(
  "/:userName",
  authenticateJWT,
  authorizeRoles("rootadm"),
  (req, res) => {
    const userName = req.params.userName;
    tenantsDb.all(
      `SELECT * FROM users WHERE username = ?`,
      [userName],
      (err, rows) => {
        if (err) {
          console.error("Error fetching tenants", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json(rows);
      }
    );
  }
);

module.exports = router;
