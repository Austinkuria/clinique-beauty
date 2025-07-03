/**
 * Mock admin API endpoints for development mode
 * This allows the admin setup to work without a backend in development
 */

// Valid admin codes
const VALID_ADMIN_CODES = [
  'admin123',
  'clinique-beauty-admin-2025',
  'clinique-admin-2025'
];

/**
 * Verify an admin code
 * @param {string} code - The admin code to verify
 * @returns {boolean} - Whether the code is valid
 */
export const verifyAdminCode = (code) => {
  if (!code) return false;
  return VALID_ADMIN_CODES.includes(code);
};

/**
 * Mock function to update a user role to admin
 * @param {string} userId - The user ID to update
 * @returns {Object} - A success response
 */
export const setUserAsAdmin = (userId) => {
  console.log(`DEV MODE: Setting user ${userId} as admin`);
  
  // Return a simulated success response
  return {
    success: true,
    user: {
      id: userId,
      role: 'admin',
      updated: new Date().toISOString()
    },
    message: 'Admin role granted successfully'
  };
};

// Export the mock API
export const mockAdminApi = {
  verifyAdminCode,
  setUserAsAdmin
};

export default mockAdminApi;
