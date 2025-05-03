import asyncHandler from '../utils/asyncHandler.js';
import { supabase } from '../config/db.js';

// Sync user data from Clerk to Supabase
export const syncUser = asyncHandler(async (req, res) => {
    const { clerkId, email, name, avatarUrl } = req.body;
    
    if (!clerkId || !email || !name) {
        res.status(400);
        throw new Error('Missing required user data');
    }
    
    console.log(`Syncing user data for Clerk ID: ${clerkId}`);
    
    try {
        // Check if user already exists
        const { data: existingUser, error: lookupError } = await supabase
            .from('user_profiles')
            .select('id, clerk_id')
            .eq('clerk_id', clerkId)
            .maybeSingle();
        
        if (lookupError) throw lookupError;
        
        let result;
        
        if (existingUser) {
            // Update existing user
            const { data, error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    email,
                    name,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('clerk_id', clerkId)
                .select()
                .single();
                
            if (updateError) throw updateError;
            result = { ...data, updated: true };
            console.log(`Updated existing user: ${result.id}`);
        } else {
            // Create new user
            const { data, error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                    clerk_id: clerkId,
                    email,
                    name,
                    avatar_url: avatarUrl,
                    role: 'customer' // Default role
                })
                .select()
                .single();
                
            if (insertError) throw insertError;
            result = { ...data, created: true };
            console.log(`Created new user: ${result.id}`);
        }
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('User sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync user data',
            error: error.message
        });
    }
});

// Get all users (for admin)
export const getUsers = asyncHandler(async (req, res) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (error) throw error;
    
    res.json(data);
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();
        
    if (error) {
        res.status(404);
        throw new Error('User not found');
    }
    
    res.json(data);
});
