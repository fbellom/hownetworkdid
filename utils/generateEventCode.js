// utils/generateEventCode.js
const tenantsDb = require("../db/initTenantsDB");

function generateUniqueEventCode(callback) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let eventCode = "";
  for (let i = 0; i < 12; i++) {
    eventCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  // Check if this eventCode already exists in the events table
  tenantsDb.get(
    `SELECT * FROM events WHERE event_code = ?`,
    [eventCode],
    (err, row) => {
      if (err) {
        console.error("Error checking for existing event_code", err.message);
        callback(err, null);
        return;
      }

      if (row) {
        // eventCode already exists, generate a new one recursively
        return generateUniqueEventCode(callback);
      } else {
        // eventCode is unique
        callback(null, eventCode);
      }
    }
  );
}

module.exports = generateUniqueEventCode;
