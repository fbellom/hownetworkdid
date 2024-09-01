const sqlite3 = require("sqlite3").verbose();

// Initialize SQLite database
const db = new sqlite3.Database("./feedback.db", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    db.run(
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

module.exports = { db };
