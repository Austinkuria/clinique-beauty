import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import * as djwt from "djwt";

// --- NEW: Helper to verify Clerk token and get Supabase User ID ---
async function getSupabaseUserIdFromClerkToken(supabaseAnonClient: SupabaseClient, req: Request): Promise<string | null> {
    console.log('[getSupabaseUserIdFromClerkToken] Attempting to verify Clerk token and find Supabase user ID...');
    const authHeader = req.headers.get('Authorization');
    const clerkPubKeyPem = Deno.env.get('CLERK_PEM_PUBLIC_KEY');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[getSupabaseUserIdFromClerkToken] No Bearer token found.');
        return null;
    }
    if (!clerkPubKeyPem) {
        console.error('[getSupabaseUserIdFromClerkToken] FATAL: CLERK_PEM_PUBLIC_KEY environment variable not set.');
        return null; // Or throw an internal server error
    }

    const token = authHeader.substring(7);

    try {
        // Import the public key
        const cryptoKey = await crypto.subtle.importKey(
            "spki",
            // Convert PEM to DER format suitable for importKey
            // Basic conversion: remove header/footer and line breaks
            (pemKey => {
                const base64 = pemKey
                    .replace(/-----BEGIN PUBLIC KEY-----/, '')
                    .replace(/-----END PUBLIC KEY-----/, '')
                    .replace(/\s+/g, '');
                const binaryDer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                return binaryDer;
            })(clerkPubKeyPem),
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            true,
            ["verify"]
        );

        // Verify the JWT signature and claims (like expiration)
        const payload = await djwt.verify(token, cryptoKey);
        console.log('[getSupabaseUserIdFromClerkToken] Clerk token verified successfully.');

        const clerkUserId = payload.sub; // Clerk User ID (e.g., user_xxxx)
        if (!clerkUserId || typeof clerkUserId !== 'string') {
            console.error('[getSupabaseUserIdFromClerkToken] Clerk User ID (sub) missing or invalid in token payload:', payload);
            return null;
        }
        console.log(`[getSupabaseUserIdFromClerkToken] Extracted Clerk User ID: ${clerkUserId}`);

        // --- Look up Supabase User ID in your linking table (e.g., 'profiles') ---
        // IMPORTANT: Use the ANON client for this lookup, as we don't have an authenticated Supabase client yet.
        const { data: profile, error: profileError } = await supabaseAnonClient
            .from('profiles') // ADJUST TABLE NAME if different
            .select('id') // Select the Supabase UUID column (assuming it's 'id')
            .eq('clerk_id', clerkUserId) // Match using the Clerk ID
            .single();

        if (profileError) {
            console.error(`[getSupabaseUserIdFromClerkToken] Error fetching profile for clerk_id ${clerkUserId}:`, profileError);
            return null;
        }

        if (!profile || !profile.id) {
            console.warn(`[getSupabaseUserIdFromClerkToken] No profile found linking clerk_id ${clerkUserId} to a Supabase user ID.`);
            return null;
        }

        console.log(`[getSupabaseUserIdFromClerkToken] Found Supabase User ID: ${profile.id}`);
        return profile.id; // Return the Supabase User UUID

    } catch (error) {
        console.error('[getSupabaseUserIdFromClerkToken] Error verifying Clerk token or fetching profile:', error.message);
        // Log specific JWT errors
        if (error instanceof djwt.errors.Expired || error.message.includes('expiration')) {
             console.error('[getSupabaseUserIdFromClerkToken] Token is expired.');
        } else if (error instanceof djwt.errors.Invalid || error.message.includes('signature')) {
             console.error('[getSupabaseUserIdFromClerkToken] Token signature is invalid.');
        }
        return null;
    }
}
// --- END NEW HELPER ---


// --- REMOVE OLD getUser HELPER ---
/*
async function getUser(supabaseClient: SupabaseClient, req: Request): Promise<User | null> {
    // ... (old implementation using supabaseClient.auth.getUser()) ...
}
*/
// --- END REMOVAL ---


// --- ADJUST getSupabaseClient ---
// This function now ONLY creates an ANON client, as auth is handled manually.
const getSupabaseAnonClient = (): SupabaseClient => {
    console.log('[getSupabaseAnonClient] Creating client with ANON KEY.');
    return createClient(
        Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
        Deno.env.get('PROJECT_SUPABASE_ANON_KEY') ?? ''
        // No global headers needed here
    );
};
// --- END ADJUSTMENT ---


