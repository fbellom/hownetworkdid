const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const logger = require("./utils/logger");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

//Import Routes
const feedbackRoutes = require("./routes/feedback");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger);
app.use(cookieParser());

//Use Routers Endpoints
app.use("/submit-feedback", feedbackRoutes);

//Redirect to 404 custom Page
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/404.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
