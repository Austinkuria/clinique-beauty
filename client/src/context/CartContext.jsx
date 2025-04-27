import React, { createContext, useState, useEffect, useContext, useMemo } from 'react'; // Import useMemo
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useApi } from '../api/apiClient';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isSignedIn, isLoaded } = useUser();
    const api = useApi();

    // --- Calculate cartTotal and itemCount dynamically ---
    const { cartTotal, itemCount } = useMemo(() => {
        let total = 0;
        let count = 0;
        for (const item of cartItems) {
            const price = typeof item.price === 'number' ? item.price : 0;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            total += price * quantity;
            count += quantity;
        }
        return { cartTotal: total, itemCount: count };
    }, [cartItems]); // Recalculate whenever cartItems changes
    // --- End Calculation ---


    // Helper function to format cart items consistently
    const formatCartItem = (item) => {
        if (!item || typeof item !== 'object') {
            console.error("[CartContext Format] Invalid item structure:", item);
            return null; // Skip invalid items
        }
        // Ensure all necessary fields are present and have defaults
        return {
            id: item.productId || item.id, // Use productId from API response, fallback to id
            quantity: item.quantity || 0,
            name: item.name || 'Unknown Product',
            price: typeof item.price === 'number' ? item.price : 0,
            image: item.image || null,
            selectedShade: item.selectedShade || null,
            description: item.description || '',
            category: item.category || '',
            stock: item.stock, // Ensure stock is included
            // Add any other fields needed for display or logic
        };
    };


    // Fetch cart when auth state changes
    useEffect(() => {
        const loadCart = async () => {
            console.log("[CartContext Load Effect] START. SignedIn:", isSignedIn);
            setLoading(true);
            setError(null); // Clear previous errors
            try {
                console.log("[CartContext Load Effect] TRY block entered.");
                let rawCartData = [];
                if (isSignedIn) {
                    console.log("[CartContext Load Effect] User signed in, calling api.getCart()...");
                    const apiCart = await api.getCart(); // Assume this returns the array of cart items
                    console.log("[CartContext Load Effect] api.getCart() response:", apiCart);
                    rawCartData = Array.isArray(apiCart) ? apiCart : [];
                    localStorage.removeItem('cartItems'); // Clear local storage on successful fetch
                } else {
                    console.log("[CartContext Load Effect] User not signed in, loading from local storage...");
                    const localCartString = localStorage.getItem('cartItems');
                    console.log("[CartContext Load Effect] Local storage string:", localCartString);
                    if (localCartString) {
                        rawCartData = JSON.parse(localCartString); // Parse local data
                        rawCartData = Array.isArray(rawCartData) ? rawCartData : [];
                    } else {
                        rawCartData = []; // No local data
                    }
                }

                // Format the raw data (from API or local storage)
                console.log("[CartContext Load Effect] Formatting raw cart data...");
                const formattedCart = rawCartData.map(formatCartItem).filter(item => item !== null);
                console.log("[CartContext Load Effect] Setting cart items state:", formattedCart);
                setCartItems(formattedCart);

                console.log("[CartContext Load Effect] TRY block finished successfully.");
            } catch (error) {
                console.error("[CartContext Load Effect] CATCH block error:", error);
                toast.error("Could not load your cart.");
                setError(error.message || "Failed to load cart"); // Set error state
                setCartItems([]); // Reset cart on error
            } finally {
                console.log("[CartContext Load Effect] FINALLY block entered. Setting loading false.");
                setLoading(false);
            }
        };

        if (isLoaded) {
            loadCart();
        }

    }, [isSignedIn, isLoaded, api]); // Dependencies

    // Save local cart (only runs if user is not signed in)
    useEffect(() => {
        if (!isSignedIn && isLoaded) {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }
    }, [cartItems, isSignedIn, isLoaded]);


    const addToCart = async (product, quantity) => {
        console.log(`[CartContext Add] Attempting add. SignedIn: ${isSignedIn}. Product:`, product);
        setLoading(true);
        setError(null); // Clear previous errors

        // Find item index based on ID and shade
        const existingItemIndex = cartItems.findIndex(item =>
            item.id === product.id &&
            (item.selectedShade?.name === product.selectedShade?.name || (!item.selectedShade && !product.selectedShade))
        );

        try {
            if (isSignedIn) {
                // --- Signed-in user: Use API ---
                console.log("[CartContext Add] Calling API addToCart...");
                // Assume api.addToCart handles token internally now
                const result = await api.addToCart({
                    productId: product.id,
                    quantity: quantity,
                    shade: product.selectedShade?.name || null
                });
                console.log("[CartContext Add] API Response:", result);

                // Refetch cart after successful add/update
                console.log("[CartContext Add] Refetching cart after add...");
                const apiCart = await api.getCart();
                const formattedCart = (Array.isArray(apiCart) ? apiCart : []).map(formatCartItem).filter(item => item !== null);
                setCartItems(formattedCart);
                toast.success(`${product.name} added to cart!`);

            } else {
                // --- Anonymous user: Use Local Storage ---
                let updatedCart = [...cartItems];
                if (existingItemIndex > -1) {
                    updatedCart[existingItemIndex].quantity += quantity;
                } else {
                    // Format the new product before adding to local cart
                    const newItem = formatCartItem({ ...product, quantity: quantity });
                    if (newItem) {
                        updatedCart.push(newItem);
                    }
                }
                setCartItems(updatedCart); // Update state, which triggers local storage save effect
                toast.success(`${product.name} added to cart!`);
            }
        } catch (error) {
            console.error("Failed to add item:", error);
            setError(error.message || "Failed to add item");
            toast.error(`Failed to add ${product.name}. ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        // Find item index based on ID only (assuming update doesn't change shade)
        const itemIndex = cartItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return; // Item not found

        setLoading(true);
        setError(null);
        try {
            if (isSignedIn) {
                // --- Signed-in user: Use API ---
                console.log(`[CartContext UpdateQ] Calling API updateCartItemQuantity for item ${itemId} to quantity ${quantity}`);
                // Assume api.updateCartItemQuantity handles token internally
                await api.updateCartItemQuantity({ itemId, quantity }); // Adjust payload as needed by API

                // Refetch cart after successful update
                console.log("[CartContext UpdateQ] Refetching cart after update...");
                const apiCart = await api.getCart();
                const formattedCart = (Array.isArray(apiCart) ? apiCart : []).map(formatCartItem).filter(item => item !== null);
                setCartItems(formattedCart);
                toast.success("Cart updated.");

            } else {
                // --- Anonymous user: Use Local Storage ---
                let updatedCart = [...cartItems];
                updatedCart[itemIndex].quantity = quantity;
                setCartItems(updatedCart); // Update state, triggers save effect
                toast.success("Cart updated.");
            }
        } catch (err) {
            console.error("Failed to update cart item:", err);
            setError(err.message || "Failed to update item");
            toast.error(`Update failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        // Find item index based on ID only
        const itemIndex = cartItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return; // Item not found

        setLoading(true);
        setError(null);
        try {
            if (isSignedIn) {
                // --- Signed-in user: Use API ---
                console.log(`[CartContext Remove] Calling API removeFromCart for item ${itemId}`);
                // Assume api.removeFromCart handles token internally
                await api.removeFromCart({ itemId }); // Adjust payload as needed by API

                // Refetch cart after successful removal
                console.log("[CartContext Remove] Refetching cart after remove...");
                const apiCart = await api.getCart();
                const formattedCart = (Array.isArray(apiCart) ? apiCart : []).map(formatCartItem).filter(item => item !== null);
                setCartItems(formattedCart);
                toast.success("Item removed from cart.");

            } else {
                // --- Anonymous user: Use Local Storage ---
                let updatedCart = cartItems.filter(item => item.id !== itemId);
                setCartItems(updatedCart); // Update state, triggers save effect
                toast.success("Item removed from cart.");
            }
        } catch (err) {
            console.error("Failed to remove from cart:", err);
            setError(err.message || "Failed to remove item");
            toast.error(`Removal failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isSignedIn) {
                // --- Signed-in user: Use API ---
                console.log("[CartContext Clear] Calling API clearCart...");
                // Assume api.clearCart handles token internally
                await api.clearCart();

                // Set cart to empty after successful clear
                setCartItems([]);
                toast.success("Cart cleared.");

            } else {
                // --- Anonymous user: Use Local Storage ---
                setCartItems([]); // Update state, triggers save effect
                toast.success("Cart cleared.");
            }
        } catch (error) {
            console.error("[CartContext Clear] Failed to clear cart:", error);
            setError(error.message || "Failed to clear cart");
            toast.error(`Clear cart failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            cartTotal, // Use calculated total
            itemCount, // Use calculated count
            loading,
            error,
            addToCart,
            updateCartItem,
            removeFromCart,
            clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};