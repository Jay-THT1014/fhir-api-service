const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().reduce((acc, err) => {
      // Only capture the first error message for each field
      if (err.path && !acc[err.path]) {
        acc[err.path] = err.msg;
      }
      return acc;
    }, {});

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }
  next();
};

module.exports = { validate };
