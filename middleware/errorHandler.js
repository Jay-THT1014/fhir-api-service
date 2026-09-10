const logger = require("../utils/logger");

const errorHandler = (err, req, res, _next) => {
  logger.error(err.message);

  const NODE_ENV = process.env.NODE_ENV || "development";

  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: NODE_ENV === "development" || NODE_ENV === "test" ? err.message : "Internal Server Error",
  });
};

module.exports = errorHandler;
