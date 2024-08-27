const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");
const logger = require("./utils/logger");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger);

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
            keywords TEXT)`,
      (err) => {
        if (err) {
          console.error("Error creating table " + err.message);
        }
      }
    );
  }
});

// Function to tokenize reason text
function tokenizeReason(reason) {
  const stopWords = new Set([
    "the",
    "and",
    "is",
    "to",
    "in",
    "of",
    "that",
    "it",
    "on",
    "for",
    "with",
    "as",
    "by",
    "this",
    "at",
    "but",
    "from",
    "they",
    "an",
    "which",
    "or",
    "we",
    "be",
    "was",
    "not",
    "are",
    "have",
    "had",
    "a",
    "if",
  ]);

  // Convert the reason to lowercase and split on non-word characters
  const words = reason.toLowerCase().split(/\W+/);

  // Use a Set to collect unique words that are not stop words and have length > 2
  const uniqueWords = new Set(
    words.filter((word) => word.length > 2 && !stopWords.has(word))
  );

  // Convert the Set back to an array and join with commas
  return Array.from(uniqueWords).join(", ");
}

// Endpoint to handle feedback submission
app.post("/submit-feedback", (req, res) => {
  const { event, response, reason } = req.body;
  const date = new Date().toISOString().split("T")[0];
  const time = new Date().toISOString().split("T")[1].split(".")[0];
  const keywords = reason ? tokenizeReason(reason) : "";

  db.run(
    `INSERT INTO feedback (event,response, date, time, reason, keywords) VALUES (?,?, ?, ?, ?, ?)`,
    [event, response, date, time, reason || "", keywords],
    function (err) {
      if (err) {
        return console.log(err.message);
      }
      res.send({ message: "Feedback submitted successfully!" });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
