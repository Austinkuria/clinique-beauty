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

export default router;
