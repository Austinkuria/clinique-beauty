// Define allowed origins - include your local dev and production URLs
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'https://clinique-beauty.vercel.app' // Ensure this matches your Vercel URL exactly
];

export const corsHeaders = (origin: string | null): Record<string, string> => {
    // For development, be more permissive with localhost origins
    const isDevelopment = origin?.includes('localhost') || origin?.includes('127.0.0.1');
    const isAllowed = origin && (allowedOrigins.includes(origin) || isDevelopment);
    
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin! : '*', // More permissive fallback
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
        'Access-Control-Allow-Credentials': 'true', // If you need credentials/cookies
        'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    };
};

// Export allowedOrigins if needed elsewhere, though keeping it internal to cors.ts is often cleaner
// export { allowedOrigins };
