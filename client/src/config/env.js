/**
 * Environment configuration helper for the client application
 */

// API URL configuration
export const getApiUrl = () => {
  // In production (Vercel deployment), ALWAYS use Supabase
  if (import.meta.env.PROD) {
    // Priority: VITE_API_URL > construct from VITE_SUPABASE_FUNCTIONS_URL > construct from VITE_SUPABASE_URL > hardcoded fallback
    return import.meta.env.VITE_API_URL || 
           (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ? 
            `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/api` : 
            (import.meta.env.VITE_SUPABASE_URL ? 
             `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api` :
             'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api')); // Final hardcoded fallback
  }
  
  // In development, prefer Supabase if configured, otherwise localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// M-Pesa configuration
export const mpesaConfig = {
  // Is M-Pesa enabled?
  enabled: import.meta.env.VITE_MPESA_ENABLED !== 'false',
  
  // Get API URL for M-Pesa requests
  getApiUrl: () => {
    // In production, ALWAYS use Supabase functions
    if (import.meta.env.PROD) {
      // Use the same API base URL + mpesa path
      const baseApiUrl = import.meta.env.VITE_API_URL || 
                         (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ? 
                          `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/api` : 
                          (import.meta.env.VITE_SUPABASE_URL ?
                           `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api` :
                           'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api')); // Final hardcoded fallback
      return `${baseApiUrl}/mpesa`;
    }
    
    // In development, prefer Supabase if configured, otherwise localhost
    const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
