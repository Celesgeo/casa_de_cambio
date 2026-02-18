// Centralized error handling middleware
// Ensures consistent JSON error responses for web and mobile clients.

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (err.name === 'ValidationError') statusCode = 400;
  res.status(statusCode);
  const origin = req.headers.origin;
  if (origin && !res.getHeader('Access-Control-Allow-Origin') && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  const message = err.message || 'Server error';
  res.json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = { notFound, errorHandler };

