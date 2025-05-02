import express from 'express';
import { clerkMiddleware } from '../middleware/clerkMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { supabase } from '../config/db.js';

const router = express.Router();

// Sync user data between Clerk and Supabase
router.post('/sync', clerkMiddleware, asyncHandler(async (req, res) => {
    // clerkMiddleware already creates/updates user records in user_profiles
    console.log('User synced successfully:', req.user);
    res.json({ success: true, user: req.user });
}));

// Verify admin setup code
router.post('/verify-admin-code', clerkMiddleware, asyncHandler(async (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        res.status(400);
        throw new Error('Setup code is required');
    }
    
    // Get the admin setup code from the database
    const { data: settingData, error: settingError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'admin_setup_code')
        .single();
        
    if (settingError) {
        console.error('Error fetching admin setup code:', settingError);
        res.status(500);
        throw new Error('Failed to verify setup code');
    }
    
    if (!settingData || code !== settingData.value) {
        res.status(401);
        throw new Error('Invalid setup code');
    }
    
    res.json({ success: true });
}));

// Set user as admin
router.post('/set-admin', clerkMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { clerkId } = req.body;
    
    if (!clerkId) {
        res.status(400);
        throw new Error('Clerk ID is required');
    }
    
    // Update user role in database
    const { data, error } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('clerk_id', clerkId)
        .select()
        .single();
        
    if (error) {
        console.error('Failed to update user role:', error);
        res.status(500);
        throw new Error(`Failed to update user role: ${error.message}`);
    }
    
    res.json({ success: true, user: data });
}));

// Get all users (admin only)
router.get('/', clerkMiddleware, asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Access denied: Admin privileges required');
    }
    
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*');
        
    if (error) {
        res.status(500);
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
    
    res.json(data);
}));

export default router;
