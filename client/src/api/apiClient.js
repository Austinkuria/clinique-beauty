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

export const useApi = () => {
    const { getToken } = useAuth();

    const makeRequest = useCallback(async (endpoint, method = 'GET', body = null) => {
        let token = null;
        try {
            // Attempt to get Supabase token from Clerk
            token = await getToken({ template: 'supabase' });
        } catch (error) {
            // Handle cases where user might not be logged in or token retrieval fails
            console.warn("Could not retrieve authentication token. Proceeding without it for GET request.");
            // If it's not a GET request, we might still want to enforce authentication
            if (method !== 'GET') {
                throw new Error("Authentication token is required for this action.");
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY // Use the variable checked above
        };

        // Only add the Authorization header if a token was successfully retrieved
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method: method,
            headers: headers,
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(body);
        }

        // Construct the URL carefully to avoid double slashes
        // Ensure endpoint doesn't start with '/' if API_BASE_URL ends with '/'
        const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

        // Use the corrected URL
        const response = await fetch(url, config);

        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            let errorData;
            try {
                // Try to parse error response from the function
                errorData = await response.json();
            } catch (e) {
                // If parsing fails, use status text
                errorData = { message: response.statusText };
            }
            // Throw an error with details from the response or status text
            throw new Error(errorData?.message || `Request failed with status ${response.status}`);
        }

        // Handle cases where the response might be empty (e.g., DELETE, some PUTs)
        const contentType = response.headers.get("content-type");
        if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
            return null; // Or return { success: true } or similar if appropriate
        }

        // If response is ok and has JSON content, parse and return it
        return response.json();

    }, [getToken]);

    // Define specific API methods using makeRequest
    const getCart = useCallback(() => makeRequest('api/cart', 'GET'), [makeRequest]);
    const addToCart = useCallback((productId, quantity) => makeRequest('api/cart', 'POST', { productId, quantity }), [makeRequest]);
    const updateCartItem = useCallback((itemId, quantity) => makeRequest(`api/cart/${itemId}`, 'PUT', { quantity }), [makeRequest]);
    const removeFromCart = useCallback((itemId) => makeRequest(`api/cart/${itemId}`, 'DELETE'), [makeRequest]);

    // Add missing product methods
    const getProducts = useCallback((category) => {
        const endpoint = category
            ? `api/products?category=${encodeURIComponent(category)}`
            : 'api/products';
        return makeRequest(endpoint, 'GET');
    }, [makeRequest]);

    const getProductById = useCallback((id) => makeRequest(`api/products/${id}`, 'GET'), [makeRequest]);

    return {
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        getProducts,      // Export the new method
        getProductById,   // Export the new method
        // Export other methods
    };
};
