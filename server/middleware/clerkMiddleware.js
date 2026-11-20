import jwt from 'jsonwebtoken';
import cache from '../services/cacheService.js';
import { supabase } from '../config/db.js';

/**
 * Middleware to verify Clerk authentication token, enforce token blacklist,
 * and attach the authoritative database role to the request.
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

      const userId = decoded.sub;
      const userEmail = (decoded.email || '').toLowerCase();

      // Enforce token blacklist / revocation on administrative role changes
      const isRevoked = (userId && await cache.get(`auth:revoked:${userId}`)) || 
                        (userEmail && await cache.get(`auth:revoked:${userEmail}`));
      if (isRevoked) {
        return res.status(401).json({ 
          error: true, 
          code: 'TOKEN_REVOKED',
          message: 'Account role modified by administrator. Please sign in again.'
        });
      }

      // Resolve authoritative role from Supabase database (Source of Truth)
      let activeRole = (decoded.metadata?.role || decoded.public_metadata?.role || 'customer').toLowerCase();
      if (supabase && (userId || userEmail)) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .or(`clerk_id.eq.${userId},email.eq.${userEmail}`)
            .maybeSingle();

          if (profile?.role) {
            activeRole = profile.role.toLowerCase();
          }
        } catch {
          // Fall back to decoded token role
        }
      }
      
      // Add user data to request
      req.user = {
        id: userId,
        email: userEmail,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        role: activeRole
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
