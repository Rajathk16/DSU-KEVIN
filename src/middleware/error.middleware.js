const mongoose = require("mongoose");

const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  /*
   * Mongoose validation error
   */
  if (err instanceof mongoose.Error.ValidationError) {
    const details = {};

    for (const field in err.errors) {
      details[field] = err.errors[field].message;
    }

    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details
      }
    });
  }

  /*
   * Invalid MongoDB ObjectId
   */
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      error: {
        message: `Invalid ${err.path}`
      }
    });
  }

  /*
   * MongoDB duplicate key
   */
  if (err.code === 11000) {
    const duplicateFields = Object.keys(
      err.keyPattern || err.keyValue || {}
    );

    const field = duplicateFields[0] || "field";

    return res.status(409).json({
      success: false,
      error: {
        message: `${field} already exists`
      }
    });
  }

  /*
   * Default error
   */
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    error: {
      message:
        statusCode === 500
          ? "Internal server error"
          : err.message || "Request failed"
    }
  });
};

module.exports = {
  notFound,
  errorHandler
};