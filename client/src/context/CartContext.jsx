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
    const { getToken } = useAuth(); // Get getToken function from Clerk
    const api = useApi();
    const navigate = useNavigate(); // Keep useNavigate here

    // Calculate itemCount based on cartItems
    const itemCount = cartItems.reduce((count, item) => count + (item.quantity || 0), 0);

    // Fetch cart when auth state changes (signed in/out)
    useEffect(() => {
        const loadCart = async () => {
            console.log("[CartContext Load Effect] START. SignedIn:", isSignedIn);
            setLoading(true); // Set loading true
            try {
                console.log("[CartContext Load Effect] TRY block entered.");
                if (isSignedIn) {
                    console.log("[CartContext Load Effect] User signed in, calling api.getCart()...");
                    const apiCart = await api.getCart();
                    console.log("[CartContext Load Effect] api.getCart() response:", apiCart);

                    if (!Array.isArray(apiCart)) {
                        console.warn("[CartContext Load Effect] API response is not an array. Setting cart to empty.");
                        setCartItems([]);
                    } else {
                        console.log("[CartContext Load Effect] Formatting API cart data...");
                        const formattedCart = apiCart.map(item => {
                            // Add safety checks during mapping
                            if (!item || typeof item !== 'object') {
                                console.error("[CartContext Load Effect] Invalid item structure in API response:", item);
                                return null; // Skip invalid items
                            }
                            return {
                                id: item.productId || item.id, // Allow for both possibilities
                                quantity: item.quantity || 0,
                                name: item.name || 'Unknown Product',
                                price: typeof item.price === 'number' ? item.price : 0,
                                image: item.image || null,
                                selectedShade: item.selectedShade || null,
                                description: item.description || '',
                                category: item.category || '',
                                stock: item.stock,
                            };
                        }).filter(item => item !== null); // Remove any skipped invalid items

                        console.log("[CartContext Load Effect] Setting cart items from API data:", formattedCart);
                        setCartItems(formattedCart);
                    }
                    console.log("[CartContext Load Effect] Removing local storage cart.");
                    localStorage.removeItem('cartItems');
                } else {
                    console.log("[CartContext Load Effect] User not signed in, loading from local storage...");
                    const localCartString = localStorage.getItem('cartItems');
                    console.log("[CartContext Load Effect] Local storage string:", localCartString);
                    if (localCartString) {
                        console.log("[CartContext Load Effect] Parsing local storage JSON...");
                        const parsedLocalCart = JSON.parse(localCartString); // Potential error point
                        console.log("[CartContext Load Effect] Setting cart items from local storage:", parsedLocalCart);
                        setCartItems(Array.isArray(parsedLocalCart) ? parsedLocalCart : []);
                    } else {
                        console.log("[CartContext Load Effect] No local storage cart found. Setting empty cart.");
                        setCartItems([]);
                    }
                }
                console.log("[CartContext Load Effect] TRY block finished successfully.");
            } catch (error) {
                // Log the specific error
                console.error("[CartContext Load Effect] CATCH block error:", error);
                toast.error("Could not load your cart.");
                // Attempt fallback to empty cart to prevent inconsistent state
                console.log("[CartContext Load Effect] Setting empty cart due to error.");
                setCartItems([]);
            } finally {
                // Crucial log: Does this run?
                console.log("[CartContext Load Effect] FINALLY block entered. Setting loading false.");
                setLoading(false);
            }
        };

        if (isLoaded) { // Only run when Clerk is ready
            loadCart();
        }

    }, [isSignedIn, isLoaded, api]); // Only re-run if auth status changes

    const saveCart = (cart) => {
        localStorage.setItem('cartItems', JSON.stringify(cart));
        setCartItems(cart);
    };

    const addToCart = async (product, quantity) => {
        console.log(`[CartContext Add] Attempting add. SignedIn: ${isSignedIn}. Product:`, product); // Log the product being added
        setLoading(true);
        let updatedCart = [...cartItems];
        const existingItemIndex = updatedCart.findIndex(item =>
            item.id === product.id &&
            (item.selectedShade?.name === product.selectedShade?.name || (!item.selectedShade && !product.selectedShade))
        );

        try {
            if (isSignedIn) {
                // --- Signed-in user: Use API ---
                const token = await getToken(); // Explicitly get token
                console.log("[CartContext Add] Token retrieved:", token ? 'Yes (first 10 chars: ' + token.substring(0, 10) + '...)' : 'No');

                if (!token) {
                     throw new Error("Authentication token could not be retrieved.");
                }

                console.log("[CartContext Add] Calling API addToCart...");
                const result = await api.addToCart({
                    productId: product.id,
                    quantity: quantity,
                    shade: product.selectedShade?.name || null // Send shade name if selected
                });
                console.log("[CartContext Add] API Response:", result);

                if (result && result.success) { // Example: Check for success flag
                     // *** CRITICAL: Refetch cart to get updated full details from backend ***
                     const apiCart = await api.getCart();
                     // Map API response if necessary (same as in useEffect)
                     const formattedCart = (Array.isArray(apiCart) ? apiCart : []).map(item => ({
                         id: item.productId, quantity: item.quantity, name: item.name, price: item.price, image: item.image, selectedShade: item.selectedShade, description: item.description, category: item.category, stock: item.stock,
                     }));
                     setCartItems(formattedCart);
                     toast.success(`${product.name} added to cart!`);
                } else {
                    throw new Error(result?.message || "API call to add item failed.");
                }

            } else {
                // --- Anonymous user: Use Local Storage ---
                console.log("[CartContext Add] User is not signed in. Updating local storage cart...");
                if (existingItemIndex > -1) {
                    // Update quantity for existing item
                    updatedCart[existingItemIndex].quantity += quantity;
                    console.log("[CartContext Add] Updated quantity for existing item:", updatedCart[existingItemIndex]);
                } else {
                    // Add new item with full product details
                    // *** Ensure 'product' object contains all necessary fields (name, price, image) ***
                    const newItem = {
                        ...product, // Spread the full product object passed from ProductDetail
                        quantity: quantity // Add the quantity
                        // selectedShade is already part of 'product' if selected
                    };
                    updatedCart.push(newItem);
                    console.log("[CartContext Add] Added new item:", newItem);
                }
                saveCart(updatedCart); // Save updated cart to local storage
                toast.success(`${product.name} added to cart!`);
            }
        } catch (error) {
            console.error("Failed to add item:", error);
            // Check for specific authentication error message
            if (error.message && error.message.includes("Authentication token is required")) {
                 toast.error("Please sign in to add items to your cart.");
                 // Optionally redirect to sign-in or show sign-in modal
            } else {
                 toast.error(`Failed to add ${product.name}. ${error.message || ''}`);
            }
            // Optionally revert state if API call failed? Depends on desired UX.
        } finally {
            setLoading(false);
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        if (!isSignedIn) return; // Should not happen if item exists, but good check
        setLoading(true);
        setError(null);
        try {
            const token = await getToken(); // Explicitly get token
            console.log("[CartContext UpdateQ] Token retrieved:", token ? 'Yes (first 10 chars: ' + token.substring(0, 10) + '...)' : 'No');

            if (!token) {
                 throw new Error("Authentication token could not be retrieved.");
            }

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
            const token = await getToken(); // Explicitly get token
            console.log("[CartContext Remove] Token retrieved:", token ? 'Yes (first 10 chars: ' + token.substring(0, 10) + '...)' : 'No');

            if (!token) {
                 throw new Error("Authentication token could not be retrieved.");
            }

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

    const clearCart = async () => {
        setLoading(true);
        try {
            if (isSignedIn) {
                console.log("[CartContext Clear] User signed in. Getting token...");
                const token = await getToken();
                if (!token) throw new Error("Authentication token could not be retrieved.");
                console.log("[CartContext Clear] Calling API clearCart...");
                const result = await api.clearCart();
                // ... (handle result) ...
            } else {
                // ... (local storage logic) ...
            }
        } catch (error) {
            console.error("[CartContext Clear] Failed to clear cart:", error);
            // ... (error handling) ...
        } finally {
            setLoading(false);
        }
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