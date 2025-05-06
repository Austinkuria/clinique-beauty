/**
 * Enhanced CORS middleware with better support for production environments
 */

// Get allowed origins from environment or use defaults
const getAllowedOrigins = () => {
  const defaultOrigins = [
    'http://localhost:5173',
    'https://localhost:5173',
    'https://clinique-beauty.vercel.app'
  ];
  
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',');
  }
  
  return defaultOrigins;
};

export const corsMiddleware = (req, res, next) => {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin;
  
  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
      // In production, use the first allowed origin as default
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
  }
  
  // Other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Continue to the next middleware
  next();
};

export default corsMiddleware;
