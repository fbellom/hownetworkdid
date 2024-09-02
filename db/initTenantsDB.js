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
  }
});

module.exports = tenantsDb;
