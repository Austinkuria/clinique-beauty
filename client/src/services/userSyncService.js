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
        
        // Log sync result
        if (response.success) {
            console.log("User sync successful:", response.data?.id || "unknown");
        } else {
            console.warn("User sync returned an error but app will continue:", response);
        }
        
        return response;
    } catch (error) {
        console.error("Error syncing user:", error);
        
        // In development, always return a success response to prevent blocking the app
        if (import.meta.env.DEV) {
            return { 
                success: true, 
                data: {
                    id: "simulated-id", 
                    name: user?.firstName || "User",
                    simulated: true
                }
            };
        }
        
        // Return partial success instead of throwing
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
    
    // Get admin code from hidden input
    const codeInput = document.getElementById('admin-setup-code');
    if (!codeInput || !codeInput.value) {
      throw new Error('Admin setup code not found');
    }
    
    // First, verify the admin setup code through API
    console.log("Verifying admin code through API...");
    const verifyResponse = await fetch('/api/users/verify-admin-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        code: codeInput.value
      })
    });
    
    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      throw new Error(errorData.message || 'Invalid admin setup code');
    }
    
    // Now update user role in Clerk
    // Use the proper Clerk API format to update metadata
    try {
      console.log("Updating Clerk user metadata with admin role...");
      // This is the correct syntax for updating Clerk user metadata
      await user.update({
        publicMetadata: {
          role: 'admin'
        }
      });
      console.log("Clerk metadata updated successfully");
    } catch (clerkError) {
      console.error("Error updating Clerk metadata:", clerkError);
      
      // Try alternative method for Clerk v5+
      try {
        console.log("Trying alternative Clerk metadata update method...");
        // Some Clerk versions use different update patterns
        await user.setPublicMetadata({
          role: 'admin'
        });
        console.log("Alternative Clerk metadata update successful");
      } catch (altClerkError) {
        console.error("Alternative Clerk metadata update failed:", altClerkError);
        // Continue with Supabase update even if Clerk update fails
        console.log("Proceeding with Supabase update despite Clerk errors");
      }
    }
    
    // Then update role in Supabase via API
    console.log("Updating user role in Supabase...");
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
      const errorData = await updateResponse.json();
      console.warn("Database role update response:", errorData);
      throw new Error(errorData.message || 'Failed to update admin role in database');
    }
    
    toast.success('Admin role granted successfully');
    return true;
    
  } catch (error) {
    console.error("Error in setUserAsAdmin:", error);
    toast.error(error.message || 'Failed to set admin role');
    return false;
  }
};
