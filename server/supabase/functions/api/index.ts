import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'; // Assuming corsHeaders are defined in a shared file

// Define allowed origins - include your local dev and production URLs
const allowedOrigins = [
    'http://localhost:5173',
    'https://clinique-beauty.vercel.app' // Ensure this matches your Vercel URL exactly
];

// Helper to get user from JWT
async function getUser(supabaseClient: SupabaseClient): Promise<User | null> {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}


// Function to create Supabase client
const getSupabaseClient = (req: Request): SupabaseClient => {
    const authHeader = req.headers.get('Authorization');

    // If Authorization header exists, create client with user's auth context
    if (authHeader) {
        return createClient(
            Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
            Deno.env.get('PROJECT_SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } } // Pass the received token
        );
    }

    // Otherwise, create client using the ANON KEY (for public routes like getting products)
    // Note: Service Role Key should generally NOT be used directly in functions accessed by users.
    // Use RLS and user context instead. If you need elevated privileges, consider a separate secure function.
    return createClient(
        Deno.env.get('PROJECT_SUPABASE_URL') ?? '',
        Deno.env.get('PROJECT_SUPABASE_ANON_KEY') ?? ''
    );
};


serve(async (req: Request) => {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const apiPathIndex = pathSegments.findIndex(segment => segment === 'api');
    const route = pathSegments.slice(apiPathIndex + 1);

    const origin = req.headers.get('Origin');
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);

    // --- CORS Preflight Request Handling ---
    if (req.method === 'OPTIONS') {
        if (isAllowedOrigin) {
            return new Response('ok', { headers: corsHeaders(origin) }); // Use shared CORS headers
        } else {
            return new Response('Forbidden', { status: 403 });
        }
    }

    // --- Prepare Response Headers ---
    const headers = new Headers({
        'Content-Type': 'application/json',
        ...corsHeaders(origin) // Add CORS headers to actual responses
    });

    // --- API Routing ---
    try {
        const supabase = getSupabaseClient(req); // Get client (potentially authenticated)

        // --- Public Product Routes ---
        // GET /api/products
        if (req.method === 'GET' && route[0] === 'products' && route.length === 1) {
            // ... existing product fetching logic ...
            const category = url.searchParams.get('category');
            const subcategory = url.searchParams.get('subcategory');
            let query = supabase.from('products').select('*');
            if (category) query = query.eq('category', category);
            if (subcategory) query = query.eq('subcategory', subcategory);
            const { data, error } = await query;
            if (error) throw error;
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
        // Check for Authorization header for protected routes
        const authHeader = req.headers.get('Authorization');
        if (!authHeader && route[0] === 'cart') { // Protect all /cart routes
             return new Response(JSON.stringify({ message: 'Authentication required' }), { headers, status: 401 });
        }

        // GET /api/cart
        if (req.method === 'GET' && route[0] === 'cart' && route.length === 1) {
            const user = await getUser(supabase);
            if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });

            // Fetch cart items joined with product details for the user
            // Adjust table/column names ('cart_items', 'product_id', 'user_id', 'products(*)') as needed
            const { data: cartItems, error } = await supabase
                .from('cart_items')
                .select(`
                    quantity,
                    product_id,
                    products (
                        id, name, price, image, description, category, subcategory, stock
                    )
                `)
                .eq('user_id', user.id);

            if (error) throw error;

            // Format the response to match frontend expectations (flatten product details)
            const formattedCart = (cartItems || []).map(item => ({
                id: item.product_id, // Use product_id as the main ID for the cart item line
                quantity: item.quantity,
                ...(item.products || {}) // Spread product details
            }));

            return new Response(JSON.stringify(formattedCart || []), { headers, status: 200 });
        }

        // POST /api/cart/add
        if (req.method === 'POST' && route[0] === 'cart' && route[1] === 'add') {
            const user = await getUser(supabase);
            if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });

            const { productId, quantity, shade } = await req.json(); // Add shade if needed

            if (!productId || !quantity || quantity < 1) {
                return new Response(JSON.stringify({ message: 'Product ID and valid quantity required' }), { headers, status: 400 });
            }

            // Check if item already exists in cart for this user
            const { data: existingItem, error: findError } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('user_id', user.id)
                .eq('product_id', productId)
                // Add .eq('shade', shade) if tracking shades
                .maybeSingle();

            if (findError) throw findError;

            let resultData, resultError;

            if (existingItem) {
                // Update quantity
                const newQuantity = existingItem.quantity + quantity;
                const { data, error } = await supabase
                    .from('cart_items')
                    .update({ quantity: newQuantity })
                    .eq('id', existingItem.id)
                    .select() // Select updated item
                    .single(); // Expect single result
                resultData = data;
                resultError = error;
            } else {
                // Insert new item
                const { data, error } = await supabase
                    .from('cart_items')
                    .insert({
                        user_id: user.id,
                        product_id: productId,
                        quantity: quantity,
                        // shade: shade // Add shade if tracking
                    })
                    .select() // Select inserted item
                    .single(); // Expect single result
                resultData = data;
                resultError = error;
            }

            if (resultError) throw resultError;

            return new Response(JSON.stringify(resultData), { headers, status: 201 }); // 201 Created or 200 OK
        }

        // PUT /api/cart/update (or similar, e.g., /api/cart/item/:itemId)
        // Example using /api/cart/update with body { itemId, quantity }
        // Note: itemId here refers to the cart_items table primary key, NOT product_id
        if (req.method === 'PUT' && route[0] === 'cart' && route[1] === 'update') {
             const user = await getUser(supabase);
             if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });

             const { itemId, quantity } = await req.json();

             if (!itemId || quantity === undefined || quantity < 0) {
                 return new Response(JSON.stringify({ message: 'Cart Item ID and valid quantity required' }), { headers, status: 400 });
             }

             if (quantity === 0) {
                 // Handle removal if quantity is 0
                 const { error: deleteError } = await supabase
                     .from('cart_items')
                     .delete()
                     .eq('id', itemId)
                     .eq('user_id', user.id); // Ensure user owns the item

                 if (deleteError) throw deleteError;
                 return new Response(JSON.stringify({ message: 'Item removed' }), { headers, status: 200 });

             } else {
                 // Update quantity
                 const { data, error } = await supabase
                     .from('cart_items')
                     .update({ quantity: quantity })
                     .eq('id', itemId)
                     .eq('user_id', user.id) // Ensure user owns the item
                     .select()
                     .single();

                 if (error) {
                     if (error.code === 'PGRST116') { // PostgREST code for "No rows found"
                         return new Response(JSON.stringify({ message: 'Cart item not found or not owned by user' }), { headers, status: 404 });
                     }
                     throw error;
                 }
                 return new Response(JSON.stringify(data), { headers, status: 200 });
             }
        }


        // DELETE /api/cart/remove (or similar, e.g., /api/cart/item/:itemId)
        // Example using /api/cart/remove with body { itemId }
        if (req.method === 'DELETE' && route[0] === 'cart' && route[1] === 'remove') {
             const user = await getUser(supabase);
             if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });

             const { itemId } = await req.json();

             if (!itemId) {
                 return new Response(JSON.stringify({ message: 'Cart Item ID required' }), { headers, status: 400 });
             }

             const { error } = await supabase
                 .from('cart_items')
                 .delete()
                 .eq('id', itemId)
                 .eq('user_id', user.id); // Ensure user owns the item

             if (error) throw error; // Could include check for not found if needed

             return new Response(JSON.stringify({ message: 'Item removed successfully' }), { headers, status: 200 });
        }

        // DELETE /api/cart/clear
        if (req.method === 'DELETE' && route[0] === 'cart' && route[1] === 'clear') {
             const user = await getUser(supabase);
             if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { headers, status: 401 });

             const { error } = await supabase
                 .from('cart_items')
                 .delete()
                 .eq('user_id', user.id); // Delete all items for this user

             if (error) throw error;

             return new Response(JSON.stringify({ message: 'Cart cleared successfully' }), { headers, status: 200 });
        }


        // --- Fallback for unhandled routes ---
        return new Response(JSON.stringify({ message: 'Route not found' }), { headers, status: 404 });

    } catch (error) {
        console.error('Error processing request:', error);
        const errorHeaders = new Headers({
            'Content-Type': 'application/json',
            ...corsHeaders(origin) // Add CORS headers to error responses
        });
        return new Response(
            JSON.stringify({ message: error?.message || 'Internal Server Error' }),
            { headers: errorHeaders, status: 500 }
        );
    }
});
