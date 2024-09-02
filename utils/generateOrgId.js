// utils/generateOrgId.js
const tenantsDb = require("../db/initTenantsDB");

function generateUniqueOrgId(callback) {
  const orgId = Math.floor(1000000 + Math.random() * 9000000).toString(); // Generate a random 7-digit number

  // Check if this orgId already exists in the tenants table
  tenantsDb.get(
    `SELECT * FROM tenants WHERE org_id = ?`,
    [orgId],
    (err, row) => {
      if (err) {
        console.error("Error checking for existing org_id", err.message);
        callback(err, null);
        return;
      }

      if (row) {
        // orgId already exists, generate a new one recursively
        return generateUniqueOrgId(callback);
      } else {
        // orgId is unique
        callback(null, orgId);
      }
    }
  );
}

module.exports = generateUniqueOrgId;
