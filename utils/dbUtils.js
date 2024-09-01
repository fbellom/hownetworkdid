function checkForDuplicateSubmission(db, ip, token) {
  return new Promise((resolve, reject) => {
    const userIdentifier = `${ip}-${token}`;
    db.get(
      `SELECT * FROM feedback WHERE submit_hash = ? AND ipaddr = ?`,
      [token, ip],
      (err, row) => {
        if (err) {
          console.error("Database error:", err);
          reject(err);
        } else if (row) {
          console.log(
            `Duplicate submission detected for user: ${userIdentifier}`
          );
          resolve(true); // Duplicate found
        } else {
          resolve(false); // No duplicate
        }
      }
    );
  });
}

module.exports = { checkForDuplicateSubmission };
