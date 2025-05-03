import { useAuth } from '@clerk/clerk-react';

// Base URL for your API - Use the Supabase Functions URL + function name
const SUPABASE_FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
const API_FUNCTION_NAME = 'api'; // The name of your edge function

// FIXED: Clean implementation to avoid URL construction issues
const constructApiBaseUrl = () => {
  if (!SUPABASE_FUNCTIONS_BASE) {
    return `http://localhost:5000/api`; // Fallback to Express server
  }
  
  // Remove trailing slash if present
  const baseUrl = SUPABASE_FUNCTIONS_BASE.replace(/\/$/, '');
  
  // Log the base URL for debugging
  console.log("Base URL before processing:", baseUrl);
  
  // Fix: The Supabase URL already includes the base path, just add the function name
  // This avoids the double "functions/v1" path issue
  return `${baseUrl}/api`;
};

// Use the corrected function to set API_BASE_URL
const API_BASE_URL = constructApiBaseUrl();

console.log("API Base URL set to:", API_BASE_URL);

if (!SUPABASE_FUNCTIONS_BASE) {
    console.warn("VITE_SUPABASE_FUNCTIONS_URL is not defined in .env. Falling back to local URL:", API_BASE_URL);
}

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
    console.error("Error: VITE_SUPABASE_ANON_KEY environment variable is not set.");
    // Optionally throw an error
    // throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable.");
}

// Store the getToken function reference
let clerkGetToken = null;

// Hook to initialize the getToken function reference
export const useInitializeApi = () => {
    const { getToken } = useAuth();
    if (getToken && !clerkGetToken) {
        clerkGetToken = getToken;
        console.log("API Client: Clerk getToken function initialized.");
    }
};

// For fallback mode, use Express server directly for user sync
const useExpressServerDirectly = () => {
  const endpoint = 'http://localhost:5000';
  console.log("Using Express server directly:", endpoint);
  return endpoint;
};

// Add this function to handle products with missing data fields
const transformProductData = (product) => {
    if (!product) return product;
    
    try {
        // Log if paletteTheme is undefined but expected for this product
        if (product.paletteTheme === undefined) {
            console.warn(`Product ${product.id || product.name} is missing paletteTheme. This column may not exist in Supabase.`);
            
            // Don't add default values - just ensure the property exists
            // so that code accessing this property doesn't crash
            product.paletteTheme = null;
        }
    } catch (error) {
        console.warn(`Error handling product data: ${error.message}`, product);
        // Don't fail if transformation has an error
    }
    return product;
};

// Transform an array of products safely
const transformProductsData = (products) => {
    if (!Array.isArray(products)) return products;
    
    return products.map(product => {
        try {
            return transformProductData(product);
        } catch (error) {
            console.warn(`Error transforming a product: ${error.message}`);
            return product; // Return original product if transformation fails
        }
    });
};

