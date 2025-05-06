import jwt from 'jsonwebtoken';

/**
 * Middleware to verify Clerk authentication token and 
 * add the user information to the request
 */
export const clerkMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: true, 
        message: 'Authorization header missing or invalid'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: true, 
        message: 'No token provided'
      });
    }
    
    // For development, we'll just decode the token without verification
    // In production, you should properly verify the token with Clerk's public key
    try {
      // Decode token without verification (only for development)
      const decoded = jwt.decode(token);
      
      if (!decoded) {
        throw new Error('Invalid token');
      }
      
      // Add user data to request
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        // Additional user properties as needed
      };
      
      return next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        error: true, 
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Clerk middleware error:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Authentication system error'
    });
  }
};
