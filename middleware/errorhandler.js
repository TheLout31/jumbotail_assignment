/**
 * Global error handler middleware.
 * Catches all errors thrown from controllers/services and
 * returns a consistent JSON error response.
 */
const errorHandler = (err, req, res, _next) => {
  // Log in development
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}\n`, err);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details,
    });
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      message: `Invalid product ID format: "${err.value}"`,
    });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
    });
  }

  // Default: internal server error
  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;