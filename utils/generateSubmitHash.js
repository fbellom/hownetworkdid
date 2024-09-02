// Helper function to generate a unique hash for feedback submissions
function generateSubmitHash(event_code, tenantOrgId, response, owner) {
  const data = `${event_code}-${tenantOrgId}-${response}-${owner}`;
  // You can use any hash function here, like SHA256 or MD5 (use a proper library like crypto for hashing)
  return require("crypto").createHash("sha256").update(data).digest("hex");
}

module.exports = generateSubmitHash;
