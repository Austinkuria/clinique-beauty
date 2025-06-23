// Test API URL configuration
console.log('=== API Configuration Test ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_FUNCTIONS_URL:', import.meta.env.VITE_SUPABASE_FUNCTIONS_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

// Test the API base URL construction
const SUPABASE_FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const constructApiBaseUrl = () => {
  if (!SUPABASE_FUNCTIONS_BASE) {
    return `http://localhost:5000/api`; // Fallback to Express server
  }
  
  const baseUrl = SUPABASE_FUNCTIONS_BASE.replace(/\/$/, '');
  
  if (baseUrl.includes('/functions/v1')) {
    return `${baseUrl}/api`;
  } else {
    return `${baseUrl}/functions/v1/api`;
  }
};

const API_BASE_URL = constructApiBaseUrl();
console.log('Constructed API_BASE_URL:', API_BASE_URL);
console.log('Expected URL should be: https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api');
console.log('=================================');

export { API_BASE_URL };
