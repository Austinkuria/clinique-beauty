/**
 * Environment configuration helper for the client application
 */

// API URL configuration
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
};

// M-Pesa configuration
export const mpesaConfig = {
  // Is M-Pesa enabled?
  enabled: import.meta.env.VITE_MPESA_ENABLED !== 'false',
  
  // Get API URL for M-Pesa requests
  getApiUrl: () => {
    const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
    return `${baseApiUrl}/mpesa`;
  },
  
  // Default test phone number for sandbox
  testPhone: '254708374149',
  
  // For debugging - tells us which environment we're in
  environment: import.meta.env.PROD ? 'production' : 'development'
};

// Export all configuration
export default {
  apiUrl: getApiUrl(),
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  mpesa: mpesaConfig,
  isProduction: import.meta.env.PROD
};
