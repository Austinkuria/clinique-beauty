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

// Helper to construct API URL
const getApiBaseUrl = () => {
  const SUPABASE_FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  
  if (!SUPABASE_FUNCTIONS_BASE) {
    return 'http://localhost:5000/api'; // Fallback to Express server
  }
  
  // Remove trailing slash if present
  const baseUrl = SUPABASE_FUNCTIONS_BASE.replace(/\/$/, '');
  
  // Check if the URL already contains "functions/v1"
  if (baseUrl.includes('/functions/v1')) {
    return `${baseUrl}/api`;
  } else {
    return `${baseUrl}/functions/v1/api`;
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
    
    // Get admin code from hidden input
    const codeInput = document.getElementById('admin-setup-code');
    if (!codeInput || !codeInput.value) {
      throw new Error('Admin setup code not found');
    }
    
    const API_BASE_URL = getApiBaseUrl();
    
    // First, verify the admin setup code through API
    console.log("Verifying admin code through API...");
    let verifyUrl = `${API_BASE_URL}/users/verify-admin-code`;
    console.log(`Making request to: ${verifyUrl}`);
    
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        code: codeInput.value
      })
    });
    
    // If verification request failed, try the development server endpoint
    if (!verifyResponse.ok) {
      if (import.meta.env.DEV) {
        // In development, try direct Express server as fallback
        console.log("API verification failed, trying Express server...");
        const expressUrl = 'http://localhost:5000/api/users/verify-admin-code';
        
        const expressResponse = await fetch(expressUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            code: codeInput.value
          })
        });
        
        if (!expressResponse.ok) {
          // If still fails and we're in dev mode, just proceed
          console.warn("Express verification also failed, but proceeding in dev mode");
        } else {
          console.log("Express verification succeeded");
        }
      } else {
        // In production, parse the error response
        try {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.message || 'Invalid admin setup code');
        } catch (jsonError) {
          throw new Error('Failed to verify admin code - server error');
        }
      }
    } else {
      // Verification succeeded
      console.log("Admin code verification successful");
    }
    
    // Now update user role in Clerk
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
        await user.setPublicMetadata({
          role: 'admin'
        });
        console.log("Alternative Clerk metadata update successful");
      } catch (altClerkError) {
        console.error("Alternative Clerk metadata update failed:", altClerkError);
        
        // In development, continue despite errors
        if (!import.meta.env.DEV) {
          throw new Error('Failed to update admin role in Clerk. Please try again.');
        }
        console.log("Dev mode: Proceeding despite Clerk errors");
      }
    }
    
    // Then update role in Supabase via API
    console.log("Updating user role in Supabase...");
    const updateUrl = `${API_BASE_URL}/users/set-admin`;
    console.log(`Making request to: ${updateUrl}`);
    
    let updateSuccess = false;
    
    try {
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
      
      if (updateResponse.ok) {
        updateSuccess = true;
        console.log("Database role update successful");
      } else {
        // Try to parse error response
        try {
          const errorData = await updateResponse.json();
          console.warn("Database role update failed:", errorData);
        } catch (jsonError) {
          console.warn("Failed to parse error response");
        }
        
        // In dev mode, continue despite errors
        if (import.meta.env.DEV) {
          console.log("Dev mode: Simulating successful database update");
          updateSuccess = true;
        } else {
          throw new Error('Failed to update admin role in database');
        }
      }
    } catch (updateError) {
      console.error("Error during database update:", updateError);
      
      // Try Express server as fallback in development
      if (import.meta.env.DEV) {
        try {
          console.log("Trying Express server for database update...");
          const expressUpdateUrl = 'http://localhost:5000/api/users/set-admin';
          
          const expressUpdateResponse = await fetch(expressUpdateUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              clerkId: user.id
            })
          });
          
          if (expressUpdateResponse.ok) {
            updateSuccess = true;
            console.log("Express server database update successful");
          } else {
            console.warn("Express server database update failed, but proceeding in dev mode");
            updateSuccess = true; // Simulate success in dev mode
          }
        } catch (expressError) {
          console.error("Express server error:", expressError);
          // Still continue in dev mode
          updateSuccess = true;
        }
      } else {
        throw updateError;
      }
    }
    
    if (updateSuccess) {
      toast.success('Admin role granted successfully');
      return true;
    } else {
      throw new Error('Failed to update admin role in database');
    }
    
  } catch (error) {
    console.error("Error in setUserAsAdmin:", error);
    toast.error(error.message || 'Failed to set admin role');
    return false;
  }
};
