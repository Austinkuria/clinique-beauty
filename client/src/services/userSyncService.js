import { toast } from 'react-hot-toast';
import { useApi } from '../api/apiClient';

/**
 * Syncs a Clerk user to Supabase database
 */
export const syncUserToSupabase = async (user, getToken) => {
  if (!user) return null;
  
  try {
    console.log("Syncing user to Supabase:", user.id);
    
    // Get token for API request
    const token = await getToken();
    
    if (!token) {
      console.error("Failed to get authentication token for user sync");
      throw new Error("Authentication token not available");
    }
    
    // Call the API endpoint that will handle the sync
    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
        avatarUrl: user.imageUrl
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error syncing user: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("User successfully synced to Supabase:", data);
    return data;
    
  } catch (error) {
    console.error("Error in syncUserToSupabase:", error);
    throw error; // Re-throw to allow the caller to handle it
  }
};

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
