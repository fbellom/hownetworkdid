const sqlite3 = require("sqlite3").verbose();

// Initialize SQLite database
const db = new sqlite3.Database("./feedback.db", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS feedback (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              event_code TEXT,
              tenant_org_id TEXT,
              response TEXT CHECK(response IN ('Good', 'Neutral', 'Bad')),  -- Only allows specific values
              date TEXT DEFAULT (date('now')), -- Automatically sets the current date
              time TEXT DEFAULT (time('now')),  -- Automatically sets the current time
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

  console.log("Feedback table created or already exists.");
  // Create Indices
  // db.run(
  //   `CREATE INDEX IF NOT EXISTS idx_feedback_event_code ON feedback(event_code);`
  // );
  // db.run(
  //   `CREATE INDEX IF NOT EXISTS idx_feedback_tenant_org_id ON feedback(tenant_org_id);`
  // );
  // db.run(
  //   `CREATE INDEX IF NOT EXISTS idx_feedback_event_tenant ON feedback(tenant_org_id, event_code);`
  // );
  // db.run(
  //   `CREATE INDEX IF NOT EXISTS idx_feedback_submit_hash ON feedback(submit_hash);`
  // );
});

module.exports = { db };
