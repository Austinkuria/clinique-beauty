/**
 * Environment configuration helper for the client application
 */

// API URL configuration
export const getApiUrl = () => {
  // In production (Vercel deployment)
  if (import.meta.env.PROD) {
    // Check if we have VITE_API_URL, otherwise use the Vercel deployment URL
    return import.meta.env.VITE_API_URL || 
           (window.location.origin + '/api');
  }
  
  // In development, use localhost
  return 'http://localhost:5000/api';
};

// M-Pesa configuration
export const mpesaConfig = {
  // Is M-Pesa enabled?
  enabled: import.meta.env.VITE_MPESA_ENABLED !== 'false',
  
  // Get API URL for M-Pesa requests
  getApiUrl: () => {
    // In production, prefer a direct, proxied path from the current domain
    if (import.meta.env.PROD) {
      return window.location.origin + '/api/mpesa';
    }
    
    // In development, use localhost
    return 'http://localhost:5000/api/mpesa';
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
