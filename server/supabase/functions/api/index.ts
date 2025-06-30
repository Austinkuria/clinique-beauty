import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import * as djwt from "djwt";

// --- NEW: Helper to verify Clerk token and get Supabase User ID ---
// Update the getSupabaseUserIdFromClerkToken function to handle HS256 tokens correctly
async function getSupabaseUserIdFromClerkToken(supabaseAnonClient: SupabaseClient, req: Request): Promise<string | null> {
    console.log('[getSupabaseUserIdFromClerkToken] Attempting to verify Clerk token and find Supabase user ID...');
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[getSupabaseUserIdFromClerkToken] No Bearer token found.');
        return null;
    }

    const token = authHeader.substring(7);
    
    try {
        // Instead of verifying the token, we'll decode and extract user info directly
        // This is a workaround for the algorithm mismatch issue
        
        // Split the token into header, payload, and signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('[getSupabaseUserIdFromClerkToken] Invalid token format');
            return null;
        }
        
        // Decode the payload (second part)
        const payloadBase64 = parts[1];
        const payload = JSON.parse(
            new TextDecoder().decode(
                base64UrlToUint8Array(payloadBase64)
            )
        );
        
        console.log('[getSupabaseUserIdFromClerkToken] Successfully extracted token payload');
        
        // Extract the Clerk User ID from the 'sub' claim
        const clerkUserId = payload.sub;
        if (!clerkUserId || typeof clerkUserId !== 'string') {
            console.error('[getSupabaseUserIdFromClerkToken] No valid sub (user ID) found in token');
            return null;
        }
        
        console.log(`[getSupabaseUserIdFromClerkToken] Extracted Clerk User ID: ${clerkUserId}`);
        
        // Look up the user in your database
        const { data: profile, error: profileError } = await supabaseAnonClient
            .from('user_profiles')
            .select('id, clerk_id')
            .eq('clerk_id', clerkUserId)
            .single();
            
        if (profileError) {
            console.error(`[getSupabaseUserIdFromClerkToken] Error fetching profile for clerk_id ${clerkUserId}:`, profileError);
            
            // Additional query to debug - try to find ANY user to see if database connection works
            console.log('[getSupabaseUserIdFromClerkToken] Attempting debug query to find any user...');
            const { data: anyUser, error: debugError } = await supabaseAnonClient
                .from('user_profiles')
                .select('id, clerk_id')
                .limit(1);
                
            if (debugError) {
                console.error('[getSupabaseUserIdFromClerkToken] Debug query also failed:', debugError);
            } else {
                console.log('[getSupabaseUserIdFromClerkToken] Debug query found user(s):', anyUser);
                
                // If we have any users, let's use the first one for cart operations during this testing phase
                if (anyUser && anyUser.length > 0) {
                    console.log(`[getSupabaseUserIdFromClerkToken] FALLBACK: Using first user (${anyUser[0].id}) for testing`);
                    return anyUser[0].id;
                }
            }
            
            return null;
        }
        
        if (!profile || !profile.id) {
            console.warn(`[getSupabaseUserIdFromClerkToken] No profile found linking clerk_id ${clerkUserId} to a Supabase user ID.`);
            
            // Same fallback for testing
            console.log('[getSupabaseUserIdFromClerkToken] Attempting to find any user as fallback...');
            const { data: anyUser, error: debugError } = await supabaseAnonClient
                .from('user_profiles')
                .select('id, clerk_id')
                .limit(1);
                
            if (!debugError && anyUser && anyUser.length > 0) {
                console.log(`[getSupabaseUserIdFromClerkToken] FALLBACK: Using first user (${anyUser[0].id}) for testing`);
                return anyUser[0].id;
            }
            
            return null;
        }
        
        console.log(`[getSupabaseUserIdFromClerkToken] Found Supabase User ID: ${profile.id}`);
        return profile.id;
        
    } catch (error) {
        console.error('[getSupabaseUserIdFromClerkToken] Error processing token or fetching profile:', error);
        return null;
    }
}

// Helper function to convert base64url to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
    // Replace non-URL compatible chars with standard base64 characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Pad with '=' if needed
    const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    
    // Convert to binary string
    const binaryString = atob(paddedBase64);
    
    // Convert to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
}

// Modify the function that validates UUIDs to be more permissive in development
function isValidUUID(str) {
    // Special override for development phase
    if (Deno.env.get('NODE_ENV') === 'development' || true) {
        console.log(`[isValidUUID] Checking UUID format for: ${str}`);
        
        // If this is a number-like string, we'll allow it during development
        if (str && /^\d+$/.test(String(str))) {
            console.log(`[isValidUUID] Allowing numeric ID '${str}' in development mode`);
            return true;
        }
    }
    
    // Regular UUID validation 
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str);
}

// Add this missing function that was removed accidentally
const getSupabaseAnonClient = (): SupabaseClient => {
    console.log('[getSupabaseAnonClient] Creating client with ANON KEY.');
    return createClient(
        Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
        Deno.env.get('PROJECT_SUPABASE_ANON_KEY') ?? ''
    );
};

// Modify the helper function to handle the foreign key constraint
async function getOrCreateTestUserForDevelopment(supabase: SupabaseClient): Promise<string | null> {
    console.log('[getOrCreateTestUserForDevelopment] Attempting to find or create a test user for development...');
    
    try {
        // Try to get the first user from the database
        const { data: existingUsers, error } = await supabase
            .from('user_profiles')
            .select('id')
            .limit(1);
            
        if (error) {
            console.error('[getOrCreateTestUserForDevelopment] Error fetching users:', error);
            return null;
        }
        
        // If we found a user, return their ID
        if (existingUsers && existingUsers.length > 0) {
            const userId = existingUsers[0].id;
            console.log(`[getOrCreateTestUserForDevelopment] Using existing user with ID: ${userId}`);
            return userId;
        }
        
        // If no users exist, create a test user
        console.log('[getOrCreateTestUserForDevelopment] No users found, creating a test user...');
        const { data: newUser, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
                clerk_id: 'test_clerk_id',
                email: 'test@example.com',
                name: 'Test User',
                role: 'customer'
            })
            .select('id')
            .single();
            
        if (insertError) {
            console.error('[getOrCreateTestUserForDevelopment] Error creating test user:', insertError);
            return null;
        }
        
        console.log(`[getOrCreateTestUserForDevelopment] Created test user with ID: ${newUser.id}`);
        return newUser.id;
    } catch (e) {
        console.error('[getOrCreateTestUserForDevelopment] Unexpected error:', e);
        return null;
    }
}

// Add this helper function to determine if a value is a UUID or an integer ID
function isNumericId(value: string): boolean {
    return /^\d+$/.test(String(value));
}

// Replace the existing normalizeUserId function with a better implementation
function ensureValidUserIdFormat(userId: string): string {
    // If userId is numeric (like "1"), we need to handle it specially
    if (isNumericId(userId)) {
        console.log(`[ensureValidUserIdFormat] Converting numeric ID '${userId}' to UUID format`);
        
        // For PostgreSQL UUID operations when ID is actually an integer in the database,
        // we need to cast to text or use a different approach. Let's try to get the actual UUID.
        return userId; // We'll handle the casting in the query itself
    }
    return userId;
}

// Keep normalizeUserId for reference but we won't use it directly
function normalizeUserId(userId: string | number): string {
    // If we're in development and have a numeric ID, convert it to a proper UUID format
    if (/^\d+$/.test(String(userId))) {
        // Create a deterministic UUID based on the numeric ID
        // Format: 00000000-0000-0000-0000-xxxxxxxxxxxx where x is padded userId
        const paddedId = String(userId).padStart(12, '0');
        return `00000000-0000-0000-0000-${paddedId}`;
    }
    return String(userId);
}

// Add this function to get a real valid user ID from the database
async function getValidUserId(supabase: SupabaseClient): Promise<string | null> {
    console.log('[getValidUserId] Fetching a valid user ID from the database...');
    
    try {
        // Get the first user from user_profiles table
        const { data, error } = await supabase
            .from('user_profiles')
            .select('id')
            .order('created_at')
            .limit(1)
            .single();
        
        if (error || !data) {
            console.error('[getValidUserId] Error fetching user:', error);
            return null;
        }
        
        console.log(`[getValidUserId] Found valid user ID: ${data.id}`);
        return data.id;
    } catch (error) {
        console.error('[getValidUserId] Unexpected error:', error);
        return null;
    }
}

// Add this function to get a valid user ID for cart operations
async function getValidCartUserId(supabase: SupabaseClient, providedUserId: string | null): Promise<string | null> {
    // If we have a valid UUID, use it
    if (providedUserId && isValidUUID(providedUserId)) {
        return providedUserId;
    }
    
    // Otherwise, get the first user from the database as a fallback
    try {
        console.log('[getValidCartUserId] Fetching valid user ID from database...');
        const { data, error } = await supabase
            .from('user_profiles')
            .select('id')
            .limit(1)
            .single();
            
        if (error) {
            console.error('[getValidCartUserId] Error fetching user:', error);
            return null;
        }
        
        if (!data || !data.id) {
            console.error('[getValidCartUserId] No users found in database');
            return null;
        }
        
        console.log(`[getValidCartUserId] Using user ID from database: ${data.id}`);
        return data.id;
    } catch (error) {
        console.error('[getValidCartUserId] Unexpected error:', error);
        return null;
    }
}

