// utils/checkRootUser.js
const tenantsDb = require("../db/initTenantsDB");

function checkRootUserExists(callback) {
  tenantsDb.get(
    `SELECT * FROM users WHERE role = 'rootadm'`,
    [],
    (err, row) => {
      if (err) {
        console.error("Error checking for root user:", err.message);
        callback(err);
        return;
      }

      if (!row) {
        console.log(
          "No Root found. Please create a root user using the /setup/create-root endpoint."
        );
      } else {
        console.log("Root user already exists.");
      }

      callback();
    }
  );
}

module.exports = checkRootUserExists;
