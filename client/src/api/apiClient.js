import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL;

// Create a custom hook that returns API methods with auth token
export const useApi = () => {
    const { getToken } = useAuth();

    const getAuthHeaders = async () => {
        // Get the JWT from Clerk
        const token = await getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    };

    // Products API
    const getProducts = async () => {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    };

    const getProductById = async (id) => {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    };

    const getProductsByCategory = async (category) => {
        const response = await fetch(`${API_URL}/products?category=${category}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    };

    // Cart API - requires authentication
    const getCart = async () => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cart`, { headers });
        if (!response.ok) throw new Error('Failed to fetch cart');
        return response.json();
    };

    const addToCart = async (productId, quantity) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ productId, quantity }),
        });
        if (!response.ok) throw new Error('Failed to add to cart');
        return response.json();
    };

    const updateCartItem = async (itemId, quantity) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cart/${itemId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ quantity }),
        });
        if (!response.ok) throw new Error('Failed to update cart');
        return response.json();
    };

    const removeFromCart = async (itemId) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cart/${itemId}`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) throw new Error('Failed to remove from cart');
        return response.json();
    };

    return {
        getProducts,
        getProductById,
        getProductsByCategory,
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
    };
};
