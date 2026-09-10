const logger = require("../utils/logger");

const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

module.exports = notFoundHandler;
