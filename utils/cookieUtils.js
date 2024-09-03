function setFeedbackCookies(res, { token, eventCode }) {
  const cookieOptions = {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.cookie("feedbackToken", token, cookieOptions);
  res.cookie("feedbackPOD", eventCode, cookieOptions);
  res.cookie("feedbackSubmitted", "true", cookieOptions);
}

module.exports = { setFeedbackCookies };
