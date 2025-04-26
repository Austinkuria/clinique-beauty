import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define allowed origins - include your local dev and production URLs
const allowedOrigins = [
    'http://localhost:5173',
    'https://clinique-beauty.vercel.app' // Ensure this matches your Vercel URL exactly
];

// Function to create Supabase client (avoids creating it repeatedly if not needed)
const getSupabaseClient = (req: Request): SupabaseClient => {
    return createClient(
        // Define Supabase URL and anon key from environment variables using new names
        Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
        Deno.env.get('PROJECT_SUPABASE_ANON_KEY') ?? '',
        // Create client with Auth context of the user that called the function.
        // This way your row-level-security (RLS) policies are applied.
        // If you want to use the Service Role Key, uncomment the next line and comment the auth line
        // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        // Use Service Role for now, using the new variable name
        { global: { headers: { Authorization: `Bearer ${Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY')!}` } } }
    );
};

serve(async (req: Request) => {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean); // e.g., ['functions', 'v1', 'api', 'products', '123']
    const apiPathIndex = pathSegments.findIndex(segment => segment === 'api');
    const route = pathSegments.slice(apiPathIndex + 1); // e.g., ['products', '123'] or ['products']

    const origin = req.headers.get('Origin');
    // Ensure the check uses the correct variable and includes the origin
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);

    // --- CORS Preflight Request Handling ---
    if (req.method === 'OPTIONS') {
        if (isAllowedOrigin) {
            // Ensure status 200 is explicitly set
            return new Response('ok', {
                status: 200, // Explicitly set 200 OK status
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Adjust as needed
                    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // Adjust as needed
                },
            });
        } else {
            return new Response('Forbidden', { status: 403 });
        }
    }

    // --- Prepare Response Headers (including CORS for actual requests) ---
    const headers = new Headers({
        'Content-Type': 'application/json',
    });
    if (isAllowedOrigin) {
        // Set CORS header for actual requests too
        headers.set('Access-Control-Allow-Origin', origin);
    }

    // --- API Routing ---
    try {
        const supabase = getSupabaseClient(req);

        // --- GET /api/products ---
        if (req.method === 'GET' && route[0] === 'products' && route.length === 1) {
            const category = url.searchParams.get('category'); // Main category filter
            const subcategory = url.searchParams.get('subcategory'); // Subcategory filter

            let query = supabase.from('products').select('*');

            // Filter by main category if provided
            if (category) {
                query = query.eq('category', category);
            }
            // Filter by subcategory if provided
            if (subcategory) {
                query = query.eq('subcategory', subcategory);
            }

            const { data, error } = await query;

            if (error) throw error;

            return new Response(JSON.stringify(data || []), { headers, status: 200 });
        }

        // --- GET /api/products/:id ---
        if (req.method === 'GET' && route[0] === 'products' && route.length === 2) {
            const id = route[1];
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .maybeSingle(); // Use maybeSingle for one or zero results

            if (error) throw error;

            if (!data) {
                return new Response(JSON.stringify({ message: 'Product not found' }), { headers, status: 404 });
            }

            return new Response(JSON.stringify(data), { headers, status: 200 });
        }

        // --- Add other routes (POST/PUT/DELETE for cart, reviews etc.) here ---
        // Example: GET /api/cart (placeholder)
        if (req.method === 'GET' && route[0] === 'cart') {
            // Add logic to get cart based on user auth (requires different client setup)
            return new Response(JSON.stringify({ message: 'Cart endpoint not fully implemented' }), { headers, status: 200 });
        }


        // --- Fallback for unhandled routes ---
        // Ensure CORS header is added even for 404s if origin was allowed
        return new Response(JSON.stringify({ message: 'Route not found' }), { headers, status: 404 });

    } catch (error) {
        console.error('Error processing request:', error);
        // Ensure error responses also include CORS headers if the origin was allowed initially
        const errorHeaders = new Headers({
            'Content-Type': 'application/json',
        });
        if (isAllowedOrigin) {
            errorHeaders.set('Access-Control-Allow-Origin', origin);
        }
        return new Response(
            JSON.stringify({ message: error?.message || 'Internal Server Error' }),
            { headers: errorHeaders, status: 500 }
        );
    }
});