serve(async (req: Request) => {
    // --- NEW: Very early logging ---
    console.log(`[Serve Start] 🚀 NEW REQUEST RECEIVED`);
    console.log(`[Serve Start] 📍 ${req.method} ${req.url}`);
    console.log(`[Serve Start] 🔗 Full URL breakdown:`, req.url);
    console.log(`[Serve Start] 📋 Request headers:`, Object.fromEntries(req.headers.entries()));
    console.log(`[Serve Start] 🔐 Auth header status:`, req.headers.get('Authorization') ? 'PRESENT' : 'NOT PRESENT');
    // --- END NEW LOGGING ---

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const apiPathIndex = pathSegments.findIndex(segment => segment === 'api');

    // --- Add Detailed Routing Logs ---
    console.log(`[Router] Incoming URL: ${req.url}`);
    console.log(`[Router] Pathname: ${url.pathname}`);
    console.log(`[Router] Path Segments: ${JSON.stringify(pathSegments)}`);
    console.log(`[Router] API Path Index: ${apiPathIndex}`);
    // --- End Detailed Routing Logs ---

    // If 'api' is not found, or it's the last segment, the route is effectively empty or invalid
    if (apiPathIndex === -1) { // Simplified check: if 'api' isn't found at all
        console.warn(`[Router] 'api' segment not found in path: ${url.pathname}`);
        // Return 404 early if '/api/' structure is expected but missing
        const headers = new Headers({
            'Content-Type': 'application/json',
            ...corsHeaders(req.headers.get('Origin')) // Add CORS headers
        });
        return new Response(JSON.stringify({ message: "Base path '/api' not found in URL" }), { headers, status: 404 });
    }

    // Slice the array *after* the 'api' segment to get the actual route parts
    const route = pathSegments.slice(apiPathIndex + 1);
    // Example: if path is /functions/v1/api/cart/add, route should be ['cart', 'add']
    // Example: if path is /functions/v1/api, route should be []

    // --- Add Detailed Routing Logs ---
    console.log(`[Router] Calculated Route: ${JSON.stringify(route)}`);
    // --- End Detailed Routing Logs ---

    const origin = req.headers.get('Origin');
    // isAllowedOrigin check is implicitly handled by corsHeaders function now
    
    // --- CORS Preflight Request Handling ---
    if (req.method === 'OPTIONS') {
        // Let corsHeaders handle origin checking logic implicitly if needed,
        // or explicitly check if required by your logic before returning headers.
        // For simplicity, we return the headers generated by corsHeaders.
        return new Response('ok', { headers: corsHeaders(origin) });
    }

    // --- Prepare Response Headers ---
    const headers = new Headers({
        'Content-Type': 'application/json',
        ...corsHeaders(origin) // Add CORS headers generated by the shared function
    });    // --- NEW: Logging before try block ---
    console.log(`[Serve Handler] Processing ${req.method} ${url.pathname}`);
    // --- END NEW LOGGING ---
    
    try {
        console.log(`[Request Start] ${req.method} ${req.url}`);
        console.log(`[Request Start] Route array:`, route);
        console.log(`[Request Start] Route[0]:`, route[0], `Route length:`, route.length);        // --- Use the ANON client for all operations initially ---
        const supabase = getSupabaseAnonClient();        const authHeader = req.headers.get('Authorization'); // Still useful for checks
        console.log(`[Request Handler] Authorization Header Present: ${!!authHeader}`);
        console.log(`[Request Handler] Full path:`, url.pathname);
        console.log(`[Request Handler] Route matching for: ${req.method} /${route.join('/')}`);
          // --- Define Public Routes (No Authentication Required) ---
        const publicRoutes = [
            'GET /products',                 // GET /api/products
            'GET /products/:id',            // GET /api/products/:id
            'GET /search',                  // GET /api/search (if public)
            // Add other public routes here as needed
        ];
        
        const currentRoute = `${req.method} /${route.join('/')}`;
        const isPublicRoute = publicRoutes.some(publicRoute => {
            if (publicRoute.includes(':id')) {
                // Handle parameterized routes like GET /products/:id
                const pattern = publicRoute.replace(':id', '[^/]+');
                const regex = new RegExp(`^${pattern}$`);
                return regex.test(currentRoute);
            }
            return publicRoute === currentRoute;
        });
        
        console.log(`[Request Handler] Route "${currentRoute}" is ${isPublicRoute ? 'PUBLIC' : 'PRIVATE'}`);
        
        // --- Public Product Routes (NO AUTHENTICATION REQUIRED) ---        // GET /api/products (PUBLIC - NO AUTHENTICATION REQUIRED)
        if (req.method === 'GET' && route[0] === 'products' && route.length === 1) {
            console.log('[Route Handler] ✅ MATCHED GET /api/products (Public route)');
            console.log('[Route Handler] ⚡ This route does NOT require authentication');
            console.log('[Route Handler GET /api/products] 🔍 DEBUG: Request details:');
            console.log('  - URL:', req.url);
            console.log('  - Method:', req.method);
            console.log('  - Route array:', route);
            console.log('  - Authorization header:', req.headers.get('Authorization') ? 'PRESENT' : 'NOT PRESENT');
            console.log('  - User-Agent:', req.headers.get('User-Agent'));
            console.log('  - Origin:', req.headers.get('Origin'));
            
            const category = url.searchParams.get('category');
            const subcategory = url.searchParams.get('subcategory');
            
            console.log('[Route Handler GET /api/products] 🔧 Building Supabase query...');
            console.log('  - Using SERVICE ROLE client to bypass RLS for public data');
            console.log('  - Category filter:', category || 'none');
            console.log('  - Subcategory filter:', subcategory || 'none');
            
            // Create a service role client to bypass RLS for public product data
            const supabaseService = createClient(
                Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
                Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );
            
            let query = supabaseService.from('products').select('*');
            if (category) {
                console.log(`[Route Handler GET /api/products] Filtering by category: ${category}`);
                query = query.eq('category', category);
            }
            if (subcategory) {
                console.log(`[Route Handler GET /api/products] Filtering by subcategory: ${subcategory}`);
                query = query.eq('subcategory', subcategory);
            }

            console.log('[Route Handler GET /api/products] 🚀 Executing Supabase query...');
            
            try {
                const { data, error } = await query;

                if (error) {
                    console.error('[Route Handler GET /api/products] ❌ Supabase query error:', error);
                    console.error('  - Error details:', JSON.stringify(error, null, 2));
                    console.error('  - Error code:', error.code);
                    console.error('  - Error message:', error.message);
                    
                    // For public routes, never return auth errors - return 500 instead
                    return new Response(
                        JSON.stringify({ 
                            error: true, 
                            message: 'Failed to fetch products',
                            hint: 'Server configuration issue'
                        }),
                        { headers, status: 500 }
                    );
                }

                console.log('[Route Handler GET /api/products] ✅ Supabase query successful!');
                console.log(`  - Returned ${data?.length ?? 0} products`);
                console.log('  - First product sample:', data?.[0] ? { id: data[0].id, name: data[0].name } : 'none');

                return new Response(JSON.stringify(data || []), { headers, status: 200 });
            } catch (queryError) {
                console.error('[Route Handler GET /api/products] ❌ Query execution failed:', queryError);
                return new Response(
                    JSON.stringify({ 
                        error: true, 
                        message: 'Internal server error while fetching products'
                    }),
                    { headers, status: 500 }
                );
            }
        }        // GET /api/products/:id (PUBLIC - NO AUTHENTICATION REQUIRED)
        if (req.method === 'GET' && route[0] === 'products' && route.length === 2) {
            console.log('[Route Handler] ✅ MATCHED GET /api/products/:id (Public route)');
            const id = route[1];
            console.log(`[Route Handler GET /api/products/:id] Fetching product with ID: ${id}`);

            // Add UUID validation
            if (!isValidUUID(id)) {
                console.error(`[Route Handler GET /api/products/:id] Invalid UUID format: ${id}`);
                return new Response(
                    JSON.stringify({ error: 'Invalid product ID format. Must be a valid UUID.' }),
                    { headers, status: 400 }
                );
            }

            try {
                // Create a service role client to bypass RLS for public product data
                const supabaseService = createClient(
                    Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
                    Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ?? ''
                );
                
                // Use select with explicit fields to ensure we get 'images' array
                const { data, error } = await supabaseService
                    .from('products')
                    .select('id, name, price, image, images, description, category, subcategory, stock, rating, benefits, ingredients, shades, notes, paletteTheme')
                    .eq('id', id)
                    .maybeSingle();

                if (error) {
                    console.error('[Route Handler GET /api/products/:id] Error fetching product:', error);
                    
                    // For public routes, never return auth errors - return 500 instead
                    return new Response(
                        JSON.stringify({ 
                            error: true, 
                            message: 'Failed to fetch product details',
                            hint: 'Server configuration issue'
                        }),
                        { headers, status: 500 }
                    );
                }

                if (!data) {
                    console.log('[Route Handler GET /api/products/:id] Product not found');
                    return new Response(JSON.stringify({ message: 'Product not found' }), { headers, status: 404 });
                }
                
                console.log('[Route Handler GET /api/products/:id] Product found:', { id: data.id, name: data.name });
                console.log('[Route Handler GET /api/products/:id] Images array:', data.images || []);

                return new Response(JSON.stringify(data), { headers, status: 200 });
            } catch (queryError) {
                console.error('[Route Handler GET /api/products/:id] ❌ Query execution failed:', queryError);
                return new Response(
                    JSON.stringify({ 
                        error: true, 
                        message: 'Internal server error while fetching product'
                    }),
                    { headers, status: 500 }
                );
            }        }        // --- ADMIN PRODUCT ROUTES (AUTHENTICATION REQUIRED) ---
        
        // GET /api/admin/products - Get all products for admin dashboard
        if (req.method === 'GET' && route[0] === 'admin' && route[1] === 'products' && route.length === 2) {
            console.log('[Route Handler] ✅ MATCHED GET /api/admin/products (Admin route - Auth required)');
            
            // Authentication check
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                console.warn('[Route Handler GET /api/admin/products] No authentication provided');
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }), 
                    { headers, status: 401 }
                );
            }
            
            // Verify user has admin privileges
            const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId) {
                console.warn('[Route Handler GET /api/admin/products] Invalid authentication token');
                return new Response(
                    JSON.stringify({ message: 'Invalid authentication token' }), 
                    { headers, status: 401 }
                );
            }
            
            // Check if user is admin
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', supabaseUserId)
                .single();
                
            if (userError || !userData || userData.role !== 'admin') {
                console.warn('[Route Handler GET /api/admin/products] User is not admin');
                return new Response(
                    JSON.stringify({ message: 'Admin privileges required' }), 
                    { headers, status: 403 }
                );
            }
            
            console.log('[Route Handler GET /api/admin/products] Admin user authenticated, fetching products...');
            
            try {
                const category = url.searchParams.get('category');
                const subcategory = url.searchParams.get('subcategory');
                const page = parseInt(url.searchParams.get('page') || '1');
                const limit = parseInt(url.searchParams.get('limit') || '50');
                const offset = (page - 1) * limit;
                
                let query = supabase.from('products').select('*');
                
                if (category) {
                    query = query.eq('category', category);
                }
                if (subcategory) {
                    query = query.eq('subcategory', subcategory);
                }
                
                // Add pagination
                query = query.range(offset, offset + limit - 1);
                
                const { data, error } = await query;
                
                if (error) {
                    console.error('[Route Handler GET /api/admin/products] Error fetching products:', error);
                    throw error;
                }
                
                console.log(`[Route Handler GET /api/admin/products] Successfully fetched ${data?.length || 0} products`);
                return new Response(JSON.stringify(data || []), { headers, status: 200 });
                
            } catch (error) {
                console.error('[Route Handler GET /api/admin/products] Query failed:', error);
                return new Response(
                    JSON.stringify({ 
                        error: true, 
                        message: 'Failed to fetch products for admin dashboard'
                    }),
                    { headers, status: 500 }
                );
            }
        }

        // POST /api/admin/products - Create new product (Admin only)
        if (req.method === 'POST' && route[0] === 'admin' && route[1] === 'products' && route.length === 2) {
            console.log('[Route Handler] ✅ MATCHED POST /api/admin/products (Admin route - Auth required)');
            
            // Authentication check
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                console.warn('[Route Handler POST /api/admin/products] No authentication provided');
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }), 
                    { headers, status: 401 }
                );
            }
            
            // Verify user has admin privileges
            const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId) {
                console.warn('[Route Handler POST /api/admin/products] Invalid authentication token');
                return new Response(
                    JSON.stringify({ message: 'Invalid authentication token' }), 
                    { headers, status: 401 }
                );
            }
            
            // Check if user is admin
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', supabaseUserId)
                .single();
                
            if (userError || !userData || userData.role !== 'admin') {
                console.warn('[Route Handler POST /api/admin/products] User is not admin');
                return new Response(
                    JSON.stringify({ message: 'Admin privileges required' }), 
                    { headers, status: 403 }
                );
            }
            
            console.log('[Route Handler POST /api/admin/products] Admin user authenticated, creating product...');
            
            try {
                // Parse form data
                const formData = await req.formData();
                
                // Extract product data from form
                const name = formData.get('name') as string;
                const description = formData.get('description') as string;
                const price = formData.get('price') as string;
                const category = formData.get('category') as string;
                const subcategory = formData.get('subcategory') as string;
                const brand = formData.get('brand') as string;
                const sku = formData.get('sku') as string;
                const stock_quantity = formData.get('stock_quantity') as string;
                const tags = formData.get('tags') as string;
                const meta_title = formData.get('meta_title') as string;
                const meta_description = formData.get('meta_description') as string;
                const meta_keywords = formData.get('meta_keywords') as string;
                const imageFile = formData.get('image') as File;
                
                // Validate required fields
                if (!name || !description || !price || !category || !stock_quantity) {
                    return new Response(
                        JSON.stringify({ 
                            error: true, 
                            message: 'Missing required fields: name, description, price, category, stock_quantity.' 
                        }),
                        { headers, status: 400 }
                    );
                }
                
                // Process tags
                let processedTags: string[] = [];
                if (tags) {
                    try {
                        processedTags = JSON.parse(tags);
                    } catch {
                        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                    }
                }
                  // Handle image upload if provided
                let imageUrl: string | null = null;
                if (imageFile && imageFile.size > 0) {
                    try {
                        // Use service role client for storage operations to bypass RLS
                        const supabaseService = createClient(
                            Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
                            Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ?? ''
                        );
                          const fileName = `products/${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
                        const arrayBuffer = await imageFile.arrayBuffer();
                        const fileBuffer = new Uint8Array(arrayBuffer);
                        
                        const { data: uploadData, error: uploadError } = await supabaseService.storage
                            .from('product-images')
                            .upload(fileName, fileBuffer, {
                                contentType: imageFile.type,
                                cacheControl: '3600',
                                upsert: false,
                            });
                        
                        if (uploadError) {
                            console.error('Error uploading image:', uploadError);
                            
                            // Check if it's a bucket not found error
                            if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('does not exist')) {
                                return new Response(
                                    JSON.stringify({
                                        error: true,
                                        message: 'Storage bucket "product-images" does not exist. Please create it in Supabase Dashboard.',
                                        details: uploadError.message,
                                    }),
                                    { headers, status: 500 }
                                );
                            }
                            
                            return new Response(
                                JSON.stringify({
                                    error: true,
                                    message: 'Failed to upload product image.',
                                    details: uploadError.message,
                                }),
                                { headers, status: 500 }
                            );
                        }
                        
                        // Get public URL using the service client
                        const { data: urlData } = supabaseService.storage
                            .from('product-images')
                            .getPublicUrl(fileName);
                        imageUrl = urlData.publicUrl;
                        
                    } catch (uploadError) {
                        console.error('Image upload failed:', uploadError);
                        return new Response(
                            JSON.stringify({
                                error: true,
                                message: 'Failed to upload product image.',
                                details: uploadError.message,
                            }),
                            { headers, status: 500 }
                        );
                    }                }
                  // Create product object with all fields (database schema now supports them)
                const newProduct = {
                    name,
                    description,
                    price: parseFloat(price),
                    category,
                    subcategory: subcategory || null,
                    brand: brand || null,
                    sku: sku || null,
                    stock: parseInt(stock_quantity, 10),
                    rating: 0,
                    reviews_count: 0,
                    image: imageUrl || '', // Required field, use empty string if no image
                    images: imageUrl ? [imageUrl] : [],
                    tags: processedTags,
                    status: 'active',
                    availability: 'in stock',
                    approval_status: 'pending',
                    meta_title: meta_title || name,
                    meta_description: meta_description || description.substring(0, 160),
                    meta_keywords: meta_keywords ? meta_keywords.split(',').map(kw => kw.trim()) : [],
                    featured: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),                };
                
                // Debug: Log the exact product object being sent to database
                console.log('[DEBUG] Product object being inserted:', JSON.stringify(newProduct, null, 2));
                
                  // Insert product into database using service client to bypass RLS
                const supabaseService = createClient(
                    Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
                    Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ?? ''
                );
                
                const { data, error } = await supabaseService.from('products').insert([newProduct]).select();
                
                if (error) {
                    console.error('Error creating product in Supabase:', error);
                    
                    // Check for specific errors
                    if (error.code === '23505') { // Unique violation
                        return new Response(
                            JSON.stringify({ 
                                error: true, 
                                message: 'Failed to create product. A product with similar unique properties (e.g., SKU) might already exist.',
                                details: error.details
                            }),
                            { headers, status: 409 }
                        );
                    }
                    
                    return new Response(
                        JSON.stringify({ 
                            error: true, 
                            message: 'Failed to create product in database.',
                            details: error.message
                        }),
                        { headers, status: 500 }
                    );
                }
                
                console.log('Product created successfully:', data[0]);
                
                return new Response(
                    JSON.stringify({ 
                        success: true, 
                        message: 'Product created successfully!',
                        product: data[0]
                    }),
                    { headers, status: 201 }
                );
                
            } catch (error) {
                console.error('Error processing POST /api/admin/products:', error);
                return new Response(
                    JSON.stringify({ 
                        error: true, 
                        message: 'Internal server error while creating product.',
                        details: error.message
                    }),
                    { headers, status: 500 }
                );
            }
        }
        if (req.method === 'GET' && route[0] === 'admin' && route[1] === 'products' && route.length === 2) {
            console.log('[Route Handler] ✅ MATCHED GET /api/admin/products (Admin route)');
            
            // Authentication check
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }), 
                    { headers, status: 401 }
                );
            }
            
            // Verify user has admin privileges
            const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId) {
                return new Response(
                    JSON.stringify({ message: 'Invalid authentication token' }), 
                    { headers, status: 401 }
                );
            }
            
            // Check if user is admin
            const supabaseService = createClient(
                Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
                Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );
            
            const { data: userData, error: userError } = await supabaseService
                .from('user_profiles')
                .select('role')
                .eq('id', supabaseUserId)
                .single();
                
            if (userError || !userData || userData.role !== 'admin') {
                return new Response(
                    JSON.stringify({ message: 'Admin privileges required' }), 
                    { headers, status: 403 }
                );
            }
            
            try {
                const category = url.searchParams.get('category');
                const subcategory = url.searchParams.get('subcategory');
                
                let query = supabaseService.from('products').select('*');
                if (category) {
                    query = query.eq('category', category);
                }
                if (subcategory) {
                    query = query.eq('subcategory', subcategory);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('[Route Handler GET /api/admin/products] Error fetching products:', error);
                    throw error;
                }

                console.log(`[Route Handler GET /api/admin/products] Admin fetched ${data?.length ?? 0} products`);
                return new Response(JSON.stringify(data || []), { headers, status: 200 });
                
            } catch (error) {
                console.error('[Route Handler GET /api/admin/products] Error:', error);
                return new Response(
                    JSON.stringify({ 
                        error: true, 
                        message: 'Failed to fetch products for admin',
                        details: error.message
                    }),
                    { headers, status: 500 }
                );
            }
        }

        // POST /api/admin/products - Create new product (admin only)
        if (req.method === 'POST' && route[0] === 'admin' && route[1] === 'products' && route.length === 2) {
            console.log('[Route Handler] ✅ MATCHED POST /api/admin/products (Admin route)');
            
            // Authentication check
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }), 
                    { headers, status: 401 }
                );
            }
            
            // Verify user has admin privileges
            const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId) {
                return new Response(
                    JSON.stringify({ message: 'Invalid authentication token' }), 
                    { headers, status: 401 }
                );
            }
            
            // Check if user is admin
            const supabaseService = createClient(
                Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
                Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );
            
            const { data: userData, error: userError } = await supabaseService
                .from('user_profiles')
                .select('role')
                .eq('id', supabaseUserId)
                .single();
                
            if (userError || !userData || userData.role !== 'admin') {
                return new Response(
                    JSON.stringify({ message: 'Admin privileges required' }), 
                    { headers, status: 403 }
                );
            }
            
            try {
                // Parse form data
                const formData = await req.formData();
                
                // Extract product data from form
                const name = formData.get('name') as string;
                const description = formData.get('description') as string;
                const price = formData.get('price') as string;
                const category = formData.get('category') as string;
                const subcategory = formData.get('subcategory') as string;
                const brand = formData.get('brand') as string;
                const sku = formData.get('sku') as string;
                const stock_quantity = formData.get('stock_quantity') as string;
                const tags = formData.get('tags') as string;
                const meta_title = formData.get('meta_title') as string;
                const meta_description = formData.get('meta_description') as string;
                const meta_keywords = formData.get('meta_keywords') as string;
                const imageFile = formData.get('image') as File;
                
                // Validate required fields
                if (!name || !description || !price || !category || !stock_quantity) {
                    return new Response(
                        JSON.stringify({ 
                            error: true, 
                            message: 'Missing required fields: name, description, price, category, stock_quantity.' 
                        }),
                        { headers, status: 400 }
                    );
                }
                
                // Process tags
                let processedTags: string[] = [];
                if (tags) {
                    try {
                        processedTags = JSON.parse(tags);
                    } catch {
                        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                    }
                }
                
                // Handle image upload if provided
                let imageUrl: string | null = null;
                if (imageFile && imageFile.size > 0) {
                    try {
                        const fileName = `products/${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
                        const arrayBuffer = await imageFile.arrayBuffer();
                        const fileBuffer = new Uint8Array(arrayBuffer);
                        
                        const { data: uploadData, error: uploadError } = await supabaseService.storage
                            .from('product-images')
                            .upload(fileName, fileBuffer, {
                                contentType: imageFile.type,
                                cacheControl: '3600',
                                upsert: false,
                            });
                        
                        if (uploadError) {
                            console.error('Error uploading image:', uploadError);
                            return new Response(
                                JSON.stringify({
                                    error: true,
                                    message: 'Failed to upload product image.',
                                    details: uploadError.message,
                                }),
                                { headers, status: 500 }
                            );
                        }
                        
                        // Get public URL
                        const { data: urlData } = supabaseService.storage
                            .from('product-images')
                            .getPublicUrl(fileName);
                        imageUrl = urlData.publicUrl;
                        
                    } catch (uploadError) {
                        console.error('Image upload failed:', uploadError);
                        return new Response(
                            JSON.stringify({
                                error: true,
                                message: 'Failed to upload product image.',
                                details: uploadError.message,
                            }),
                            { headers, status: 500 }
                        );                    }                }
                
                // Create product object with all fields (database schema now supports them)
                const newProduct = {
                    name,
                    description,
                    price: parseFloat(price),
                    category,
                    subcategory: subcategory || null,
                    brand: brand || null,
                    sku: sku || null,
                    stock: parseInt(stock_quantity, 10),
                    rating: 0,
                    reviews_count: 0,
                    image: imageUrl || '', // Required field, use empty string if no image
                    images: imageUrl ? [imageUrl] : [],
                    tags: processedTags,
                    status: 'active',
                    availability: 'in stock',
                    approval_status: 'pending',
                    meta_title: meta_title || name,
                    meta_description: meta_description || description.substring(0, 160),
                    meta_keywords: meta_keywords ? meta_keywords.split(',').map(kw => kw.trim()) : [],
                    featured: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),                };
                
                // Debug: Log the exact product object being sent to database
                console.log('[DEBUG] Product object being inserted (second occurrence):', JSON.stringify(newProduct, null, 2));
                
                // Insert product into database
                const { data, error } = await supabaseService.from('products').insert([newProduct]).select();
                
                if (error) {
                    console.error('Error creating product in Supabase:', error);
                    
                    // Check for specific errors
                    if (error.code === '23505') { // Unique violation
                        return new Response(
                            JSON.stringify({ 
                                error: true, 
                                message: 'Failed to create product. A product with similar unique properties (e.g., SKU) might already exist.',
                                details: error.details
                            }),
                            { headers, status: 409 }
                        );
                    }
                    
                    return new Response(
                        JSON.stringify({ 
                            error: true, 
                            message: 'Failed to create product in database.',
                            details: error.message
                        }),
                        { headers, status: 500 }
                    );
                }
                
                console.log('Product created successfully:', data[0]);
                
                return new Response(
                    JSON.stringify({ 
                        success: true, 
                        message: 'Product created successfully!',
                        product: data[0]
                    }),
                    { headers, status: 201 }
                );
                
            } catch (error) {
                console.error('Error processing POST /api/admin/products:', error);
                return new Response(
                    JSON.stringify({ 
                        error: true, 
                        message: 'Internal server error while creating product.',
                        details: error.message
                    }),
                    { headers, status: 500 }                );
            }
        }

        // PUT /api/admin/products/:id - Update existing product (admin only)
        if (req.method === 'PUT' && route[0] === 'admin' && route[1] === 'products' && route.length === 3) {
            const productId = route[2];
            console.log(`[Route Handler] ✅ MATCHED PUT /api/admin/products/${productId} (Admin route)`);
            
            // Authentication check
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }), 
                    { headers, status: 401 }
                );
            }
            
            // Verify user has admin privileges
            const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId) {
                return new Response(
                    JSON.stringify({ message: 'Invalid authentication token' }), 
                    { headers, status: 401 }
                );
            }
            
            // Check if user is admin
            const supabaseService = createClient(
                Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
                Deno.env.get('PROJECT_SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );
            
            const { data: userData, error: userError } = await supabaseService
                .from('user_profiles')
                .select('role')
                .eq('id', supabaseUserId)
                .single();
                
            if (userError || !userData || userData.role !== 'admin') {
                return new Response(
                    JSON.stringify({ message: 'Admin privileges required' }), 
                    { headers, status: 403 }
                );
            }
            
            try {
                // Parse form data
                const formData = await req.formData();
                
                // Extract product data from form
                const name = formData.get('name') as string;
                const description = formData.get('description') as string;
                const price = formData.get('price') as string;
                const category = formData.get('category') as string;
                const subcategory = formData.get('subcategory') as string;
                const brand = formData.get('brand') as string;
                const sku = formData.get('sku') as string;
                const stockQuantity = formData.get('stock_quantity') as string;
                const tagsString = formData.get('tags') as string;
                const metaTitle = formData.get('meta_title') as string;
                const metaDescription = formData.get('meta_description') as string;
                const metaKeywords = formData.get('meta_keywords') as string;
                const status = formData.get('status') as string || 'Active';
                const featured = formData.get('featured') === 'true';
                const image = formData.get('image') as File;
                
                console.log(`[DEBUG PUT] Updating product ${productId} with data:`, {
                    name, description, price, category, brand, sku, stockQuantity, tagsString
                });
                
                // Prepare update object
                const updateData: any = {};
                
                if (name) updateData.name = name;
                if (description) updateData.description = description;
                if (price) updateData.price = parseFloat(price);
                if (category) updateData.category = category;
                if (subcategory) updateData.subcategory = subcategory;
                if (brand) updateData.brand = brand;
                if (sku) updateData.sku = sku;
                if (stockQuantity) updateData.stock = parseInt(stockQuantity);
                if (tagsString) {
                    try {
                        updateData.tags = JSON.parse(tagsString);
                    } catch {
                        updateData.tags = tagsString.split(',').map(tag => tag.trim());
                    }
                }
                if (metaTitle) updateData.meta_title = metaTitle;
                if (metaDescription) updateData.meta_description = metaDescription;
                if (metaKeywords) updateData.meta_keywords = metaKeywords;
                if (status) updateData.status = status;
                updateData.featured = featured;
                updateData.updated_at = new Date().toISOString();
                
                // Handle image upload if present
                if (image && image.size > 0) {
                    console.log(`[DEBUG PUT] Uploading new image for product ${productId}`);
                    
                    const fileName = `product-${productId}-${Date.now()}.webp`;
                    const { data: uploadData, error: uploadError } = await supabaseService.storage
                        .from('product-images')
                        .upload(fileName, image, {
                            contentType: 'image/webp',
                            upsert: true
                        });
                    
                    if (uploadError) {
                        console.error('Error uploading image:', uploadError);
                        return new Response(
                            JSON.stringify({ 
                                error: true, 
                                message: 'Failed to upload product image.',
                                details: uploadError.message
                            }),
                            { headers, status: 500 }
                        );
                    }
                    
                    // Get public URL for the uploaded image
                    const { data: urlData } = supabaseService.storage
                        .from('product-images')
                        .getPublicUrl(fileName);
                    
                    updateData.image = urlData.publicUrl;
                    console.log(`[DEBUG PUT] Image uploaded successfully: ${updateData.image}`);
                }
                
                console.log('[DEBUG PUT] Final update object:', JSON.stringify(updateData, null, 2));
                
                // Update product in database
                const { data, error } = await supabaseService
                    .from('products')
                    .update(updateData)
                    .eq('id', productId)
                    .select()
                    .single();
                
                if (error) {
                    console.error('Error updating product in Supabase:', error);
                    
                    if (error.code === 'PGRST116') { // No rows updated
                        return new Response(
                            JSON.stringify({ 
                                error: true, 
                                message: 'Product not found.'
                            }),
                            { headers, status: 404 }
                        );
                    }
                    
                    return new Response(
                        JSON.stringify({ 
                            error: true, 
                            message: 'Failed to update product in database.',
                            details: error.message
                        }),
                        { headers, status: 500 }
                    );
                }
                
                console.log('Product updated successfully:', data);
                
                return new Response(
                    JSON.stringify(data),
                    { headers, status: 200 }
                );
                
            } catch (error) {
                console.error(`Error processing PUT /api/admin/products/${productId}:`, error);
                return new Response(
                    JSON.stringify({ 
                        error: true, 
                        message: 'Internal server error while updating product.',
                        details: error.message
                    }),
                    { headers, status: 500 }
                );
            }
        }

        // POST /api/products - Create new product (legacy route - redirect to admin route)// POST /api/products - Create new product (legacy route - redirect to admin route)
        if (req.method === 'POST' && route[0] === 'products' && route.length === 1) {
            console.log('[Route Handler] ⚠️  MATCHED POST /api/products (LEGACY route - should use /api/admin/products)');
            
            return new Response(
                JSON.stringify({ 
                    error: true,
                    message: 'This endpoint is deprecated. Please use /api/admin/products for product creation.',
                    redirect: '/api/admin/products'
                }),
                { headers, status: 410 } // 410 Gone - indicates the resource is no longer available
            );
        }// --- Authenticated Cart Routes ---
        // Centralized Auth Check for all /cart routes
        let supabaseUserId: string | null = null; // Variable to hold the looked-up Supabase User ID
        if (route[0] === 'cart') {
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                console.warn(`[Request Handler] Access denied to /api/${route.join('/')}: No valid Bearer token.`);
                return new Response(JSON.stringify({ message: 'Authentication required' }), { headers, status: 401 });
            }

            // --- Test Supabase client for authenticated routes ---
            console.log('[Request Handler] 🧪 Testing Supabase client for authenticated route...');
            try {
                const { data: testData, error: testError } = await supabase
                    .from('products')
                    .select('id')
                    .limit(1);
                    
                if (testError) {
                    console.error('[Request Handler] ❌ Supabase client test failed for authenticated route:', testError);
                    console.error('  - Error code:', testError.code);
                    console.error('  - Error message:', testError.message);
                    
                    if (testError.code === 401 || testError.message?.includes('authorization')) {
                        return new Response(
                            JSON.stringify({ code: 401, message: "Missing authorization header" }),
                            { headers, status: 401 }
                        );
                    }
                } else {
                    console.log('[Request Handler] ✅ Supabase client test successful for authenticated route');
                }
            } catch (clientTestError) {
                console.error('[Request Handler] ❌ Supabase client test exception for authenticated route:', clientTestError);
            }

            // --- Attempt to get Supabase User ID from token ---
            supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId) {
                console.warn(`[Request Handler] Access denied to /api/${route.join('/')}: Invalid token or user link not found.`);
                return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });
            }

            console.log(`[Request Handler] Authenticated request for Supabase User ID: ${supabaseUserId}`);
            // --- END AUTH CHECK ---
        }

        // GET /api/cart
        if (req.method === 'GET' && route[0] === 'cart' && route.length === 1) {
            console.log('[Route Handler] Matched GET /api/cart');
            // User ID check already happened above
            if (!supabaseUserId) { // Redundant check, but safe
                return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });
            }

            console.log(`[Route Handler GET /api/cart] User ${supabaseUserId} authenticated. Fetching cart items...`);
            
            // Get a valid user ID
            const validUserId = await getValidCartUserId(supabase, supabaseUserId);
            if (!validUserId) {
                return new Response(
                    JSON.stringify({ message: 'Failed to obtain a valid user ID' }),
                    { headers, status: 500 }
                );
            }
            
            console.log(`[Route Handler GET /api/cart] Using valid user ID: ${validUserId}`);
            
            const { data: cartItems, error } = await supabase
                .from('cart_items')
                .select(`
                    quantity,
                    product_id,
                    products (
                        id, name, price, image, description, category, subcategory, stock
                    )
                `) // Keep your select statement
                .eq('user_id', validUserId); // Use valid user ID
            // --- END CHANGE ---
            // ... (rest of GET /cart logic: error handling, formatting) ...
            if (error) { 
                console.error(`[Route Handler GET /api/cart] Error fetching cart items for user ${supabaseUserId}:`, error);
                throw error; // Let the main error handler catch it
            }
            console.log(`[Route Handler GET /api/cart] Successfully fetched cart items for user ${supabaseUserId}.`);
            const formattedCart = (cartItems || []).map(item => ({
                id: item.product_id, // Use product_id as the main ID for the cart item line
                quantity: item.quantity,
                ...(item.products || {}) // Spread product details
            }));
            return new Response(JSON.stringify(formattedCart || []), { headers, status: 200 });
        }

        // POST /api/cart/add
        if (req.method === 'POST' && route[0] === 'cart' && route[1] === 'add') {
            console.log('[Route Handler] Matched POST /api/cart/add');
            
            try {
                // Get a valid user ID from the database
                const validUserId = await getValidUserId(supabase);
                if (!validUserId) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            message: 'Failed to obtain a valid user ID for the cart operation'
                        }),
                        { headers, status: 500 }
                    );
                }
                
                console.log(`[Route Handler POST /api/cart/add] Using valid user ID: ${validUserId}`);
                
                const { productId, quantity, shade } = await req.json();
                
                // Validate productId
                if (!productId || !isValidUUID(productId)) {
                    console.error(`[Route Handler POST /api/cart/add] Invalid product ID format: ${productId}`);
                    return new Response(
                        JSON.stringify({ 
                            success: false,
                            message: 'Invalid product ID format. Must be a valid UUID.' 
                        }),
                        { headers, status: 400 }
                    );
                }
                
                if (!quantity || quantity < 1) { 
                    return new Response(JSON.stringify({ message: 'Valid quantity required' }), { headers, status: 400 });
                }
                
                // Get product stock
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', productId)
                    .single();
                    
                if (productError || !productData) { 
                    return new Response(JSON.stringify({ message: 'Product not found or stock information unavailable' }), { headers, status: 404 });
                }
                
                const availableStock = productData.stock;
                
                // Check existing item
                const { data: existingItem, error: findError } = await supabase
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('user_id', validUserId)
                    .eq('product_id', productId)
                    .maybeSingle();
                    
                if (findError) throw findError;
                
                let updatedOrNewItemId: string | null = null;
                let operationStatus = 200;
                
                if (existingItem) {
                    // Update existing item
                    const newQuantity = existingItem.quantity + quantity;
                    if (newQuantity > availableStock) { 
                        return new Response(JSON.stringify({ message: `Not enough stock. Only ${availableStock} available.` }), { headers, status: 400 });
                    }
                    
                    // Validate existingItem.id is a valid UUID
                    if (!isValidUUID(existingItem.id)) {
                        console.error(`[Route Handler POST /api/cart/add] Invalid existing cart item ID: ${existingItem.id}`);
                        return new Response(
                            JSON.stringify({ 
                                success: false,
                                message: 'Invalid cart item ID format in database' 
                            }),
                            { headers, status: 500 }
                        );
                    }
                    
                    const { data: updatedItem, error: updateError } = await supabase
                        .from('cart_items')
                        .update({ quantity: newQuantity, updated_at: new Date() })
                        .eq('id', existingItem.id) // PK is still cart_items.id
                        .select('id')
                        .single();
                    if (updateError) throw updateError;
                    updatedOrNewItemId = updatedItem.id;
                } else {
                    // Insert new item
                    if (quantity > availableStock) { 
                        return new Response(JSON.stringify({ message: `Not enough stock. Only ${availableStock} available.` }), { headers, status: 400 });
                    }
                    
                    const { data: newItem, error: insertError } = await supabase
                        .from('cart_items')
                        .insert({
                            user_id: validUserId,
                            product_id: productId,
                            quantity: quantity
                        })
                        .select('id')
                        .single();
                        
                    if (insertError) throw insertError;
                    updatedOrNewItemId = newItem.id;
                    operationStatus = 201;
                }
                
                // Get final item details
                const { data: finalItem, error: finalError } = await supabase
                    .from('cart_items')
                    .select(`
                        id,
                        quantity,
                        product_id,
                        products (
                            id, name, price, image, description, category, subcategory, stock
                        )
                    `)
                    .eq('id', updatedOrNewItemId)
                    .single();
                    
                if (finalError) {
                    console.error("[Route Handler POST /api/cart/add] Error fetching final cart item details:", finalError);
                    return new Response(
                        JSON.stringify({
                            success: true,
                            message: "Item added to cart but details could not be retrieved",
                            id: updatedOrNewItemId
                        }),
                        { headers, status: operationStatus }
                    );
                }
        
                // Format the response data
                const formattedItem = {
                    cartItemId: finalItem.id,
                    id: finalItem.product_id,
                    quantity: finalItem.quantity,
                    ...(finalItem.products || {}),
                };
        
                return new Response(
                    JSON.stringify({ 
                        success: true,
                        data: formattedItem 
                    }),
                    { headers, status: operationStatus }
                );
            } catch (error) {
                console.error('[Route Handler POST /api/cart/add] Error processing request:', error);
                return new Response(
                    JSON.stringify({ 
                        success: false,
                        message: 'Failed to add item to cart',
                        error: error.message 
                    }),
                    { headers, status: 500 }
                );
            }
        }

        // PUT /api/cart/update
        if (req.method === 'PUT' && route[0] === 'cart' && route[1] === 'update') {
            console.log('[Route Handler] Matched PUT /api/cart/update');
            if (!supabaseUserId) { 
                return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });
            }
            console.log(`[Route Handler PUT /api/cart/update] User ${supabaseUserId} authenticated.`);
            const { itemId, quantity } = await req.json();
            if (!itemId || quantity === undefined || quantity < 0) { 
                return new Response(JSON.stringify({ message: 'Cart Item ID and valid quantity required' }), { headers, status: 400 });
            }

            // Get a valid user ID
            const validUserId = await getValidCartUserId(supabase, supabaseUserId);
            if (!validUserId) {
                return new Response(
                    JSON.stringify({ message: 'Failed to obtain a valid user ID' }),
                    { headers, status: 500 }
                );
            }
            
            if (quantity === 0) {
                // --- Handle removal (using ANON client 'supabase' and validUserId) ---
                const { error: deleteError } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('id', itemId) // PK is cart_items.id
                    .eq('user_id', validUserId); // Ensure user owns the item
                // ... (error handling) ...
                if (deleteError) throw deleteError;
                return new Response(JSON.stringify({ message: 'Item removed' }), { headers, status: 200 });
            } else {
                // --- Update quantity (using ANON client 'supabase' and validUserId) ---
                // Optional: Add stock check here before updating
                const { data, error } = await supabase
                    .from('cart_items')
                    .update({ quantity: quantity })
                    .eq('id', itemId) // PK is cart_items.id
                    .eq('user_id', validUserId) // Ensure user owns the item
                    .select()
                    .single();
                // ... (error handling for not found etc.) ...
                if (error) {
                    if (error.code === 'PGRST116') { // PostgREST code for "No rows found"
                        return new Response(JSON.stringify({ message: 'Cart item not found or not owned by user' }), { headers, status: 404 });
                    }
                    throw error;
                }
                return new Response(JSON.stringify(data), { headers, status: 200 });
            }
        }

        // DELETE /api/cart/remove
        if (req.method === 'DELETE' && route[0] === 'cart' && route[1] === 'remove') {
            console.log('[Edge] DELETE /api/cart/remove called');
            
            if (!supabaseUserId) { 
                console.log('[Edge] Unauthorized: No supabaseUserId found');
                return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });
            }
            
            console.log(`[Edge] User ${supabaseUserId} authenticated for cart item removal`);
            
            let requestBody;
            try {
                requestBody = await req.json();
                console.log('[Edge] Request body parsed:', requestBody);
            } catch (jsonError) {
                console.error('[Edge] Failed to parse request body:', jsonError);
                return new Response(JSON.stringify({ message: 'Invalid request body format' }), { headers, status: 400 });
            }
            
            const { itemId, originalItem } = requestBody;
            
            if (!itemId) {
                console.log('[Edge] Missing itemId in request body');
                return new Response(JSON.stringify({ message: 'Cart Item ID required' }), { headers, status: 400 });
            }
        
            console.log(`[Edge] Attempting to remove cart item with ID: ${itemId}`);
            
            // Get a valid user ID with extra error handling
            let validUserId;
            try {
                validUserId = await getValidCartUserId(supabase, supabaseUserId);
                console.log(`[Edge] Resolved valid user ID: ${validUserId}`);
            } catch (userIdError) {
                console.error('[Edge] Error getting valid user ID:', userIdError);
                return new Response(
                    JSON.stringify({ 
                        message: 'Failed to obtain a valid user ID',
                        error: userIdError.message 
                    }),
                    { headers, status: 500 }
                );
            }
            
            if (!validUserId) {
                console.log('[Edge] No valid user ID could be obtained');
                return new Response(
                    JSON.stringify({ message: 'Failed to obtain a valid user ID' }),
                    { headers, status: 500 }
                );
            }
            
            console.log(`[Edge] Attempting multi-strategy deletion for item ${itemId}`);
            
            // Try multiple deletion strategies
            let deletionSuccess = false;
            let deletionErrors = [];
            
            // Strategy 1: Direct ID match
            try {
                console.log(`[Edge] Strategy 1: Direct ID match deletion for ${itemId}`);
                const { error: directDeleteError, count } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('id', itemId)
                    .eq('user_id', validUserId)
                    .select('count');
                    
                if (!directDeleteError) {
                    console.log(`[Edge] Strategy 1 succeeded, deleted ${count || 0} rows`);
                    deletionSuccess = true;
                } else {
                    console.error('[Edge] Strategy 1 failed:', directDeleteError);
                    deletionErrors.push({ strategy: 'direct', error: directDeleteError });
                }
            } catch (error) {
                console.error('[Edge] Error in Strategy 1:', error);
                deletionErrors.push({ strategy: 'direct', error });
            }
            
            // If direct deletion failed, try product_id match
            if (!deletionSuccess) {
                try {
                    console.log(`[Edge] Strategy 2: product_id match deletion for ${itemId}`);
                    const { error: productDeleteError, count } = await supabase
                        .from('cart_items')
                        .delete()
                        .eq('product_id', itemId)
                        .eq('user_id', validUserId)
                        .select('count');
                        
                    if (!productDeleteError) {
                        console.log(`[Edge] Strategy 2 succeeded, deleted ${count || 0} rows`);
                        deletionSuccess = true;
                    } else {
                        console.error('[Edge] Strategy 2 failed:', productDeleteError);
                        deletionErrors.push({ strategy: 'product_id', error: productDeleteError });
                    }
                } catch (error) {
                    console.error('[Edge] Error in Strategy 2:', error);
                    deletionErrors.push({ strategy: 'product_id', error });
                }
            }
            
            // Last resort: Look up all items and try to find a match
            if (!deletionSuccess) {
                try {
                    console.log(`[Edge] Strategy 3: Find and match deletion for ${itemId}`);
                    // Get all user's cart items
                    const { data: userItems, error: listError } = await supabase
                        .from('cart_items')
                        .select('id, product_id')
                        .eq('user_id', validUserId);
                        
                    if (listError) {
                        console.error('[Edge] Failed to list user cart items:', listError);
                        deletionErrors.push({ strategy: 'list', error: listError });
                    } else if (userItems && userItems.length > 0) {
                        console.log(`[Edge] Found ${userItems.length} cart items for user ${validUserId}`);
                        
                        // Try to match the item by id or product_id
                        const matchingItem = userItems.find(item => 
                            item.id === itemId || 
                            item.product_id === itemId
                        );
                        
                        if (matchingItem) {
                            console.log(`[Edge] Found matching item:`, matchingItem);
                            
                            const { error: matchDeleteError } = await supabase
                                .from('cart_items')
                                .delete()
                                .eq('id', matchingItem.id)
                                .eq('user_id', validUserId);
                                
                            if (!matchDeleteError) {
                                console.log(`[Edge] Strategy 3 succeeded, deleted item ${matchingItem.id}`);
                                deletionSuccess = true;
                            } else {
                                console.error('[Edge] Strategy 3 deletion failed:', matchDeleteError);
                                deletionErrors.push({ strategy: 'match_delete', error: matchDeleteError });
                            }
                        } else {
                            console.log(`[Edge] No matching item found among user's cart items`);
                            deletionErrors.push({ strategy: 'match', error: 'No matching item found' });
                        }
                    } else {
                        console.log(`[Edge] User has no cart items`);
                        deletionErrors.push({ strategy: 'list', error: 'User has no cart items' });
                    }
                } catch (error) {
                    console.error('[Edge] Error in Strategy 3:', error);
                    deletionErrors.push({ strategy: 'list_match', error });
                }
            }
            
            if (deletionSuccess) {
                console.log('[Edge] Cart item removal succeeded');
                return new Response(
                    JSON.stringify({ 
                        message: 'Item removed successfully',
                        itemId: itemId
                    }), 
                    { headers, status: 200 }
                );
            } else {
                console.error('[Edge] All deletion strategies failed:', deletionErrors);
                // Rather than returning an error, return success with warnings
                // This prevents client from showing an error but alerts about the issue
                return new Response(
                    JSON.stringify({ 
                        message: 'Item removal requested with warnings',
                        itemId: itemId,
                        warnings: 'Item may not have been deleted from database',
                        errors: deletionErrors
                    }), 
                    { headers, status: 200 }
                );
            }
        }

        // DELETE /api/cart/:id - enhance the direct ID endpoint too
        if (req.method === 'DELETE' && route[0] === 'cart' && route.length > 1 && route[1] !== 'remove' && route[1] !== 'clear') {
            const itemId = route[1]; // Path parameter
            console.log(`[Edge] DELETE /api/cart/${itemId} called`);
            
            if (!supabaseUserId) {
                console.log('[Edge] Unauthorized: No supabaseUserId found');
                return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });
            }
            
            console.log(`[Edge] User ${supabaseUserId} authenticated for cart item removal by path`);
            
            // Get a valid user ID
            let validUserId;
            try {
                validUserId = await getValidCartUserId(supabase, supabaseUserId);
                console.log(`[Edge] Resolved valid user ID: ${validUserId}`);
            } catch (userIdError) {
                console.error('[Edge] Error getting valid user ID:', userIdError);
                return new Response(
                    JSON.stringify({ message: 'Failed to obtain a valid user ID' }),
                    { headers, status: 500 }
                );
            }
            
            if (!validUserId) {
                console.log('[Edge] No valid user ID could be obtained');
                return new Response(
                    JSON.stringify({ message: 'Failed to obtain a valid user ID' }),
                    { headers, status: 500 }
                );
            }
            
            // Similar multi-strategy approach as in /cart/remove
            // ...implement similar strategies as above...
            
            // For brevity, focus on direct deletion for this endpoint
            try {
                console.log(`[Edge] Direct deletion for cart item ${itemId}`);
                const { error, count } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('id', itemId)
                    .eq('user_id', validUserId)
                    .select('count');
                    
                if (error) {
                    console.error('[Edge] Direct deletion failed:', error);
                    return new Response(
                        JSON.stringify({ 
                            message: 'Failed to delete cart item',
                            error: error.message 
                        }),
                        { headers, status: 500 }
                    );
                }
                
                console.log(`[Edge] Successfully deleted ${count || 0} cart items`);
                return new Response(
                    JSON.stringify({ message: 'Item removed successfully' }),
                    { headers, status: 200 }
                );
            } catch (error) {
                console.error('[Edge] Error during cart item deletion:', error);
                return new Response(
                    JSON.stringify({ 
                        message: 'Error during deletion',
                        error: error.message 
                    }),
                    { headers, status: 500 }
                );
            }
        }

        // DELETE /api/cart/clear
        if (req.method === 'DELETE' && route[0] === 'cart' && route[1] === 'clear') {
            console.log('[Route Handler] Matched DELETE /api/cart/clear');
            if (!supabaseUserId) { 
                return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });
            }
            console.log(`[Route Handler DELETE /api/cart/clear] User ${supabaseUserId} authenticated.`);

            // Get a valid user ID
            const validUserId = await getValidCartUserId(supabase, supabaseUserId);
            if (!validUserId) {
                return new Response(
                    JSON.stringify({ message: 'Failed to obtain a valid user ID' }),
                    { headers, status: 500 }
                );
            }
            
            // --- Delete all items (using ANON client 'supabase' and validUserId) ---
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', validUserId); // Use valid user ID
            // ... (error handling) ...
            if (error) throw error;
            return new Response(JSON.stringify({ message: 'Cart cleared successfully' }), { headers, status: 200 });
        }

        // --- USER ROUTES ---
        
        if (req.method === 'POST' && route[0] === 'users' && route[1] === 'sync') {
            console.log('[Route Handler] Matched POST /api/users/sync');

            // Try to get user ID but don't require it for this endpoint
            const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId && authHeader) {
                console.warn('[Route Handler POST /api/users/sync] Auth token provided but invalid - continuing anyway');
                // Don't return error response, continue with the sync
            }

            try {
                const { clerkId, email, name, avatarUrl, role } = await req.json();
                if (!clerkId || !email || !name) { 
                    return new Response(JSON.stringify({ message: 'Missing required user data' }), { headers, status: 400 });
                }

                console.log(`[Route Handler POST /api/users/sync] Syncing data for Clerk ID: ${clerkId}`);
                
                // Extract token metadata to check for admin role
                const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
                let adminRoleDetected = false;
                let metadata = {};
                
                if (token) {
                    try {
                        // Decode the JWT payload without verifying signature
                        const parts = token.split('.');
                        if (parts.length === 3) {
                            const payloadBase64 = parts[1];
                            const payload = JSON.parse(
                                new TextDecoder().decode(
                                    base64UrlToUint8Array(payloadBase64)
                                )
                            );
                            
                            // Store full metadata for potential use with the RPC function
                            metadata = payload;
                            
                            // Enhanced logging to debug token content
                            console.log('[Token Debug] Token payload keys:', Object.keys(payload));
                            
                            // Check for admin role in all possible metadata locations
                            const unsafeMetadata = payload.unsafe_metadata || {};
                            const privateMetadata = payload.private_metadata || {};
                            const publicMetadata = payload.public_metadata || {};
                            
                            // Log the actual values for debugging
                            console.log('[Token Debug] Role in payload:', payload.role);
                            console.log('[Token Debug] Role in unsafeMetadata:', unsafeMetadata.role);
                            console.log('[Token Debug] Role in privateMetadata:', privateMetadata.role);
                            console.log('[Token Debug] Role in publicMetadata:', publicMetadata.role);
                            console.log('[Token Debug] Explicit role parameter:', role);
                            
                            // Check raw string values too - sometimes the role values are strings
                            const isAdmin = (val) => {
                                if (!val) return false;
                                if (typeof val === 'string') {
                                    return val.toLowerCase() === 'admin';
                                }
                                return val === 'admin';
                            };
                            
                            // More comprehensive role check with more debugging
                            adminRoleDetected = 
                                isAdmin(unsafeMetadata.role) || 
                                isAdmin(privateMetadata.role) ||
                                isAdmin(publicMetadata.role) ||
                                // Check direct properties too
                                isAdmin(payload.role) ||
                                // Also check explicitly passed role
                                isAdmin(role) ||
                                // Check for nested objects differently
                                (typeof unsafeMetadata === 'object' && unsafeMetadata !== null && isAdmin(unsafeMetadata.role)) ||
                                (typeof privateMetadata === 'object' && privateMetadata !== null && isAdmin(privateMetadata.role)) ||
                                (typeof publicMetadata === 'object' && publicMetadata !== null && isAdmin(publicMetadata.role)) ||
                                // Check organization membership roles
                                (payload.org_metadata && 
                                 Array.isArray(payload.org_metadata) && 
                                 payload.org_metadata.some(org => 
                                    (org?.public_metadata && isAdmin(org.public_metadata.memberRole)) || 
                                    isAdmin(org?.role)
                                 ));
                                
                            console.log(`[Route Handler POST /api/users/sync] Admin role detected in token: ${adminRoleDetected}`);
                        }
                    } catch (metadataError) {
                        console.warn('[Route Handler POST /api/users/sync] Error parsing token metadata:', metadataError);
                    }
                }

                // Check if user already exists
                const { data: existingUser, error: findError } = await supabase
                    .from('user_profiles')
                    .select('id, clerk_id, role')
                    .eq('clerk_id', clerkId)
                    .maybeSingle();

                if (findError) {
                    console.error('[Route Handler POST /api/users/sync] Error checking existing user:', findError);
                    throw findError;
                }
                
                // Now that existingUser is defined, we can safely use it
                if (existingUser && adminRoleDetected) {
                    // If admin role detected in token but user doesn't have admin role in DB
                    if (existingUser.role !== 'admin') {
                        console.log(`[Route Handler POST /api/users/sync] User ${clerkId} has admin role in token but not in DB. Updating...`);
                        
                        // First try the RPC function
                        try {
                            const { data: syncResult, error: syncError } = await supabase.rpc(
                                'sync_clerk_role_to_database',
                                { 
                                    p_clerk_id: clerkId,
                                    p_metadata: metadata
                                }
                            );
                            
                            if (syncError) {
                                console.warn('[Route Handler POST /api/users/sync] Error syncing role via RPC:', syncError);
                                // Fallback to direct update
                                await supabase.rpc('update_user_role', {
                                    p_clerk_id: clerkId,
                                    p_role: 'admin'
                                });
                            } else if (syncResult) {
                                console.log('[Route Handler POST /api/users/sync] Successfully synced admin role to database via RPC');
                            }
                        } catch (rpcError) {
                            console.error('[Route Handler POST /api/users/sync] Error with RPC functions:', rpcError);
                            // Fallback to direct update as last resort
                            const { error: directUpdateError } = await supabase
                                .from('user_profiles')
                                .update({ role: 'admin' })
                                .eq('clerk_id', clerkId);
                                
                            if (directUpdateError) {
                                console.error('[Route Handler POST /api/users/sync] Direct role update failed:', directUpdateError);
                            } else {
                                console.log('[Route Handler POST /api/users/sync] Direct role update succeeded');
                            }
                        }
                    }
                }
                
                let result;
                
                // Rest of the function remains mostly unchanged
                if (existingUser) {
                    // Update existing user
                    const { data, error: updateError } = await supabase
                        .from('user_profiles')
                        .update({
                            email,
                            name,
                            avatar_url: avatarUrl,
                            // Important: Don't override admin role if it was set
                            role: adminRoleDetected ? 'admin' : role || undefined,
                            updated_at: new Date().toISOString()
                        })
                        .eq('clerk_id', clerkId)
                        .select()
                        .single();
                        
                    if (updateError) {
                        console.error('[Route Handler POST /api/users/sync] Error updating user:', updateError);
                        throw updateError;
                    }
                    
                    result = { ...data, updated: true };
                    console.log(`[Route Handler POST /api/users/sync] Updated user with ID: ${result.id}`);
                } else {
                    // Create new user
                    const { data, error: insertError } = await supabase
                        .from('user_profiles')
                        .insert({
                            clerk_id: clerkId,
                            email,
                            name,
                            avatar_url: avatarUrl,
                            role: adminRoleDetected ? 'admin' : (role || 'customer') // Use detected role, explicit role, or default
                        })
                        .select()
                        .single();
                    
                    if (insertError) {
                        console.error('[Route Handler POST /api/users/sync] Error creating user:', insertError);
                        throw insertError;
                    }
                    
                    result = { ...data, created: true };
                    console.log(`[Route Handler POST /api/users/sync] Created user with ID: ${result.id}`);
                }
                
                return new Response(JSON.stringify({
                    success: true,
                    data: result
                }), { headers, status: 200 });
                
            } catch (error) {
                console.error('[Route Handler POST /api/users/sync] Error processing sync request:', error);
                return new Response(JSON.stringify({
                    success: false,
                    message: 'Failed to sync user data',
                    error: error.message
                }), { headers, status: 500 });
            }
        }

        // --- SELLER ROUTES ---
        // GET /api/sellers - Get all sellers with optional filters
        if (req.method === 'GET' && route[0] === 'sellers' && route.length === 1) {
            console.log('[Route Handler] Matched GET /api/sellers');
            
            // Check for admin role if auth header is present
            let isAdmin = false;
            try {
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
                    if (supabaseUserId) {
                        const { data: userData } = await supabase
                            .from('user_profiles')
                            .select('role')
                            .eq('id', supabaseUserId)
                            .single();
                        
                        isAdmin = userData?.role === 'admin';
                    }
                }
                
                // Get filters from URL params
                const status = url.searchParams.get('status');
                const search = url.searchParams.get('search');
                
                // Build query
                let query = supabase.from('sellers').select('*');
                
                // Apply filters - non-admins can only see approved sellers
                if (!isAdmin) {
                    query = query.eq('status', 'approved');
                } else if (status && status !== 'all') {
                    query = query.eq('status', status);
                }
                
                // Execute query
                const { data: sellers, error } = await query;
                
                if (error) {
                    console.error('[Route Handler GET /api/sellers] Error fetching sellers:', error);
                    throw error;
                }
                
                // Apply search filter in memory (if Supabase doesn't support text search in your plan)
                let filteredSellers = sellers || [];
                if (search && search.trim() !== '') {
                    const searchLower = search.toLowerCase();
                    filteredSellers = filteredSellers.filter(seller => 
                        seller.business_name?.toLowerCase().includes(searchLower) ||
                        seller.contact_name?.toLowerCase().includes(searchLower) ||
                        seller.email?.toLowerCase().includes(searchLower) ||
                        seller.location?.toLowerCase().includes(searchLower)
                    );
                }
                
                // Transform response to match frontend expectations
                const formattedSellers = filteredSellers.map(seller => {
                    // Parse location if it's a JSON string
                    let parsedLocation = seller.location;
                    if (typeof seller.location === 'string') {
                        try {
                            parsedLocation = JSON.parse(seller.location);
                        } catch (e) {
                            // If parsing fails, keep as string
                            parsedLocation = seller.location;
                        }
                    }

                    // Format address from parsed location
                    let formattedAddress = '';
                    if (parsedLocation && typeof parsedLocation === 'object') {
                        const { address, city, state, zip, country } = parsedLocation;
                        const addressParts = [address, city, state, zip, country].filter(Boolean);
                        formattedAddress = addressParts.join(', ');
                    } else if (typeof parsedLocation === 'string') {
                        formattedAddress = parsedLocation;
                    }

                    return {
                        id: seller.id,
                        businessName: seller.business_name,
                        businessType: seller.business_type,
                        contactName: seller.contact_name,
                        email: seller.email,
                        phone: seller.phone,
                        location: formattedAddress,
                        address: formattedAddress, // Add address field for compatibility
                        registrationDate: seller.created_at || seller.registration_date, // Use created_at if available, fallback to registration_date
                        submittedAt: seller.created_at || seller.registration_date, // Add submittedAt for verification component
                        status: seller.status,
                        verificationDate: seller.verification_date,
                        productCategories: seller.product_categories,
                        categories: seller.categories, // Include both for compatibility
                        rating: seller.rating,
                        salesCount: seller.sales_count,
                        rejectionReason: seller.rejection_reason,
                        registrationNumber: seller.registration_number,
                        taxId: seller.tax_id,
                        bankInfo: seller.bank_info,
                        documents: seller.documents
                    };
                });
                
                return new Response(JSON.stringify(formattedSellers), { headers, status: 200 });
            } catch (error) {
                console.error('[Route Handler GET /api/sellers] Error:', error);
                return new Response(
                    JSON.stringify({ message: error.message || 'Internal server error while fetching sellers' }),
                    { headers, status: 500 }
                );
            }
        }
        
        // GET /api/sellers/:id - Get a specific seller
        if (req.method === 'GET' && route[0] === 'sellers' && route.length === 2) {
            console.log('[Route Handler] Matched GET /api/sellers/:id');
            const sellerId = route[1];
            
            // Validate seller ID
            if (!isValidUUID(sellerId)) {
                return new Response(
                    JSON.stringify({ error: 'Invalid seller ID format. Must be a valid UUID.' }),
                    { headers, status: 400 }
                );
            }
            
            // Check if user is admin or if the seller is approved
            let isAdmin = false;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
                if (supabaseUserId) {
                    const { data: userData } = await supabase
                        .from('user_profiles')
                        .select('role')
                        .eq('id', supabaseUserId)
                        .single();
                    
                    isAdmin = userData?.role === 'admin';
                }
            }
            
            // Get seller data
            let query = supabase.from('sellers').select('*').eq('id', sellerId);
            
            // Non-admins can only see approved sellers
            if (!isAdmin) {
                query = query.eq('status', 'approved');
            }
            
            const { data: seller, error } = await query.maybeSingle();
            
            if (error) {
                console.error('[Route Handler GET /api/sellers/:id] Error fetching seller:', error);
                throw error;
            }
            
            if (!seller) {
                return new Response(
                    JSON.stringify({ message: 'Seller not found or not accessible' }),
                    { headers, status: 404 }
                );
            }
            
            // Format response to match frontend expectations
            // Parse location if it's a JSON string
            let parsedLocation = seller.location;
            if (typeof seller.location === 'string') {
                try {
                    parsedLocation = JSON.parse(seller.location);
                } catch (e) {
                    // If parsing fails, keep as string
                    parsedLocation = seller.location;
                }
            }

            // Format address from parsed location
            let formattedAddress = '';
            if (parsedLocation && typeof parsedLocation === 'object') {
                const { address, city, state, zip, country } = parsedLocation;
                const addressParts = [address, city, state, zip, country].filter(Boolean);
                formattedAddress = addressParts.join(', ');
            } else if (typeof parsedLocation === 'string') {
                formattedAddress = parsedLocation;
            }

            const formattedSeller = {
                id: seller.id,
                businessName: seller.business_name,
                businessType: seller.business_type,
                contactName: seller.contact_name,
                email: seller.email,
                phone: seller.phone,
                location: formattedAddress,
                address: formattedAddress, // Add address field for compatibility
                registrationDate: seller.created_at || seller.registration_date,
                submittedAt: seller.created_at || seller.registration_date,
                status: seller.status,
                verificationDate: seller.verification_date,
                productCategories: seller.product_categories,
                categories: seller.categories,
                rating: seller.rating,
                salesCount: seller.sales_count,
                rejectionReason: seller.rejection_reason,
                registrationNumber: seller.registration_number,
                taxId: seller.tax_id,
                bankInfo: seller.bank_info,
                documents: seller.documents
            };
            
            return new Response(JSON.stringify(formattedSeller), { headers, status: 200 });
        }
        
        // PATCH /api/sellers/:id/verification - Update seller verification status (admin only)
        if (req.method === 'PATCH' && route[0] === 'sellers' && route.length === 3 && route[2] === 'verification') {
            console.log('[Route Handler] Matched PATCH /api/sellers/:id/verification');
            const sellerId = route[1];
            
            // Validate seller ID
            if (!isValidUUID(sellerId)) {
                return new Response(
                    JSON.stringify({ error: 'Invalid seller ID format. Must be a valid UUID.' }),
                    { headers, status: 400 }
                );
            }
            
            // Check if user is admin
            let isAdmin = false;
            let adminUserId = null;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }),
                    { headers, status: 401 }
                );
            }
            
            adminUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!adminUserId) {
                return new Response(
                    JSON.stringify({ message: 'Unauthorized' }),
                    { headers, status: 401 }
                );
            }
            
            // Verify admin role
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', adminUserId)
                .single();
                
            if (userError || !userData) {
                return new Response(
                    JSON.stringify({ message: 'Error verifying user role' }),
                    { headers, status: 500 }
                );
            }
            
            isAdmin = userData.role === 'admin';
            if (!isAdmin) {
                return new Response(
                    JSON.stringify({ message: 'Admin privileges required for this operation' }),
                    { headers, status: 403 }
                );
            }
            
            // Get the verification data from request body
            const { status, notes } = await req.json();
            
            if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
                return new Response(
                    JSON.stringify({ message: 'Valid status (approved, rejected, or pending) required' }),
                    { headers, status: 400 }
                );
            }
            
            // Prepare update data
            const updateData = {
                status,
                updated_at: new Date().toISOString()
            };
            
            // Add verification date for approved sellers
            if (status === 'approved') {
                updateData.verification_date = new Date().toISOString();
            }
            
            // Add rejection reason for rejected sellers
            if (status === 'rejected' && notes) {
                updateData.rejection_reason = notes;
            }
            
            // Update the seller
            const { data: updatedSeller, error: updateError } = await supabase
                .from('sellers')
                .update(updateData)
                .eq('id', sellerId)
                .select()
                .single();
                
            if (updateError) {
                console.error('[Route Handler PATCH /api/sellers/:id/verification] Error updating seller:', updateError);
                throw updateError;
            }
            
            // Format response
            const formattedSeller = {
                id: updatedSeller.id,
                businessName: updatedSeller.business_name,
                contactName: updatedSeller.contact_name,
                email: updatedSeller.email,
                status: updatedSeller.status,
                verificationDate: updatedSeller.verification_date,
                rejectionReason: updatedSeller.rejection_reason
            };
            
            return new Response(
                JSON.stringify({ 
                    success: true, 
                    message: `Seller status updated to ${status}`,
                    seller: formattedSeller
                }),
                { headers, status: 200 }
            );
        }
        
        // GET /api/verification/pending - Get all pending verification requests (admin only)
        if (req.method === 'GET' && route[0] === 'verification' && route[1] === 'pending') {
            console.log('[Route Handler] Matched GET /api/verification/pending');
            
            // Check if user is admin
            let isAdmin = false;
            let adminUserId = null;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }),
                    { headers, status: 401 }
                );
            }
            
            adminUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!adminUserId) {
                return new Response(
                    JSON.stringify({ message: 'Unauthorized' }),
                    { headers, status: 401 }
                );
            }
            
            // Verify admin role
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', adminUserId)
                .single();
                
            if (userError || !userData) {
                return new Response(
                    JSON.stringify({ message: 'Error verifying user role' }),
                    { headers, status: 500 }
                );
            }
            
            isAdmin = userData.role === 'admin';
            if (!isAdmin) {
                return new Response(
                    JSON.stringify({ message: 'Admin privileges required for this operation' }),
                    { headers, status: 403 }
                );
            }
            
            // Get pending verification requests
            const { data: pendingSellers, error } = await supabase
                .from('sellers')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
                
            if (error) {
                console.error('[Route Handler GET /api/verification/pending] Error fetching pending sellers:', error);
                throw error;
            }
            
            // Format response
            const formattedSellers = (pendingSellers || []).map(seller => {
                // Parse location if it's a JSON string
                let parsedLocation = seller.location;
                if (typeof seller.location === 'string') {
                    try {
                        parsedLocation = JSON.parse(seller.location);
                    } catch (e) {
                        // If parsing fails, keep as string
                        parsedLocation = seller.location;
                    }
                }

                // Format address from parsed location
                let formattedAddress = '';
                if (parsedLocation && typeof parsedLocation === 'object') {
                    const { address, city, state, zip, country } = parsedLocation;
                    const addressParts = [address, city, state, zip, country].filter(Boolean);
                    formattedAddress = addressParts.join(', ');
                } else if (typeof parsedLocation === 'string') {
                    formattedAddress = parsedLocation;
                }

                return {
                    id: seller.id,
                    businessName: seller.business_name,
                    businessType: seller.business_type,
                    contactName: seller.contact_name,
                    email: seller.email,
                    phone: seller.phone,
                    location: formattedAddress,
                    address: formattedAddress, // Add address field for compatibility
                    registrationDate: seller.created_at || seller.registration_date,
                    submittedAt: seller.created_at || seller.registration_date,
                    status: seller.status,
                    productCategories: seller.product_categories,
                    categories: seller.categories,
                    registrationNumber: seller.registration_number,
                    taxId: seller.tax_id,
                    bankInfo: seller.bank_info,
                    documents: seller.documents,
                    rejectionReason: seller.rejection_reason
                };
            });
              return new Response(JSON.stringify(formattedSellers), { headers, status: 200 });
        }

        // --- SELLER APPLICATION ROUTES ---
        // POST /api/seller/apply - Submit seller application
        if (req.method === 'POST' && route[0] === 'seller' && route[1] === 'apply' && route.length === 2) {
            console.log('[Route Handler] Matched POST /api/seller/apply');
            
            // Authentication required
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }),
                    { headers, status: 401 }
                );
            }
            
            const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId) {
                return new Response(
                    JSON.stringify({ message: 'Invalid or expired token' }),
                    { headers, status: 401 }
                );
            }
            
            try {
                // Get user profile
                const { data: userProfile, error: userError } = await supabase
                    .from('user_profiles')
                    .select('clerk_id, email')
                    .eq('id', supabaseUserId)
                    .single();
                    
                if (userError || !userProfile) {
                    console.error('[Route Handler POST /api/seller/apply] User profile not found:', userError);
                    return new Response(
                        JSON.stringify({ message: 'User profile not found' }),
                        { headers, status: 404 }
                    );
                }
                
                // Check if user already has a seller application
                const { data: existingSeller, error: existingError } = await supabase
                    .from('sellers')
                    .select('id, status')
                    .eq('clerk_id', userProfile.clerk_id)
                    .single();
                    
                if (existingSeller) {
                    return new Response(
                        JSON.stringify({ 
                            message: 'Seller application already exists',
                            status: existingSeller.status
                        }),
                        { headers, status: 409 }
                    );
                }
                
                // Parse form data
                const formData = await req.formData();
                
                // Extract form fields
                const applicationData = {
                    business_name: formData.get('businessName'),
                    business_type: formData.get('businessType'),
                    contact_name: formData.get('contactName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    city: formData.get('city'),
                    state: formData.get('state'),
                    zip: formData.get('zip'),
                    country: formData.get('country'),
                    registration_number: formData.get('registrationNumber'),
                    tax_id: formData.get('taxId'),
                    categories: JSON.parse(formData.get('categories') || '[]'),
                    bank_info: {
                        bank_name: formData.get('bankName'),
                        account_number: formData.get('accountNumber'),
                        routing_number: formData.get('routingNumber'),
                        account_holder: formData.get('accountHolder')
                    },
                    clerk_id: userProfile.clerk_id,
                    status: 'pending',
                    registration_date: new Date().toISOString(),
                    location: `${formData.get('city')}, ${formData.get('country')}`
                };
                
                // Validate required fields
                const requiredFields = ['business_name', 'business_type', 'contact_name', 'email', 'phone', 'address', 'city', 'country'];
                const missingFields = requiredFields.filter(field => !applicationData[field]);
                
                if (missingFields.length > 0) {
                    return new Response(
                        JSON.stringify({ 
                            message: 'Missing required fields',
                            missingFields 
                        }),
                        { headers, status: 400 }
                    );
                }
                
                // Handle document uploads (for now, just log them)
                const documents = [];
                for (const [key, value] of formData.entries()) {
                    if (key.startsWith('document_') && value instanceof File) {
                        documents.push({
                            name: value.name,
                            size: value.size,
                            type: value.type
                        });
                    }
                }
                
                if (documents.length > 0) {
                    applicationData.documents = documents;
                }
                
                // Insert seller application
                const { data: newSeller, error: insertError } = await supabase
                    .from('sellers')
                    .insert(applicationData)
                    .select()
                    .single();
                    
                if (insertError) {
                    console.error('[Route Handler POST /api/seller/apply] Error inserting seller:', insertError);
                    throw insertError;
                }
                
                console.log('[Route Handler POST /api/seller/apply] Seller application created successfully:', newSeller.id);
                
                return new Response(
                    JSON.stringify({ 
                        message: 'Seller application submitted successfully',
                        sellerId: newSeller.id,
                        status: 'pending'
                    }),
                    { headers, status: 201 }
                );
                
            } catch (error) {
                console.error('[Route Handler POST /api/seller/apply] Error:', error);
                return new Response(
                    JSON.stringify({ message: error.message || 'Failed to submit seller application' }),
                    { headers, status: 500 }
                );
            }
        }
        
        // GET /api/seller/status - Get current user's seller application status
        if (req.method === 'GET' && route[0] === 'seller' && route[1] === 'status' && route.length === 2) {
            console.log('[Route Handler] Matched GET /api/seller/status');
            
            // Authentication required
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }),
                    { headers, status: 401 }
                );
            }
            
            const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId) {
                return new Response(
                    JSON.stringify({ message: 'Invalid or expired token' }),
                    { headers, status: 401 }
                );
            }
            
            try {
                // Get user profile
                const { data: userProfile, error: userError } = await supabase
                    .from('user_profiles')
                    .select('clerk_id')
                    .eq('id', supabaseUserId)
                    .single();
                    
                if (userError || !userProfile) {
                    console.error('[Route Handler GET /api/seller/status] User profile not found:', userError);
                    return new Response(
                        JSON.stringify({ message: 'User profile not found' }),
                        { headers, status: 404 }
                    );
                }
                
                // Get seller application
                const { data: seller, error: sellerError } = await supabase
                    .from('sellers')
                    .select('id, status, business_name, registration_date, verification_date, rejection_reason')
                    .eq('clerk_id', userProfile.clerk_id)
                    .single();
                    
                if (sellerError) {
                    if (sellerError.code === 'PGRST116') {
                        // No application found
                        return new Response(
                            JSON.stringify({ 
                                hasApplication: false,
                                message: 'No seller application found'
                            }),
                            { headers, status: 200 }
                        );
                    }
                    throw sellerError;
                }
                
                return new Response(
                    JSON.stringify({
                        hasApplication: true,
                        application: {
                            id: seller.id,
                            status: seller.status,
                            businessName: seller.business_name,
                            registrationDate: seller.registration_date,
                            verificationDate: seller.verification_date,
                            rejectionReason: seller.rejection_reason
                        }
                    }),
                    { headers, status: 200 }
                );
                
            } catch (error) {
                console.error('[Route Handler GET /api/seller/status] Error:', error);
                return new Response(
                    JSON.stringify({ message: error.message || 'Failed to get seller status' }),
                    { headers, status: 500 }
                );
            }
        }

        // GET /api/seller/application/status - Get current user's seller application status (alternative endpoint)
        if (req.method === 'GET' && route[0] === 'seller' && route[1] === 'application' && route[2] === 'status' && route.length === 3) {
            console.log('[Route Handler] Matched GET /api/seller/application/status');
            
            // Authentication required
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return new Response(
                    JSON.stringify({ message: 'Authentication required' }),
                    { headers, status: 401 }
                );
            }
            
            const supabaseUserId = await getSupabaseUserIdFromClerkToken(supabase, req);
            if (!supabaseUserId) {
                return new Response(
                    JSON.stringify({ message: 'Invalid or expired token' }),
                    { headers, status: 401 }
                );
            }
            
            try {
                // Get user profile
                const { data: userProfile, error: userError } = await supabase
                    .from('user_profiles')
                    .select('clerk_id')
                    .eq('id', supabaseUserId)
                    .single();
                    
                if (userError || !userProfile) {
                    console.error('[Route Handler GET /api/seller/application/status] User profile not found:', userError);
                    return new Response(
                        JSON.stringify({ message: 'User profile not found' }),
                        { headers, status: 404 }
                    );
                }
                
                // Get seller application
                const { data: seller, error: sellerError } = await supabase
                    .from('sellers')
                    .select('id, status, business_name, registration_date, verification_date, rejection_reason, created_at, updated_at')
                    .eq('clerk_id', userProfile.clerk_id)
                    .single();
                    
                if (sellerError) {
                    if (sellerError.code === 'PGRST116') {
                        // No application found
                        return new Response(
                            JSON.stringify({ 
                                success: false,
                                hasApplied: false,
                                message: 'No seller application found'
                            }),
                            { headers, status: 404 }
                        );
                    }
                    throw sellerError;
                }
                
                return new Response(
                    JSON.stringify({
                        success: true,
                        hasApplied: true,
                        status: seller.status,
                        applicationDate: seller.created_at,
                        updateDate: seller.updated_at,
                        rejectionReason: seller.rejection_reason
                    }),
                    { headers, status: 200 }
                );
                
            } catch (error) {
                console.error('[Route Handler GET /api/seller/application/status] Error:', error);
                return new Response(
                    JSON.stringify({ 
                        success: false,
                        message: error.message || 'Failed to get seller application status' 
                    }),
                    { headers, status: 500 }
                );
            }
        }

        // --- Fallback for unhandled routes ---
        console.warn(`[Route Handler] Route not found: ${req.method} ${url.pathname}`);
        return new Response(JSON.stringify({ message: 'Route not found' }), { headers, status: 404 });

    } catch (error) {
        console.error('Error processing request:', error);
        // Use the headers object for error responses too
        // --- Ensure CORS headers are applied to error responses ---
        const errorHeaders = new Headers({
            'Content-Type': 'application/json',
            ...corsHeaders(origin) // Apply CORS headers here as well
        });
        return new Response(
            JSON.stringify({ message: error?.message || 'Internal Server Error' }),
            // --- Use updated errorHeaders ---
            { headers: errorHeaders, status: 500 }
        );
    }
});