// Helper function to make authenticated requests
const _request = async (method, endpoint, body = null, requiresAuth = true) => {
    // Ensure endpoint starts with '/' and combine carefully
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // API_BASE_URL should now correctly point to the Supabase function
    const url = `${API_BASE_URL}${cleanEndpoint}`;
    const headers = new Headers({ 'Content-Type': 'application/json' }); // Initialize as Headers object
    let token = null;

    // --- Add Logging Here ---
    console.log(`[API Client _request] Attempting ${method} request to URL: ${url}`);
    // --- End Logging ---

    if (requiresAuth) {
        if (!clerkGetToken) {
            console.error("API Client Error: clerkGetToken function not initialized. Call useInitializeApi in your App component.");
            throw new Error("API client not ready. Authentication function missing.");
        }
        try {
            // --- CHANGE: Request default Clerk session token ---
            console.log("API Client: Requesting default Clerk session token...");
            token = await clerkGetToken();
            // --- END CHANGE ---

            if (!token) {
                console.error(`API Client Error: Failed to retrieve default authentication token.`);
                throw new Error("Authentication token could not be retrieved.");
            }
            headers.set('Authorization', `Bearer ${token}`);

            // --- ADD TOKEN LOGGING ---
            const tokenSnippet = token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : 'null/undefined';
            console.log(`API Client: ${method} ${endpoint} - Using default token. Snippet: ${tokenSnippet}`);
            // --- END TOKEN LOGGING ---

        } catch (error) {
            console.error(`API Client Error: Error retrieving default authentication token.`, error);
            throw new Error(`Authentication token retrieval failed: ${error.message}`);
        }
    } else {
        console.log(`API Client: ${method} ${endpoint} - No authentication required.`);
    }

    try {
        const config = {
            method: method,
            headers: headers, // Pass the Headers object
        };
        if (body) {
            config.body = JSON.stringify(body);
        }

        // --- ADJUST LOGGING BEFORE FETCH ---
        // Log headers by iterating if needed, or just log the config object
        console.log(`[API Client _request] Sending fetch for ${method} ${endpoint}. Config:`, { method: config.method, headers: Object.fromEntries(config.headers.entries()), hasBody: !!config.body });
        // --- END ADJUST LOGGING ---
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (_) { // Changed 'e' to '_' to mark as intentionally unused
                errorData = { message: `HTTP error ${response.status}: ${response.statusText}` };
            }
            console.error(`API Client Error: ${method} ${endpoint} failed with status ${response.status}`, errorData);
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        // Handle cases with no content response (e.g., DELETE, sometimes PUT/POST)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            console.log(`API Client: ${method} ${endpoint} - Success (No Content)`);
            return { success: true }; // Indicate success even with no body
        }

        const data = await response.json();
        console.log(`API Client: ${method} ${endpoint} - Success`, data);
        // Optionally wrap data in a success object if needed consistently
        // return { success: true, data: data };
        return data; // Return data directly if backend doesn't wrap it

    } catch (error) {
        console.error(`API Client Error: Network or other error during ${method} ${endpoint}.`, error);
        // Re-throw the error to be caught by the calling function (e.g., in CartContext)
        throw error;
    }
};

// Product methods with data transformation
const getProducts = async (category = null) => {
    const endpoint = category ? `/products?category=${encodeURIComponent(category)}` : '/products';
    const data = await _request('GET', endpoint, null, false);
    return transformProductsData(data);
};

const getProductById = async (id) => {
    const data = await _request('GET', `/products/${id}`, null, false);
    return transformProductData(data);
};

// Cart methods (likely require auth)
const getCart = () => _request('GET', '/cart', null, true); // requiresAuth = true
const addToCart = (itemData) => _request('POST', '/cart/add', itemData, true); // requiresAuth = true
const removeFromCart = (itemData) => _request('DELETE', '/cart/remove', itemData, true); // requiresAuth = true
const updateCartItemQuantity = (itemData) => _request('PUT', '/cart/update', itemData, true); // requiresAuth = true
const clearCart = () => _request('DELETE', '/cart/clear', null, true); // requiresAuth = true

// Add this method to your API client class
const updateUserRole = async (userId, role, token) => {
    try {
        const response = await _request('POST', '/users/update-role', { userId, role }, true);
        return response.data;
    } catch (error) {
        console.error('API Error - updateUserRole:', error);
        throw error;
    }
};

// Add a syncUser method to the API client
const syncUser = async (userData) => {
  console.log("Syncing user data to server:", userData);
  try {
    // Use Express server directly for user sync during development
    const url = `${useExpressServerDirectly()}/api/users/sync`;
    console.log("Using direct Express endpoint for user sync:", url);
    
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (clerkGetToken) {
      const token = await clerkGetToken();
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("User sync successful:", data);
    return data;
  } catch (error) {
    console.error("User sync failed:", error);
    throw error;
  }
};

// ... (other methods like getWishlist, addToWishlist, etc. - set requiresAuth accordingly) ...

export const api = {
    getProducts,
    getProductById,
    // ... other methods
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    updateUserRole,
    syncUser, // Add the new syncUser method to the exported API
};

// Hook to use the API client instance
export const useApi = () => {
    // This hook doesn't need to do much now,
    // as initialization happens via useInitializeApi
    // and the api object uses the stored clerkGetToken.
    return api;
};
