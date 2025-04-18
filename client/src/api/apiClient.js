import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

// Base URL for your Supabase Edge Functions - Use import.meta.env for Vite
const API_BASE_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1';

export const useApi = () => {
    const { getToken } = useAuth();

    const makeRequest = useCallback(async (endpoint, method = 'GET', body = null) => {
        const token = await getToken(); // Attempt to get token

        const headers = {
            'Content-Type': 'application/json',
        };

        // Only add Authorization header if a token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else if (method !== 'GET') {
            // Optionally, throw error if trying non-GET requests without a token
            // Or handle based on specific endpoint requirements if some POST/PUT are public
            console.warn(`Attempted ${method} request to ${endpoint} without authentication token.`);
            // Depending on your app's logic, you might want to throw an error here for non-GET:
            // throw new Error('Authentication required for this action.');
        }

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
