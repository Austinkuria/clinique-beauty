/**
 * Helper functions for working with Clerk API
 */

/**
 * Detects which version of the Clerk API we're using
 * and returns the appropriate metadata update method
 * 
 * @param {Object} user - Clerk user object
 * @returns {Function} - The appropriate metadata update function
 */
export const getMetadataUpdateMethod = (user) => {
  // Check if the user has the newer API method
  if (typeof user.setUnsafeMetadata === 'function') {
    console.log("Using newer Clerk API: setUnsafeMetadata");
    return async (metadata) => {
      await user.setUnsafeMetadata(metadata);
    };
  }
  
  // Check if the user has the setPublicMetadata method
  if (typeof user.setPublicMetadata === 'function') {
    console.log("Using Clerk API: setPublicMetadata");
    return async (metadata) => {
      await user.setPublicMetadata(metadata);
    };
  }
  
  // Fall back to the update method with unsafeMetadata
  console.log("Using Clerk API: update with unsafeMetadata");
  return async (metadata) => {
    await user.update({
      unsafeMetadata: metadata
    });
  };
};

/**
 * Updates a user's role safely across different Clerk versions
 * 
 * @param {Object} user - Clerk user object
 * @param {string} role - Role to set (e.g., 'admin')
 * @returns {Promise<boolean>} - Whether the update was successful
 */
export const setUserRole = async (user, role) => {
  if (!user) return false;
  
  try {
    // Try these approaches in order
    const approaches = [
      // 1. Update using unsafeMetadata
      async () => {
        await user.update({
          unsafeMetadata: { role }
        });
        return true;
      },
      // 2. Update using direct organization metadata
      async () => {
        if (user.organizations && user.organizations.length > 0) {
          const org = user.organizations[0];
          await org.update({
            publicMetadata: { memberRole: role }
          });
          return true;
        }
        return false;
      },
      // 3. Update using publicMetadata (in case they fix this API)
      async () => {
        await user.update({
          publicMetadata: { role }
        });
        return true;
      }
    ];
    
    // Try each approach in sequence
    for (const approach of approaches) {
      try {
        const result = await approach();
        if (result) return true;
      } catch (e) {
        console.log("Approach failed, trying next one:", e.message);
      }
    }
    
    // If we got here, all approaches failed
    throw new Error("All metadata update approaches failed");
    
  } catch (error) {
    console.error("Failed to set user role:", error);
    return false;
  }
};

export default {
  getMetadataUpdateMethod,
  setUserRole
};
