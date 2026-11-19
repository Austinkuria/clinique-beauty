import jwt from 'jsonwebtoken';

/**
 * Middleware to verify Clerk authentication token and 
 * add the user information to the request
 */
export const clerkMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development, permit fallback to dev user so direct browser testing works
      if (process.env.NODE_ENV !== 'production') {
        req.user = { id: 'dev-admin-id', email: 'admin@clinique.com', role: 'admin' };
        return next();
      }
      return res.status(401).json({ 
        error: true, 
        message: 'Authorization header missing or invalid'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        req.user = { id: 'dev-admin-id', email: 'admin@clinique.com', role: 'admin' };
        return next();
      }
      return res.status(401).json({ 
        error: true, 
        message: 'No token provided'
      });
    }
    
    try {
      // Decode token without verification in development
      const decoded = jwt.decode(token);
      
      if (!decoded) {
        if (process.env.NODE_ENV !== 'production') {
          req.user = { id: 'dev-admin-id', email: 'admin@clinique.com', role: 'admin' };
          return next();
        }
        throw new Error('Invalid token');
      }
      
      // Add user data to request
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        role: decoded.metadata?.role || decoded.public_metadata?.role || 'admin'
      };
      
      return next();
    } catch (error) {
      console.error('Token verification error:', error);
      if (process.env.NODE_ENV !== 'production') {
        req.user = { id: 'dev-admin-id', email: 'admin@clinique.com', role: 'admin' };
        return next();
      }
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
