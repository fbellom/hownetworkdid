const crypto = require("crypto");
const tenantsDb = require("../db/initTenantsDB");

function generateFeedbackToken(callback) {
  let feedbackToken = "";
  crypto.randomBytes(24, (err, buffer) => {
    if (err) {
      console.error("Error generating token:", err.message);
      return reject(new Error("Failed to generate token"));
    }
    feedbackToken = buffer.toString("hex");
  });

  // Check if this feedbackToken already exists in the feedback table
  tenantsDb.get(
    `SELECT * FROM feedback WHERE submit_hash = ?`,
    [feedbackToken],
    (err, row) => {
      if (err) {
        console.error("Error checking for existing submit_hash", err.message);
        callback(err, null);
        return;
      }

      if (row) {
        // eventCode already exists, generate a new one recursively
        return generateFeedbackToken(callback);
      } else {
        // token is unique
        callback(null, feedbackToken);
      }
    }
  );
}

module.exports = generateFeedbackToken;
