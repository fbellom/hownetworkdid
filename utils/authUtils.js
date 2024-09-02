// utils/authMiddleware.js
const jwt = require("jsonwebtoken");
const tenantsDb = require("../db/initTenantsDB");

function authenticateJWT(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    tenantsDb.get(
      `SELECT * FROM blacklisted_tokens WHERE token = ?`,
      [token],
      (err, row) => {
        if (err) {
          //error logic
          console.error("Error checking blacklisted token", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (row) {
          //there is a token to be blacklisted
          return res
            .status(401)
            .json({ message: "Token is invalid (blacklisted)." });
        }

        // Token is valid
        req.user = user;
        next();
      }
    );
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

module.exports = { authenticateJWT, authorizeRoles };
