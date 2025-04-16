import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

// Base URL for your Supabase Edge Functions - Use import.meta.env for Vite
const API_BASE_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1';

export const useApi = () => {
    const { getToken } = useAuth();

    const makeRequest = useCallback(async (endpoint, method = 'GET', body = null) => {
        const token = await getToken({ template: 'supabase' }); // Fetch Supabase token from Clerk

        if (!token) {
            throw new Error("Authentication token not available.");
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Ensure Bearer token is set
            // Remove apikey if not explicitly needed by function (Bearer token is usually sufficient)
            // 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY // Use import.meta.env if needed
        };

        const config = {
            method: method,
            headers: headers,
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);

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
    // Add other API methods (getProducts, getProductById, createOrder, etc.) here

    return {
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        // Export other methods
    };
};
