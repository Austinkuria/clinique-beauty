import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

export const authMiddleware = asyncHandler(async (req, res, next) => 
    { 
        const token = req.headers.authorization?.split(' ')[1]; 
        if (!token) 
            { res.status(401);
             throw new Error('No token provided'); 
            }
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            req.user = await User.findById(decoded.id).select('-password'); 
            if (!req.user) { res.status(401); 
                throw new Error('User not found'); 
            } 
            next(); 
        });
