import React, { createContext, useState, useEffect, useContext, useMemo } from 'react'; // Import useMemo
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useApi } from '../api/apiClient';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        console.error('useCart must be used within a CartProvider', 
            new Error().stack // Add stack trace for easier debugging
        );
        
        // Return a default object with expected properties to prevent destructuring errors
        return { 
            cartItems: [], 
            itemCount: 0, 
            cartTotal: 0,
            loading: false, 
            error: null,
            addToCart: () => console.error('CartProvider not found - addToCart unavailable'),
            updateCartItem: () => console.error('CartProvider not found - updateCartItem unavailable'),
            removeFromCart: () => console.error('CartProvider not found - removeFromCart unavailable'),
            clearCart: () => console.error('CartProvider not found - clearCart unavailable'),
        };
    }
    return context;
};

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
                    console.log("[CartContext Load Effect] User signed in.");

                    // --- MERGE LOGIC START ---
                    const localCartString = localStorage.getItem('cartItems');
                    if (localCartString) {
                        console.log("[CartContext Merge] Found local cart data. Attempting merge...");
                        let localCartItems = [];
                        try {
                            localCartItems = JSON.parse(localCartString);
                            localCartItems = Array.isArray(localCartItems) ? localCartItems : [];
                        } catch (parseError) {
                            console.error("[CartContext Merge] Error parsing local cart data:", parseError);
                            localCartItems = []; // Clear if parsing fails
                        }

                        if (localCartItems.length > 0) {
                            toast.loading("Syncing your cart...", { id: 'cart-merge-toast' });
                            console.log(`[CartContext Merge] Items to merge: ${localCartItems.length}`);

                            // Use Promise.allSettled to attempt adding all items
                            const mergePromises = localCartItems.map(item =>
                                api.addToCart({
                                    productId: item.id, // Ensure correct field name for API
                                    quantity: item.quantity,
                                    shade: item.selectedShade?.name || null
                                }).catch(err => ({ // Catch individual errors
                                    status: 'rejected',
                                    reason: err.message || 'Unknown error',
                                    item: item.name || item.id
                                }))
                            );

                            const results = await Promise.allSettled(mergePromises);
                            console.log("[CartContext Merge] Merge results:", results);

                            const failedMerges = results.filter(r => r.status === 'rejected');
                            if (failedMerges.length > 0) {
                                console.warn(`[CartContext Merge] ${failedMerges.length} items failed to merge.`);
                                // Optionally show a more detailed error toast
                                toast.error(`Some items couldn't be added (e.g., out of stock).`, { id: 'cart-merge-toast' });
                            } else {
                                toast.success("Cart synced successfully!", { id: 'cart-merge-toast' });
                            }
                        }

                        // Clear local storage AFTER attempting merge
                        console.log("[CartContext Merge] Clearing local cart data.");
                        localStorage.removeItem('cartItems');
                    }
                    // --- MERGE LOGIC END ---

                    // Fetch the potentially merged cart from the API
                    console.log("[CartContext Load Effect] Calling api.getCart()...");
                    const apiCart = await api.getCart(); // Assume this returns the array of cart items
                    console.log("[CartContext Load Effect] api.getCart() response:", apiCart);
                    rawCartData = Array.isArray(apiCart) ? apiCart : [];
                    // localStorage.removeItem('cartItems'); // Moved this to after merge attempt

                } else {
                    console.log("[CartContext Load Effect] User not signed in, loading from local storage...");
                    const localCartString = localStorage.getItem('cartItems');
                    console.log("[CartContext Load Effect] Local storage string:", localCartString);
                    if (localCartString) {
                        try {
                            rawCartData = JSON.parse(localCartString); // Parse local data
                            rawCartData = Array.isArray(rawCartData) ? rawCartData : [];
                        } catch (parseError) {
                            console.error("[CartContext Load] Error parsing local cart data:", parseError);
                            rawCartData = []; // Reset on error
                        }
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
                // --- MODIFICATION START ---
                // Log the specific error object for better debugging
                console.error("[CartContext Load Effect] CATCH block error object:", error);
                // Attempt to log more details if it looks like an API error response
                if (error && typeof error.message === 'string') {
                     console.error("[CartContext Load Effect] Error Message:", error.message);
                }
                if (error && error.response && typeof error.response.status === 'number') {
                    console.error("[CartContext Load Effect] API Error Response Status:", error.response.status);
                    try {
                        const errorBody = await error.response.json();
                        console.error("[CartContext Load Effect] API Error Response Body:", errorBody);
                    } catch (parseErr) {
                        console.error("[CartContext Load Effect] Could not parse API error response body.");
                    }
                }
                // --- MODIFICATION END ---

                // Dismiss merge toast if it was showing
                toast.dismiss('cart-merge-toast');
                toast.error("Could not load or sync your cart.");
                setError(error.message || "Failed to load cart"); // Set error state
                setCartItems([]); // Reset cart on error
                // Clear local storage on major load error as well? Maybe.
                // localStorage.removeItem('cartItems');
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
        // --- ADD DETAILED LOGGING HERE ---
        // Log exactly which product is being added *every time* this function is called
        console.log(`%c[CartContext Add] CALLED`, 'color: blue; font-weight: bold;', { productId: product?.id, name: product?.name, quantity: quantity, isSignedIn: isSignedIn });
        // --- END LOGGING ---

        // Basic validation
        if (!product || !product.id || quantity < 1) {
            console.error("[CartContext Add] Invalid product or quantity received.", { product, quantity });
            toast.error("Cannot add invalid item to cart.");
            setLoading(false); // Ensure loading is reset if validation fails early
            return; // Prevent further execution
        }

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
                console.log(`[CartContext Add API] Calling API for Product ID: ${product.id}`);
                // Assume api.addToCart handles token internally now
                const result = await api.addToCart({
                    productId: product.id,
                    quantity: quantity,
                    shade: product.selectedShade?.name || null
                });
                console.log(`[CartContext Add API] API Response for Product ID ${product.id}:`, result);

                // Refetch cart after successful add/update
                console.log(`[CartContext Add API] Refetching cart after adding Product ID ${product.id}...`);
                const apiCart = await api.getCart();
                const formattedCart = (Array.isArray(apiCart) ? apiCart : []).map(formatCartItem).filter(item => item !== null);
                setCartItems(formattedCart);
                toast.success(`${product.name} added to cart!`);

            } else {
                // --- Anonymous user: Use Local Storage ---
                console.log(`[CartContext Add Local] Updating local cart for Product ID: ${product.id}`);
                let updatedCart = [...cartItems];
                if (existingItemIndex > -1) {
                    // Ensure quantity doesn't exceed stock if stock info is available locally
                    const currentItem = updatedCart[existingItemIndex];
                    const maxStock = currentItem.stock ?? Infinity;
                    const newQuantity = Math.min(currentItem.quantity + quantity, maxStock);
                    if (newQuantity > currentItem.quantity) {
                         updatedCart[existingItemIndex].quantity = newQuantity;
                    } else {
                        // Optionally notify user if stock limit reached
                        toast.error(`Cannot add more. Stock limit reached for ${currentItem.name}.`);
                    }
                } else {
                    // Format the new product before adding to local cart
                    const newItem = formatCartItem({ ...product, quantity: quantity });
                     // Check stock before adding new item locally
                    const maxStock = newItem.stock ?? Infinity;
                    if (newItem.quantity > maxStock) {
                        // Set quantity to maxStock instead of failing
                        newItem.quantity = maxStock;
                        updatedCart.push(newItem);
                        toast.warning(`Added ${maxStock} of ${newItem.name} (maximum available stock).`);
                    } else if (newItem) {
                        updatedCart.push(newItem);
                    }
                }
                setCartItems(updatedCart); // Update state, which triggers local storage save effect
                // Only show success toast if quantity actually changed or item was added
                 if (existingItemIndex === -1 || updatedCart[existingItemIndex]?.quantity > cartItems[existingItemIndex]?.quantity) {
                    toast.success(`${product.name} added to cart!`);
                 }
            }
        } catch (error) {
            console.error(`[CartContext Add] Failed to add item (ID: ${product?.id}):`, error);
            setError(error.message || "Failed to add item");
            toast.error(`Failed to add ${product.name}. ${error.message || ''}`);
        } finally {
            console.log(`[CartContext Add] FINALLY block for Product ID: ${product?.id}. Setting loading false.`);
            setLoading(false);
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        // Find item index based on ID only (assuming update doesn't change shade)
        const itemIndex = cartItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            console.error(`[CartContext UpdateQ] Item with ID ${itemId} not found in cart`);
            return; // Item not found
        }
        
        // First update state optimistically (for immediate UI feedback)
        const updatedCart = [...cartItems];
        updatedCart[itemIndex] = { 
            ...updatedCart[itemIndex], 
            quantity: quantity 
        };
        setCartItems(updatedCart);
        
        // Then make API request - BUT DON'T SET GLOBAL LOADING STATE
        // This allows incrementing/decrementing without showing global loading spinner
        setError(null);
        
        // Use a local loading state instead for this specific item
        const currentItem = updatedCart[itemIndex];
        const updatedWithLoading = [...updatedCart];
        updatedWithLoading[itemIndex] = {
            ...currentItem,
            isUpdating: true // Add a flag to the item itself
        };
        setCartItems(updatedWithLoading);
        
        try {
            if (isSignedIn) {
                // --- Signed-in user: Use API ---
                console.log(`[CartContext UpdateQ] Calling API updateCartItemQuantity for item ${itemId} to quantity ${quantity}`);
                
                // Get the cartItemId (may be different from product ID)
                // Extract cartItemId - first try the most reliable properties
                let cartItemId = null;
                const item = cartItems[itemIndex];
                
                // Check all possible properties that might contain the cart item ID
                if (item.cartItemId) cartItemId = item.cartItemId;
                else if (item.cart_item_id) cartItemId = item.cart_item_id;
                else if (item.cart_id) cartItemId = item.cart_id;
                
                console.log(`[CartContext UpdateQ] Using ID properties:`, {
                    cartItemId,
                    itemId,
                    itemObject: item
                });
                
                // If we don't have a direct cartItemId, try to find one in the data structure
                if (!cartItemId) {
                    // Make a best effort to find any property that looks like it could be a cart item ID
                    // besides the product ID itself
                    const possibleIdProps = Object.entries(item)
                        .filter(([key, value]) => 
                            key !== 'id' && // not the main product ID 
                            key.includes('id') && // has "id" in the name
                            typeof value === 'string' && // is a string
                            value.length > 8 // reasonably long to be a UUID
                        );
                    
                    if (possibleIdProps.length > 0) {
                        // Use the first matching property
                        cartItemId = possibleIdProps[0][1];
                        console.log(`[CartContext UpdateQ] Found potential cart item ID: ${cartItemId} (from ${possibleIdProps[0][0]})`);
                    }
                }
                
                // If we still don't have a cartItemId, create a special approach for quick updates
                if (!cartItemId) {
                    console.log('[CartContext UpdateQ] No cartItemId found, using streamlined approach for updates');
                    
                    // Try to add the product with the new quantity directly
                    // This will either create a new entry or find & update existing one
                    const result = await api.addToCart({
                        productId: itemId,
                        quantity: quantity,
                        replace: true // Add a flag to indicate replacement
                    });
                    
                    console.log('[CartContext UpdateQ] Streamlined update result:', result);
                    
                    // Update the local cart with the result if available
                    if (result && result.data) {
                        // Find the item in the current cart
                        const newUpdatedCart = [...cartItems];
                        newUpdatedCart[itemIndex] = {
                            ...result.data,
                            isUpdating: false // Clear the updating flag
                        };
                        setCartItems(newUpdatedCart);
                    } else {
                        // Just update the quantity and clear the loading state
                        const finalUpdatedCart = [...cartItems];
                        finalUpdatedCart[itemIndex] = {
                            ...finalUpdatedCart[itemIndex],
                            quantity: quantity,
                            isUpdating: false
                        };
                        setCartItems(finalUpdatedCart);
                    }
                    
                    // Toast success message
                    toast.success("Cart updated", { duration: 1500 });
                    return;
                }
                
                // If we have a cartItemId, proceed with normal update
                if (cartItemId) {
                    console.log(`[CartContext UpdateQ] Using cartItemId: ${cartItemId} (product ID: ${itemId})`);
                    
                    await api.updateCartItemQuantity({ 
                        itemId: cartItemId,
                        quantity: quantity,
                        productId: itemId
                    });
                    
                    // Clear the updating flag
                    const finalUpdatedCart = [...cartItems];
                    finalUpdatedCart[itemIndex] = {
                        ...finalUpdatedCart[itemIndex],
                        quantity: quantity,
                        isUpdating: false
                    };
                    setCartItems(finalUpdatedCart);
                    
                    // Show a more subtle toast for quantity updates
                    toast.success("Cart updated", { duration: 1500 });
                } else {
                    // Fall back to a more robust approach - refresh the entire cart
                    console.log('[CartContext UpdateQ] No cart item ID found, refreshing entire cart');
                    await loadCart();
                    toast.success("Cart updated", { duration: 1500 });
                }
            } else {
                // --- Anonymous user: Use Local Storage ---
                // Already updated the cart above, just clear the updating flag
                const finalUpdatedCart = [...cartItems];
                finalUpdatedCart[itemIndex] = {
                    ...finalUpdatedCart[itemIndex],
                    quantity: quantity,
                    isUpdating: false
                };
                setCartItems(finalUpdatedCart);
                
                toast.success("Cart updated", { duration: 1500 });
            }
        } catch (err) {
            console.error("Failed to update cart item:", err);
            setError(err.message || "Failed to update item");
            
            // Show error toast
            toast.error(`Update failed: ${err.message}`);
            
            // Revert to original cart if the API call failed
            const revertedCart = [...cartItems];
            revertedCart[itemIndex] = {
                ...cartItems[itemIndex], // Revert to original item
                isUpdating: false // Clear the updating flag
            };
            setCartItems(revertedCart);
        }
        // We're not using the global loading state, so we don't need to clear it
        // setLoading(false); <-- REMOVE THIS
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