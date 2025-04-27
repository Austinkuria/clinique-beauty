import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

// Base URL and Anon Key - Check if they are loaded
const functionsBaseUrl = (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || '').trim();
const apiUrl = (import.meta.env.VITE_API_URL || '').trim(); // Also trim the local API URL

// Choose the correct base URL depending on your setup
// If using Supabase functions for products:
const API_BASE_URL = functionsBaseUrl;
// If using your local Express server (http://localhost:5000/api):
// const BASE_URL = apiUrl;

// Ensure BASE_URL is defined before creating the instance
if (!API_BASE_URL) {
    console.error("Error: API Base URL (VITE_SUPABASE_FUNCTIONS_URL or VITE_API_URL) is not defined or invalid in .env");
    // Handle the error appropriately, maybe throw an error or use a default
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

// Helper function to make authenticated requests
const _request = async (method, endpoint, body = null, requiresAuth = true) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
    };
    let token = null;

    if (requiresAuth) {
        if (!clerkGetToken) {
            console.error("API Client Error: clerkGetToken function not initialized. Call useInitializeApi in your App component.");
            throw new Error("API client not ready. Authentication function missing.");
        }
        try {
            // Use the stored getToken function
            token = await clerkGetToken({ template: 'supabase' }); // Assuming 'supabase' template
            if (!token) {
                // --- CHANGE: Throw error if token is null/undefined ---
                console.error(`API Client Error: Failed to retrieve authentication token (template: supabase).`);
                throw new Error("Authentication token could not be retrieved.");
                // --- END CHANGE ---
            }
            headers['Authorization'] = `Bearer ${token}`;
            console.log(`API Client: ${method} ${endpoint} - Using token (template: supabase)`);

        } catch (error) {
            console.error(`API Client Error: Error retrieving authentication token (template: supabase).`, error);
            // --- CHANGE: Re-throw or throw a specific error ---
            throw new Error(`Authentication token retrieval failed: ${error.message}`);
            // --- END CHANGE ---
        }
    } else {
        console.log(`API Client: ${method} ${endpoint} - No authentication required.`);
    }


    const config = {
        method: method,
        headers: headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
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


// --- API Methods ---
// ... (getProducts, getProductById - likely don't require auth) ...

// Cart methods (likely require auth)
const getCart = () => _request('GET', '/cart', null, true); // requiresAuth = true
const addToCart = (itemData) => _request('POST', '/cart/add', itemData, true); // requiresAuth = true
const removeFromCart = (itemData) => _request('DELETE', '/cart/remove', itemData, true); // requiresAuth = true
const updateCartItemQuantity = (itemData) => _request('PUT', '/cart/update', itemData, true); // requiresAuth = true
const clearCart = () => _request('DELETE', '/cart/clear', null, true); // requiresAuth = true

// ... (other methods like getWishlist, addToWishlist, etc. - set requiresAuth accordingly) ...

export const api = {
    // ... other methods
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
};

// Hook to use the API client instance
export const useApi = () => {
    // This hook doesn't need to do much now,
    // as initialization happens via useInitializeApi
    // and the api object uses the stored clerkGetToken.
    return api;
};
