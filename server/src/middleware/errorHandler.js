const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  } else {
    console.error(err.message);
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || "SERVER_ERROR";
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    code,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
