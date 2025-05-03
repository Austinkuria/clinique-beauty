import { toast } from 'react-hot-toast';
import { api } from '../api/apiClient';

/**
 * Synchronizes a user's Clerk profile data with our backend database
 * 
 * @param {Object} user - The Clerk user object
 * @param {Function} getToken - Function to get the Clerk session token
 * @returns {Promise<Object>} - Server response with user data
 */
export async function syncUserToSupabase(user, getToken) {
    try {
        // Wait for the token to be available
        await getToken();
        
        if (!user) {
            console.error("Cannot sync user: No user provided");
            return { success: false, message: "No user provided" };
        }

        // Map Clerk user data to our user model
        const userData = {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            avatarUrl: user.imageUrl
        };

        console.log("Syncing user data:", userData);
        
        // Call the API to sync with our database
        const response = await api.syncUser(userData);
        
        // Even if sync fails, we'll continue with the app
        if (!response || !response.success) {
            console.warn("User sync returned an error but app will continue:", response);
        }
        
        return response;
    } catch (error) {
        console.error("Error syncing user:", error);
        // Return partial success instead of throwing - this prevents app from breaking
        return { 
            success: false, 
            message: "User sync failed, but app will continue to function",
            error: error.message
        };
    }
}

/**
 * Updates a user's role to admin in both Clerk and Supabase
 */
export const setUserAsAdmin = async (user, getToken) => {
  if (!user) return false;
  
  try {
    // Get token for API requests
    const token = await getToken();
    
    // First, verify the admin setup code
    const verifyResponse = await fetch('/api/users/verify-admin-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        code: document.getElementById('admin-setup-code').value // Get value from input field
      })
    });
    
    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      throw new Error(errorData.message || 'Invalid admin setup code');
    }
    
    // Now update user role in Clerk metadata
    await user.update({
      publicMetadata: {
        ...user.publicMetadata,
        role: 'admin'
      }
    });
    
    // Then update role in Supabase via API
    const updateResponse = await fetch('/api/users/set-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        clerkId: user.id
      })
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update admin role in database');
    }
    
    toast.success('Admin role granted successfully');
    return true;
    
  } catch (error) {
    console.error("Error in setUserAsAdmin:", error);
    toast.error(error.message || 'Failed to set admin role');
    return false;
  }
};
