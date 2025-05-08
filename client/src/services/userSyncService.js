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
    
    const code = codeInput.value;
    let adminCodeVerified = false;
    
    // First, try verifying the admin code through API
    try {
      console.log("Verifying admin code through API...");
      // Determine the correct base URL for the API call
      const baseUrl = import.meta.env.DEV ? 
        (import.meta.env.VITE_API_URL || 'http://localhost:3001') : '';
      
      const verifyUrl = `${baseUrl}/api/users/verify-admin-code`;
      console.log(`Trying to verify admin code at: ${verifyUrl}`);
      
      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      
      if (verifyResponse.ok) {
        console.log("Admin code verified successfully via API");
        adminCodeVerified = true;
      } else {
        const errorData = await verifyResponse.json();
        console.warn("API verification failed:", errorData);
      }
    } catch (verifyError) {
      console.warn("Error during API verification:", verifyError);
      // Continue with local verification
    }
    
    // If API verification failed, do local verification in development
    if (!adminCodeVerified && import.meta.env.DEV) {
      console.log("Falling back to local admin code verification");
      // Check against known codes in dev mode
      const validDevCodes = [
        'admin123', 
        'clinique-beauty-admin-2023', 
        'clinique-admin-2023'
      ];
      
      if (validDevCodes.includes(code)) {
        console.log("Admin code verified locally");
        adminCodeVerified = true;
      } else {
        throw new Error('Invalid admin setup code');
      }
    } else if (!adminCodeVerified) {
      // In production, if API verification failed, we should fail
      throw new Error('Failed to verify admin code');
    }
    
    // Now update user role in Clerk
    console.log("Updating Clerk user metadata with admin role...");
    
    try {
      // Try the standard method first
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
        await user.setPublicMetadata({
          role: 'admin'
        });
        console.log("Alternative Clerk metadata update successful");
      } catch (altClerkError) {
        console.error("Alternative Clerk metadata update failed:", altClerkError);
        // In dev mode, continue anyway
        if (!import.meta.env.DEV) {
          throw new Error('Failed to update Clerk metadata');
        }
      }
    }
    
    // Then update role in Supabase via direct API or server
    try {
      console.log("Updating user role in Supabase...");
      // Determine correct base URL
      const baseUrl = import.meta.env.DEV ? 
        (import.meta.env.VITE_API_URL || 'http://localhost:3001') : '';
      
      const updateUrl = `${baseUrl}/api/users/set-admin`;
      console.log(`Calling: ${updateUrl}`);
      
      const updateResponse = await fetch(updateUrl, {
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
        
        // Only throw in production
        if (!import.meta.env.DEV) {
          throw new Error(errorData.message || 'Failed to update admin role in database');
        }
      } else {
        console.log("Database role updated successfully");
      }
    } catch (dbError) {
      console.warn("Error updating database role:", dbError);
      // Only throw in production
      if (!import.meta.env.DEV) {
        throw dbError;
      }
    }
    
    toast.success('Admin role granted successfully');
    return true;
    
  } catch (error) {
    console.error("Error in setUserAsAdmin:", error);
    toast.error(error.message || 'Failed to set admin role');
    return false;
  }
};
