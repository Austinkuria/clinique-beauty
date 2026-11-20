import express from 'express';
import { supabase } from '../config/db.js';
import cache from '../services/cacheService.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    
    // First try user_profiles table (stores Clerk user profiles)
    if (userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_id', userId)
        .maybeSingle();

      if (profile) {
        return res.json(profile);
      }
    }

    // Secondary lookup by email in user_profiles
    if (userEmail) {
      const { data: profileByEmail } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (profileByEmail) {
        return res.json(profileByEmail);
      }
    }
    
    // Fall back to relational users table
    if (userEmail) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (user) {
        return res.json(user);
      }
    }
    
    return res.status(404).json({ 
      error: true, 
      message: 'User profile not found' 
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to fetch user profile' 
    });
  }
});

// Create or update user profile
router.post('/sync', async (req, res) => {
  try {
    const clerkId = req.user?.id || req.body?.clerkId;
    const userData = req.body || {};
    const email = userData.email || req.user?.email;
    const name = userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim() || req.user?.firstName || 'Clinique User';
    const role = (userData.role || req.user?.role || 'customer').toLowerCase();
    const avatarUrl = userData.avatarUrl || req.user?.imageUrl || null;

    if (!email) {
      return res.status(400).json({ 
        error: true, 
        message: 'Email is required for user sync' 
      });
    }

    if (!supabase) {
      return res.json({
        success: true,
        message: 'User sync skipped (Supabase client not available in offline mode)',
        user: { clerk_id: clerkId, email, name, role }
      });
    }

    // 1. Check existing authoritative role in database (database is Source of Truth)
    let profileRole = null;
    let userRole = null;
    if (clerkId) {
      try {
        const { data: p } = await supabase.from('user_profiles').select('role, updated_at').eq('clerk_id', clerkId).maybeSingle();
        if (p?.role) profileRole = p.role.toLowerCase();
      } catch {}
    }
    if (email) {
      if (!profileRole) {
        try {
          const { data: p } = await supabase.from('user_profiles').select('role, updated_at').eq('email', email).maybeSingle();
          if (p?.role) profileRole = p.role.toLowerCase();
        } catch {}
      }
      try {
        const { data: u } = await supabase.from('users').select('role, updated_at').eq('email', email).maybeSingle();
        if (u?.role) userRole = u.role.toLowerCase();
      } catch {}
    }

    // Determine authoritative role across tables
    let effectiveRole = role;
    if (userRole && profileRole) {
      if (userRole === profileRole) {
        effectiveRole = userRole;
      } else {
        // Prefer explicit non-customer role or seller role if updated in users
        effectiveRole = userRole;
      }
    } else {
      effectiveRole = userRole || profileRole || role;
    }

    // 2. Sync to user_profiles table (stores Clerk user profile metadata)
    let savedProfile = null;
    if (clerkId) {
      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('user_profiles')
          .upsert({
            clerk_id: clerkId,
            email: email,
            name: name,
            avatar_url: avatarUrl,
            role: effectiveRole,
            updated_at: new Date().toISOString()
          }, { onConflict: 'clerk_id' })
          .select();

        if (!profileErr && profileData?.[0]) {
          savedProfile = profileData[0];
        }
      } catch (pErr) {
        console.warn('user_profiles sync warning:', pErr.message);
      }
    }

    // Ensure seller entry exists if role is seller
    if (effectiveRole === 'seller' && email) {
      try {
        await supabase.from('sellers').upsert({
          clerk_id: clerkId,
          email: email,
          business_name: name || 'Seller Store',
          contact_name: name || 'Seller',
          status: 'approved'
        }, { onConflict: 'email' });
      } catch (sErr) {
        console.warn('sellers upsert warning:', sErr.message);
      }
    }

    // 3. Sync to relational users table (used for orders and relations; has NO clerk_id column)
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    let savedUser = null;

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          email: email,
          name: name,
          role: effectiveRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select();

      if (error) {
        console.error('Error updating users record:', error);
      } else {
        savedUser = data?.[0] || existingUser;
      }
    } else {
      // Create new user in users table
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: email,
          name: name,
          role: effectiveRole,
          password: 'oauth_managed_clerk'
        })
        .select();

      if (error) {
        console.error('Error inserting users record:', error);
      } else {
        savedUser = data?.[0];
      }
    }

    // Clear any token revocation record in cache now that user has re-authenticated
    if (clerkId) await cache.del(`auth:revoked:${clerkId}`);
    if (email) await cache.del(`auth:revoked:${email.toLowerCase()}`);

    return res.status(200).json({
      success: true,
      user: {
        ...(savedProfile || savedUser || {}),
        clerk_id: clerkId,
        email,
        name,
        role: effectiveRole
      },
      action: existingUser ? 'updated' : 'created'
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ 
      error: true, 
      message: error.message || 'Failed to sync user data' 
    });
  }
});

// Add an endpoint to verify the admin code
router.post('/verify-admin-code', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Admin code is required'
      });
    }
    
    // Get the code from the database
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'admin_setup_code')
      .single();
    
    if (error) {
      console.error('Error retrieving admin code:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify admin code'
      });
    }
    
    // Check if code matches
    if (!settings || code !== settings.value) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin code'
      });
    }
    
    return res.json({
      success: true,
      message: 'Admin code verified successfully'
    });
  } catch (err) {
    console.error('Error verifying admin code:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error when verifying admin code'
    });
  }
});

// Add an endpoint to set a user as admin
router.post('/set-admin', async (req, res) => {
  try {
    const { clerkId } = req.body;
    
    if (!clerkId) {
      return res.status(400).json({
        success: false,
        message: 'Clerk ID is required'
      });
    }
    
    // Update user role in the database
    // 1. Update user_profiles table (keyed by clerk_id)
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .update({ role: 'admin', updated_at: new Date().toISOString() })
      .eq('clerk_id', clerkId)
      .select();
    
    // 2. Also update users table by email if user profile has email
    const targetEmail = profileData?.[0]?.email || req.body?.email;
    if (targetEmail) {
      await supabase
        .from('users')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('email', targetEmail);
    }
    
    return res.json({
      success: true,
      message: 'Admin role granted successfully',
      user: profileData?.[0] || { clerk_id: clerkId, role: 'admin' }
    });
  } catch (err) {
    console.error('Error setting admin role:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error when setting admin role'
    });
  }
});

export default router;