serve(async (req: Request) => {
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
    });

    try {
        console.log(`[Request Start] ${req.method} ${req.url}`);
        // --- Use the ANON client for all operations initially ---
        const supabase = getSupabaseAnonClient();
        // --- END CHANGE ---

        const authHeader = req.headers.get('Authorization'); // Still useful for checks
        console.log(`[Request Handler] Authorization Header Present: ${!!authHeader}`);

        // --- Public Product Routes ---
        // GET /api/products
        if (req.method === 'GET' && route[0] === 'products' && route.length === 1) {
            console.log('[Route Handler] Matched GET /api/products'); // Log route match
            const category = url.searchParams.get('category');
            const subcategory = url.searchParams.get('subcategory');
            let query = supabase.from('products').select('*');
            if (category) {
                console.log(`[Route Handler GET /api/products] Filtering by category: ${category}`);
                query = query.eq('category', category);
            }
            if (subcategory) {
                console.log(`[Route Handler GET /api/products] Filtering by subcategory: ${subcategory}`);
                query = query.eq('subcategory', subcategory);
            }

            console.log('[Route Handler GET /api/products] Executing query...');
            const { data, error } = await query;

            if (error) {
                console.error('[Route Handler GET /api/products] Error fetching products:', error);
                throw error;
            }

            // --- Add Logging Here ---
            console.log(`[Route Handler GET /api/products] Query successful. Data received:`, data);
            console.log(`[Route Handler GET /api/products] Returning ${data?.length ?? 0} products.`);
            // --- End Logging ---

            return new Response(JSON.stringify(data || []), { headers, status: 200 });
        }
        // GET /api/products/:id
        if (req.method === 'GET' && route[0] === 'products' && route.length === 2) {
            // ... existing product/:id fetching logic ...
            const id = route[1];
            const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
            if (error) throw error;
            if (!data) return new Response(JSON.stringify({ message: 'Product not found' }), { headers, status: 404 });
            return new Response(JSON.stringify(data), { headers, status: 200 });
        }

        // --- Authenticated Cart Routes ---
        // Centralized Auth Check for all /cart routes
        let supabaseUserId: string | null = null; // Variable to hold the looked-up Supabase User ID
        if (route[0] === 'cart') {
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                 console.warn(`[Request Handler] Access denied to /api/${route.join('/')}: No valid Bearer token.`);
                 return new Response(JSON.stringify({ message: 'Authentication required' }), { headers, status: 401 });
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
            // --- Use supabaseUserId in query ---
            const { data: cartItems, error } = await supabase
                .from('cart_items')
                .select(`
                    quantity,
                    product_id,
                    products (
                        id, name, price, image, description, category, subcategory, stock
                    )
                `) // Keep your select statement
                .eq('user_id', supabaseUserId); // Use the looked-up UUID
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
            if (!supabaseUserId) { // Auth check
                 return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });
            }
            console.log(`[Route Handler POST /api/cart/add] User ${supabaseUserId} authenticated.`);
            const { productId, quantity, shade } = await req.json();
            if (!productId || !quantity || quantity < 1) { 
                return new Response(JSON.stringify({ message: 'Product ID and valid quantity required' }), { headers, status: 400 });
            }

            // --- Get Product Stock (using ANON client 'supabase') ---
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('stock')
                .eq('id', productId)
                .single();
            if (productError || !productData) { 
                return new Response(JSON.stringify({ message: 'Product not found or stock information unavailable' }), { headers, status: 404 });
            }
            const availableStock = productData.stock;

            // --- Check existing item (using ANON client 'supabase' and supabaseUserId) ---
            const { data: existingItem, error: findError } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('user_id', supabaseUserId) // Use looked-up UUID
                .eq('product_id', productId)
                .maybeSingle();
            if (findError) throw findError;

            let updatedOrNewItemId: string | null = null;
            let operationStatus = 200;

            if (existingItem) {
                // --- Update existing item (using ANON client 'supabase') ---
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > availableStock) { 
                    return new Response(JSON.stringify({ message: `Not enough stock. Only ${availableStock} available.` }), { headers, status: 400 });
                }
                const { data: updatedItem, error: updateError } = await supabase
                    .from('cart_items')
                    .update({ quantity: newQuantity, updated_at: new Date() })
                    .eq('id', existingItem.id) // PK is still cart_items.id
                    .select('id')
                    .single();
                // ... (error handling) ...
                if (updateError) throw updateError;
                updatedOrNewItemId = updatedItem.id;
            } else {
                // --- Insert new item (using ANON client 'supabase' and supabaseUserId) ---
                if (quantity > availableStock) { 
                    return new Response(JSON.stringify({ message: `Not enough stock. Only ${availableStock} available.` }), { headers, status: 400 });
                }
                const { data: newItem, error: insertError } = await supabase
                    .from('cart_items')
                    .insert({
                        user_id: supabaseUserId, // Use looked-up UUID
                        product_id: productId,
                        quantity: quantity,
                    })
                    .select('id')
                    .single();
                // ... (error handling) ...
                if (insertError) throw insertError;
                updatedOrNewItemId = newItem.id;
                operationStatus = 201;
            }
            // ... (Refetch item logic remains the same, using ANON client 'supabase') ...
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
                .eq('id', updatedOrNewItemId) // Use the ID from the insert/update result
                .single();

            if (finalError) {
                console.error("Error fetching final cart item details after add/update:", finalError);
                // If refetch fails, return a simple success message with the ID
                return new Response(JSON.stringify({ id: updatedOrNewItemId, message: "Operation successful, but failed to fetch full details." }), { headers, status: operationStatus });
            }

            // Format the final response similar to GET /cart item structure expected by client's formatCartItem
            const formattedItem = {
                cartItemId: finalItem.id, // Keep the actual cart_items PK if needed
                id: finalItem.product_id, // Product ID (used as primary ID in client state)
                quantity: finalItem.quantity,
                ...(finalItem.products || {}) // Spread product details
            };

            return new Response(JSON.stringify(formattedItem), { headers, status: operationStatus });
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

             if (quantity === 0) {
                 // --- Handle removal (using ANON client 'supabase' and supabaseUserId) ---
                 const { error: deleteError } = await supabase
                     .from('cart_items')
                     .delete()
                     .eq('id', itemId) // PK is cart_items.id
                     .eq('user_id', supabaseUserId); // Ensure user owns the item
                 // ... (error handling) ...
                 if (deleteError) throw deleteError;
                 return new Response(JSON.stringify({ message: 'Item removed' }), { headers, status: 200 });
             } else {
                 // --- Update quantity (using ANON client 'supabase' and supabaseUserId) ---
                 // Optional: Add stock check here before updating
                 const { data, error } = await supabase
                     .from('cart_items')
                     .update({ quantity: quantity })
                     .eq('id', itemId) // PK is cart_items.id
                     .eq('user_id', supabaseUserId) // Ensure user owns the item
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
             console.log('[Route Handler] Matched DELETE /api/cart/remove');
             if (!supabaseUserId) { 
                return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });
            }
             console.log(`[Route Handler DELETE /api/cart/remove] User ${supabaseUserId} authenticated.`);
             const { itemId } = await req.json();
             if (!itemId) { 
                return new Response(JSON.stringify({ message: 'Cart Item ID required' }), { headers, status: 400 });
            }

             // --- Delete item (using ANON client 'supabase' and supabaseUserId) ---
             const { error } = await supabase
                 .from('cart_items')
                 .delete()
                 .eq('id', itemId) // PK is cart_items.id
                 .eq('user_id', supabaseUserId); // Ensure user owns the item
             // ... (error handling) ...
             if (error) throw error; // Could include check for not found if needed
             return new Response(JSON.stringify({ message: 'Item removed successfully' }), { headers, status: 200 });
        }

        // DELETE /api/cart/clear
        if (req.method === 'DELETE' && route[0] === 'cart' && route[1] === 'clear') {
             console.log('[Route Handler] Matched DELETE /api/cart/clear');
             if (!supabaseUserId) { 
                return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });
            }
             console.log(`[Route Handler DELETE /api/cart/clear] User ${supabaseUserId} authenticated.`);

             // --- Delete all items (using ANON client 'supabase' and supabaseUserId) ---
             const { error } = await supabase
                 .from('cart_items')
                 .delete()
                 .eq('user_id', supabaseUserId); // Use looked-up UUID
             // ... (error handling) ...
             if (error) throw error;
             return new Response(JSON.stringify({ message: 'Cart cleared successfully' }), { headers, status: 200 });
        }

        // --- Fallback for unhandled routes ---
        console.warn(`[Route Handler] Route not found: ${req.method} ${url.pathname}`);
        return new Response(JSON.stringify({ message: 'Route not found' }), { headers, status: 404 });

    } catch (error) {
        console.error('Error processing request:', error);
        // Use the headers object for error responses too
        return new Response(
            JSON.stringify({ message: error?.message || 'Internal Server Error' }),
            { headers: headers, status: 500 }
        );
    }
});
