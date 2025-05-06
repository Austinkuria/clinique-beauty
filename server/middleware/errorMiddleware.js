/**
 * Central error handling middleware
 */
export const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Determine if this is a known error type
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      message: err.message,
      details: err.details || 'Validation failed'
    });
  }
  
  if (err.name === 'AuthError' || err.message.includes('authentication')) {
    return res.status(401).json({
      error: true,
      message: 'Authentication failed',
      details: err.message
    });
  }
  
  // Default to 500 internal server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  res.status(statusCode).json({
    error: true,
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};
