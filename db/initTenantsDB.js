// db/initUsersDb.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define the user database file location
const DBPath = path.resolve(__dirname, "../datastore/tenants.db");

// Create a new SQLite database instance for users
const tenantsDb = new sqlite3.Database(DBPath, (err) => {
  if (err) {
    console.error("Error opening user database " + err.message);
  } else {
    console.log("Connected to SQLite user database.");

    // Initialize tenants table
    tenantsDb.run(
      `CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        custom_prefix_url TEXT,
        uuid TEXT UNIQUE,
        org_id TEXT UNIQUE, -- for url prefix
        owner INTEGER,  -- references user ID
        creation_date TEXT,
        status INTEGER CHECK( status IN (0, 1) ),  -- 0: inactive, 1: active
        FOREIGN KEY(owner) REFERENCES users(id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating tenants table", err.message);
        } else {
          console.log("Tenants table created or already exists.");
        }
      }
    );

    // Initialize users table
    tenantsDb.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT,
        tenant_org_id INTEGER,  -- references tenant Org ID
        full_name TEXT,
        passwordHash TEXT,
        role TEXT,
        created_date TEXT,
        status INTEGER CHECK( status IN (0, 1) ),  -- 0: inactive, 1: active
        FOREIGN KEY(tenant_org_id) REFERENCES tenants(org_id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating users table", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );

    // Initialize blacklisted_tokens table
    tenantsDb.run(
      `CREATE TABLE IF NOT EXISTS blacklisted_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE,
        blacklisted_at TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating blacklisted_tokens table", err.message);
        } else {
          console.log("Blacklisted tokens table created or already exists.");
        }
      }
    );

    // Initialize refresh_tokens table
    tenantsDb.run(
      `CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      refresh_token TEXT UNIQUE,
      created_at TEXT,
      expires_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
      (err) => {
        if (err) {
          console.error("Error creating refresh_tokens table", err.message);
        } else {
          console.log("Refresh tokens table created or already exists.");
        }
      }
    );

    // Initialize events table
    tenantsDb.run(
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_code TEXT UNIQUE,
        name TEXT,
        start_date TEXT,
        end_date TEXT,
        daily_schedule TEXT,  -- JSON string to handle varying daily schedules
        status INTEGER CHECK( status IN (0, 1) ),  -- 0: inactive, 1: active
        feedback_url TEXT,
        org_id TEXT,  -- references tenant org_id
        owner INTEGER,  -- references user ID
        FOREIGN KEY(org_id) REFERENCES tenants(org_id),
        FOREIGN KEY(owner) REFERENCES users(id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating events table", err.message);
        } else {
          console.log("Events table created or already exists.");
        }
      }
    );

    // Initialize feedback table
    tenantsDb.run(
      `CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_code TEXT,  -- references events event_code
        tenant_org_id TEXT,  -- references tenants org_id
        owner TEXT,  -- references user ID who owns the feedback, optional
        response TEXT CHECK(response IN ('Good', 'Neutral', 'Bad')),  -- Only allows specific values
        date TEXT DEFAULT (date('now')),  -- Automatically sets the current date
        time TEXT DEFAULT (time('now')),  -- Automatically sets the current time
        reason TEXT,  -- Optional free-text for additional feedback
        keywords TEXT,  -- Optional, use a comma-separated string or JSON array for flexibility
        browser TEXT,
        os TEXT,
        location TEXT,
        ipaddr TEXT,
        submit_hash TEXT UNIQUE,  -- To prevent duplicate submissions
        FOREIGN KEY(event_code) REFERENCES events(event_code),  -- Ensure feedback relates to a valid event
        FOREIGN KEY(tenant_org_id) REFERENCES tenants(org_id)  -- Ensure feedback relates to a valid tenant
      )`,
      (err) => {
        if (err) {
          console.error("Error creating feedback table", err.message);
        } else {
          console.log("Feedback table created or already exists.");

          // Add indexes for feedback table
          tenantsDb.run(
            `CREATE INDEX IF NOT EXISTS idx_feedback_event_code ON feedback(event_code);`
          );
          tenantsDb.run(
            `CREATE INDEX IF NOT EXISTS idx_feedback_tenant_org_id ON feedback(tenant_org_id);`
          );
          tenantsDb.run(
            `CREATE INDEX IF NOT EXISTS idx_feedback_event_tenant ON feedback(tenant_org_id, event_code);`
          );
          tenantsDb.run(
            `CREATE INDEX IF NOT EXISTS idx_feedback_submit_hash ON feedback(submit_hash);`
          );
        }
      }
    );
  }
});

module.exports = tenantsDb;
