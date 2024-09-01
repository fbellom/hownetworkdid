function setFeedbackCookies(res, { token, event }) {
  const cookieOptions = {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.cookie("feedbackToken", token, cookieOptions);
  res.cookie("feedbackPOD", event, cookieOptions);
  res.cookie("feedbackSubmitted", "true", cookieOptions);
}

module.exports = { setFeedbackCookies };
