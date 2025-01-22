// src/middlewares/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = err.statusCode || 500; // Default to 500 if no status code is set
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: {
      message,
    },
  });
}

module.exports = errorHandler;
