import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import { supabase } from '../config/db.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401);
        throw new Error('No token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from Supabase
        const { data, error } = await supabase
            .from('users')
            .select('id, email, name, role')
            .eq('id', decoded.id)
            .single();

        if (error || !data) {
            res.status(401);
            throw new Error('User not found');
        }

        req.user = data;
        next();
    } catch (error) {
        res.status(401);
        throw new Error('Invalid token');
    }
});
