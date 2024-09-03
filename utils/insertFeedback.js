// Insert feedback New Format into the database
function insertNewFeedback(db, feedbackData) {
  return new Promise((resolve, reject) => {
    // console.log(feedbackData);
    const {
      eventCode,
      orgId,
      response,
      rating,
      reason,
      keywords,
      browser,
      os,
      location,
      ip,
      token,
    } = feedbackData;

    db.run(
      `INSERT INTO feedback (event_code, tenant_org_id, response, rating, reason, keywords, browser, os, location, ipaddr, submit_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventCode,
        orgId,
        response,
        rating,
        reason || "",
        keywords,
        browser,
        os,
        location,
        ip,
        token,
      ],
      (err) => {
        if (err) return reject(err);
        console.log("Feedback Sucessful submit!");
        resolve();
      }
    );
  });
}

// Insert feedback into the database
function insertFeedback(db, feedbackData) {
  return new Promise((resolve, reject) => {
    const {
      eventCode,
      orgId,
      response,
      rating,
      date,
      time,
      reason,
      keywords,
      browser,
      os,
      location,
      ip,
      token,
    } = feedbackData;

    db.run(
      `INSERT INTO feedback (event_code, tenant_org_id,response, rating, date, time, reason, keywords, browser, os, location, ipaddr, submit_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventCode,
        orgId,
        response,
        rating,
        date,
        time,
        reason || "",
        keywords,
        browser,
        os,
        location,
        ip,
        token,
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = { insertNewFeedback, insertFeedback };
