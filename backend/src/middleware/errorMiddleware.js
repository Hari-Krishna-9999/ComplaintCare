const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (err.name === 'ValidationError') {
    response.message = Object.values(err.errors).map((error) => error.message).join(', ');
  }
  if (err.code === 11000) {
    response.message = 'Duplicate field value entered';
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
