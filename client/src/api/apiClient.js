import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to handle API responses and errors
const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            // Try to parse error message from server response body
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // Ignore if response body is not JSON or empty
        }
        console.error("API Error:", errorMessage, response); // Log the full error
        throw new Error(errorMessage); // Throw error with server message if available
    }
    // Handle cases where response might be empty (e.g., DELETE)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return {}; // Return empty object for non-JSON or empty responses
};


// Create a custom hook that returns API methods with auth token
export const useApi = () => {
    const { getToken } = useAuth();

    const getAuthHeaders = async () => {
        const token = await getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    };

    // Products API
    const getProducts = async (category = '') => { // Add optional category filter
        const url = category ? `${API_URL}/products?category=${encodeURIComponent(category)}` : `${API_URL}/products`;
        const response = await fetch(url);
        return handleResponse(response);
    };

    const getProductById = async (id) => {
        const response = await fetch(`${API_URL}/products/${id}`);
        return handleResponse(response);
    };

    // Removed getProductsByCategory as getProducts now handles it

    // Cart API - requires authentication
    const getCart = async () => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cart`, { headers });
        return handleResponse(response);
    };

    const addToCart = async (productId, quantity) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ productId, quantity }),
        });
        return handleResponse(response); // Returns the added/updated item
    };

    const updateCartItem = async (itemId, quantity) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cart/${itemId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ quantity }),
        });
        return handleResponse(response);
    };

    const removeFromCart = async (itemId) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cart/${itemId}`, {
            method: 'DELETE',
            headers,
        });
        return handleResponse(response); // Returns { message: '...' } on success
    };

    // Add other API calls (Orders, Wishlist if server-side, etc.) here

    return {
        getProducts,
        getProductById,
        // getProductsByCategory, // Removed
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
    };
};
