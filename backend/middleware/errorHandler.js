const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message || 'Upload error';
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    const first = Object.values(err.errors)[0];
    message = first ? first.message : message;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid identifier format';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    message = `Duplicate value for ${field}`;
  }

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && statusCode === 500 && { stack: err.stack }),
    },
  });
}

module.exports = { errorHandler, notFoundHandler };
