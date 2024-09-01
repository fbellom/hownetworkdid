const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const logger = require("./utils/logger");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

//Import Routes
const feedbackRoutes = require("./routes/feedback");
const tenantRoutes = require("./routes/tenantManager");
const eventRoutes = require("./routes/eventManager");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger);
app.use(cookieParser());

//Use Routers Endpoints
app.use("/submit-feedback", feedbackRoutes);
app.use("/tenants", tenantRoutes);
app.use("/events", eventRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
