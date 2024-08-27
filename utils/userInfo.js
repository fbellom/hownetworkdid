const useragent = require("useragent");
const geoip = require("geoip-lite");

function captureUserInfo(req) {
  const userAgent = useragent.parse(req.headers["user-agent"]);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const browser = userAgent.family;
  const os = userAgent.os.family;
  const location = geoip.lookup(ip);

  return {
    browser,
    os,
    location: location ? `${location.city}, ${location.country}` : "Unknown",
    ip,
  };
}

module.exports = { captureUserInfo };
