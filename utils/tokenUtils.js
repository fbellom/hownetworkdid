const crypto = require("crypto");

function generateToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(24, (err, buffer) => {
      if (err) {
        console.error("Error generating token:", err.message);
        return reject(new Error("Failed to generate token"));
      }
      resolve(buffer.toString("hex"));
    });
  });
}

module.exports = { generateToken };
