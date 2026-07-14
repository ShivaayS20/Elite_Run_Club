const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: [],
  });
};

module.exports = errorHandler;