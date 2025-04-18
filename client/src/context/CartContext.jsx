import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom'; // Keep useNavigate
import toast from 'react-hot-toast';
import { useApi } from '../api/apiClient';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false); // Initialize loading state
    const [error, setError] = useState(null);
    const { isSignedIn, isLoaded } = useUser(); // Use useUser for auth status
    const api = useApi();
    const navigate = useNavigate(); // Keep useNavigate here

    // Calculate itemCount based on cartItems
    const itemCount = cartItems.reduce((count, item) => count + (item.quantity || 0), 0);

    // Fetch cart when auth state changes (signed in/out)
    useEffect(() => {
        const loadCart = async () => {
            if (isSignedIn) {
                setLoading(true);
                setError(null);
                try {
                    const data = await api.getCart();
                    setCartItems(data.items || []);
                    setTotal(data.total || 0);
                } catch (err) {
                    console.error("Failed to fetch cart:", err);
                    setError(err.message);
                    // Optionally clear cart on fetch error when signed in
                    // setCartItems([]);
                    // setTotal(0);
                    toast.error(`Failed to load cart: ${err.message}`);
                } finally {
                    setLoading(false);
                }
            } else {
                // Handle anonymous cart (e.g., load from localStorage or clear)
                // For now, let's clear it when signed out
                setCartItems([]);
                setTotal(0);
                setError(null); // Clear error on sign out
            }
        };

        if (isLoaded) { // Only run when Clerk is ready
            loadCart();
        }

    }, [isSignedIn, isLoaded]); // Only re-run if auth status changes

    const addToCart = async (product, quantity) => {
        if (!isSignedIn) {
            toast.error("Please sign in to add items to your cart.");
            navigate('/auth/login'); // Correctly navigate to login
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Use product.id for the API call
            const addedItem = await api.addToCart(product.id, quantity);
            // Update state based on the *full cart* returned by GET or the single item returned by POST
            // Option 1: Refetch the whole cart (simpler, ensures consistency)
            const data = await api.getCart();
            setCartItems(data.items || []);
            setTotal(data.total || 0);
            toast.success(`${product.name} added to cart!`);

            // Option 2: Update state based on returned item (more complex state logic)
            // This requires the POST endpoint to return the item in the same format as GET
            // const existingItemIndex = cartItems.findIndex(item => item.product.id === addedItem.product.id);
            // if (existingItemIndex > -1) {
            //     const updatedItems = [...cartItems];
            //     updatedItems[existingItemIndex] = addedItem;
            //     setCartItems(updatedItems);
            // } else {
            //     setCartItems(prevItems => [...prevItems, addedItem]);
            // }
            // // Recalculate total locally or trust total from add response if available
            // setTotal(newTotal); // Need to calculate or get newTotal

        } catch (err) {
            console.error("Failed to add to cart:", err);
            setError(err.message);
            toast.error(`Failed to add item: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        if (!isSignedIn) return; // Should not happen if item exists, but good check
        setLoading(true);
        setError(null);
        try {
            await api.updateCartItem(itemId, quantity);
            // Refetch cart to ensure consistency
            const data = await api.getCart();
            setCartItems(data.items || []);
            setTotal(data.total || 0);
            toast.success("Cart updated.");
        } catch (err) {
            console.error("Failed to update cart item:", err);
            setError(err.message);
            toast.error(`Update failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        if (!isSignedIn) return;
        setLoading(true);
        setError(null);
        try {
            await api.removeFromCart(itemId);
            // Refetch cart
            const data = await api.getCart();
            setCartItems(data.items || []);
            setTotal(data.total || 0);
            toast.success("Item removed from cart.");
        } catch (err) {
            console.error("Failed to remove from cart:", err);
            setError(err.message);
            toast.error(`Removal failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const clearCart = () => {
        // Implement logic to clear cart (e.g., call API endpoint or just clear state)
        setCartItems([]);
        setTotal(0);
        // Optionally call an API endpoint if needed:
        // try { await api.clearCart(); } catch(err) { ... }
        toast.success("Cart cleared");
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            setCartItems, // Keep if needed directly, but prefer specific functions
            total,
            itemCount, // Ensure itemCount is always provided
            loading,
            error,
            addToCart,
            updateCartItem, // Add update function
            removeFromCart, // Add remove function
            clearCart, // Add clear function
            // Add other cart-related functions or state as needed
        }}>
            {children}
        </CartContext.Provider>
    );
};