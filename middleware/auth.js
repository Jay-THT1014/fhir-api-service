const logger = require("../utils/logger");

function apiKeyAuth(req, res, next) {
  const EHR_API_KEY = process.env.EHR_API_KEY;

  // If no API key is configured in env, warn but allow (for dev environments)
  if (!EHR_API_KEY) {
    logger.warn("EHR_API_KEY is not configured in environment. Skipping auth check.");
    return next();
  }

  const providedKey = req.header("X-API-Key");

  if (!providedKey || providedKey !== EHR_API_KEY) {
    logger.warn(`Unauthorized access attempt from IP: ${req.ip}`);
    return res.status(401).json({ error: "Unauthorized: Invalid or missing X-API-Key" });
  }

  next();
}

module.exports = apiKeyAuth;
