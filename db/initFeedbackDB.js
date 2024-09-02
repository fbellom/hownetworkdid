// db/initUsersDb.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define the user database file location
const DBPath = path.resolve(__dirname, "../datastore/feedback.db");

const feedbackDb = new sqlite3.Database(DBPath, (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    feedbackDb.run(
      `CREATE TABLE IF NOT EXISTS feedback (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  event TEXT,
                  response TEXT,
                  date TEXT,
                  time TEXT,
                  reason TEXT,
                  keywords TEXT,
                  browser TEXT,
                  os TEXT,
                  location TEXT,
                  ipaddr TEXT,
                  submit_hash TEXT UNIQUE)`,
      (err) => {
        if (err) {
          console.error("Error creating table " + err.message);
        }
      }
    );
  }
});

module.exports = feedbackDb;
