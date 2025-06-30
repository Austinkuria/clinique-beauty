// Define allowed origins - include your local dev and production URLs
const allowedOrigins = [
    'http://localhost:5173',
    'https://clinique-beauty.vercel.app' // Ensure this matches your Vercel URL exactly
];

export const corsHeaders = (origin: string | null): Record<string, string> => {
    const isAllowed = origin && allowedOrigins.includes(origin);
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin! : allowedOrigins[0], // Allow specific origin or default
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Credentials': 'true', // If you need credentials/cookies
    };
};

// Export allowedOrigins if needed elsewhere, though keeping it internal to cors.ts is often cleaner
// export { allowedOrigins };
