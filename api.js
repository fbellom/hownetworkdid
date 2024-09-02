const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const logger = require("./utils/logger");
const cookieParser = require("cookie-parser");

// Auth Middleware
const { authenticateJWT, authorizeRoles } = require("./utils/authUtils");

const app = express();
const PORT = 3000;

// Initialize .env file
require("dotenv").config();

// Initialize Databases
require("./db/initTenantsDB");

// Check for Root User Utils
const checkRootUser = require("./utils/checkRootUser");

//Import Routes
const submitRoutes = require("./routes/submitFeedback");
const tenantRoutes = require("./routes/tenantManager");
const eventRoutes = require("./routes/eventManager");
const authRoutes = require("./routes/authManager");
const feedbackRoutes = require("./routes/feedbackManager");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger);
app.use(cookieParser());

//Use Routers Endpoints
app.use("/users", authRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/submit-feedback", submitRoutes);
app.use(
  "/tenants",
  authenticateJWT,
  authorizeRoles("rootadm", "owner", "admin"),
  tenantRoutes
);
app.use(
  "/events",
  authenticateJWT,
  authorizeRoles("rootadm", "owner", "user", "admin"),
  eventRoutes
);

//Validate Root User befor start the server
checkRootUser((err) => {
  if (err) {
    console.error("Failed to verify root user");
    // process.exit(1);
  }
  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
