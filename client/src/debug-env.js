// Debug script to check environment variables in production
console.log('=== ENVIRONMENT DEBUG ===');
console.log('import.meta.env.MODE:', import.meta.env.MODE);
console.log('import.meta.env.PROD:', import.meta.env.PROD);
console.log('import.meta.env.DEV:', import.meta.env.DEV);
console.log('');

console.log('=== VITE ENVIRONMENT VARIABLES ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_FUNCTIONS_URL:', import.meta.env.VITE_SUPABASE_FUNCTIONS_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present (length: ' + import.meta.env.VITE_SUPABASE_ANON_KEY.length + ')' : 'Missing');
console.log('VITE_CLERK_PUBLISHABLE_KEY:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Present' : 'Missing');
console.log('VITE_MPESA_ENABLED:', import.meta.env.VITE_MPESA_ENABLED);
console.log('');

console.log('=== EXPECTED VALUES ===');
console.log('Expected API URL: https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api');
console.log('Expected Supabase URL: https://zdbfjwienzjdjpawcnuc.supabase.co');
console.log('Expected Functions URL: https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1');
console.log('==========================');

// Export for use in other files
export const debugEnvVars = () => {
  return {
    mode: import.meta.env.MODE,
    prod: import.meta.env.PROD,
    dev: import.meta.env.DEV,
    apiUrl: import.meta.env.VITE_API_URL,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    functionsUrl: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL,
    clerkKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Present' : 'Missing',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
    mpesaEnabled: import.meta.env.VITE_MPESA_ENABLED
  };
};
