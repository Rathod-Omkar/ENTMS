
module.exports = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Employee ID or email already exists",
    });
  }

  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error",
  });
};
