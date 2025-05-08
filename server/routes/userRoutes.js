import express from 'express';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ 
        error: true, 
        message: 'User profile not found' 
      });
    }
    
    res.json(data);
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
    const clerkId = req.user.id;
    const userData = req.body;
    
    if (!userData || !userData.email) {
      return res.status(400).json({ 
        error: true, 
        message: 'Email is required' 
      });
    }
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          avatar_url: userData.avatarUrl,
          updated_at: new Date()
        })
        .eq('clerk_id', clerkId)
        .select();
      
      if (error) {
        throw error;
      }
      
      return res.json({
        success: true,
        user: data[0],
        action: 'updated'
      });
    }
    
    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        clerk_id: clerkId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        avatar_url: userData.avatarUrl
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      success: true,
      user: data[0],
      action: 'created'
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to sync user data' 
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
    // First try user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('clerk_id', clerkId)
      .select();
    
    // If no matching record in user_profiles, try users table
    if (profileError || !profileData || profileData.length === 0) {
      console.log('No record found in user_profiles, trying users table');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('clerk_id', clerkId)
        .select();
      
      if (userError) {
        console.error('Error updating user role in users table:', userError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update user role in database'
        });
      }
      
      if (!userData || userData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      return res.json({
        success: true,
        message: 'Admin role granted successfully',
        user: userData[0]
      });
    }
    
    return res.json({
      success: true,
      message: 'Admin role granted successfully',
      user: profileData[0]
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
