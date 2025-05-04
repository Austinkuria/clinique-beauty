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
                    
                    // Process the cart data to handle any stock limitations
                    rawCartData = Array.isArray(apiCart) ? apiCart : [];
                    
                    // Check if any items exceed stock limits and adjust them
                    const adjustedItems = [];
                    for (const item of rawCartData) {
                        if (item.stock !== undefined && item.quantity > item.stock) {
                            adjustedItems.push({
                                id: item.id,
                                name: item.name || 'Product',
                                oldQuantity: item.quantity,
                                newQuantity: item.stock
                            });
                            item.quantity = item.stock; // Adjust the quantity in-place
                        }
                    }
                    
                    // Notify the user if any items were adjusted
                    if (adjustedItems.length > 0) {
                        console.log("[CartContext Load Effect] Adjusted quantities for items with insufficient stock:", adjustedItems);
                        
                        // Update the server with the adjusted quantities
                        for (const item of adjustedItems) {
                            try {
                                // Try to update the item quantity on the server
                                await api.updateCartItemQuantity({
                                    itemId: item.id,
                                    quantity: item.newQuantity
                                });
                            } catch (updateError) {
                                console.error(`[CartContext Load Effect] Failed to update quantity for ${item.name}:`, updateError);
                            }
                        }
                        
                        // Show a toast to inform the user
                        if (adjustedItems.length === 1) {
                            const item = adjustedItems[0];
                            toast.warning(`Quantity for ${item.name} adjusted to ${item.newQuantity} due to stock limitations.`);
                        } else {
                            toast.warning(`${adjustedItems.length} items in your cart were adjusted due to stock limitations.`);
                        }
                    }

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
                // Check for specific stock-related errors
                if (error && error.message && error.message.includes("Not enough stock")) {
                    console.error("[CartContext Load Effect] Stock limitation error:", error.message);
                    
                    // Try to recover by refreshing the cart with a special flag
                    try {
                        console.log("[CartContext Load Effect] Attempting recovery from stock error...");
                        const recoveryCart = await api.getCart(true); // Pass 'true' to indicate recovery mode
                        
                        if (Array.isArray(recoveryCart) && recoveryCart.length > 0) {
                            const formattedRecoveryCart = recoveryCart.map(formatCartItem).filter(item => item !== null);
                            setCartItems(formattedRecoveryCart);
                            toast.warning("Some items in your cart were adjusted due to stock limitations.");
                            console.log("[CartContext Load Effect] Recovery successful.");
                            setError(null); // Clear the error since we recovered
                            setLoading(false);
                            return; // Exit early since we recovered
                        }
                    } catch (recoveryError) {
                        console.error("[CartContext Load Effect] Recovery attempt failed:", recoveryError);
                        // Continue with normal error handling
                    }
                }
                
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


// Function to generate friendly stock limitation messages
const getStockLimitMessage = (productName, availableStock) => {
    const messages = [
        `We adjusted your cart to ${availableStock} units of ${productName} (our current inventory limit).`,
        `Only ${availableStock} of ${productName} available! We've updated your cart.`,
        `Our warehouse elves could only find ${availableStock} units of ${productName}! Cart updated.`,
        `Popular choice! We have ${availableStock} ${productName} left and reserved them for you.`,
        `Limited stock alert! ${availableStock} units of ${productName} added to your cart.`,
        `Hot item! Only ${availableStock} ${productName} left - we've adjusted your cart.`
    ];
    
    // Choose a random message for variety
    return messages[Math.floor(Math.random() * messages.length)];
};

// Enhanced visual toast options
const showStockLimitToast = (message) => {
    toast.custom((t) => (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            style={{
                borderLeft: '6px solid #f97316', // Orange border
                padding: '16px',
                backgroundColor: '#fffaf0',  // Warm background
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
        >
            <div className="flex-1 w-0 p-0">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900" style={{ color: '#733612' }}>
                            Stock Limited
                        </p>
                        <p className="mt-1 text-sm text-gray-700" style={{ color: '#92400e' }}>
                            {message}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="mr-2 bg-white rounded-md p-1 hover:text-gray-700"
                    style={{ color: '#92400e' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    ), { duration: 4000 });
};


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
                
                // Check if we know the stock limit locally before making the API call
                if (product.stock !== undefined && quantity > product.stock) {
                    console.log(`[CartContext Add API] Adjusting quantity from ${quantity} to ${product.stock} due to stock limit`);
                    quantity = product.stock;
                    // Show a warning toast
                    const message = getStockLimitMessage(product.name, product.stock);
                    showStockLimitToast(message);
                }
                
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
                
                // Only show success toast if a warning wasn't already shown
                if (product.stock === undefined || quantity < product.stock) {
                    toast.success(`${product.name} added to cart!`);
                }
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
                        const message = getStockLimitMessage(newItem.name, maxStock);
                        showStockLimitToast(message);
                    } else if (newItem) {
                        updatedCart.push(newItem);
                        // Only show success toast if a warning wasn't shown
                        toast.success(`${product.name} added to cart!`);
                    }
                }
                setCartItems(updatedCart); // Update state, which triggers local storage save effect
            }
        } catch (error) {
            // Check for specific stock errors
            if (error.message && error.message.includes("Not enough stock")) {
                console.error(`[CartContext Add] Stock limitation error:`, error.message);
                
                // Try to extract the available stock from the error message
                const stockMatch = error.message.match(/Only (\d+) available/);
                const availableStock = stockMatch && stockMatch[1] ? parseInt(stockMatch[1], 10) : null;
                
                if (availableStock !== null && !isNaN(availableStock)) {
                    // Try to add the item with the available stock instead
                    try {
                        console.log(`[CartContext Add] Retrying with adjusted quantity ${availableStock}`);
                        
                        const result = await api.addToCart({
                            productId: product.id,
                            quantity: availableStock,
                            shade: product.selectedShade?.name || null
                        });
                        
                        // Refetch cart after successful retry
                        const apiCart = await api.getCart();
                        const formattedCart = (Array.isArray(apiCart) ? apiCart : []).map(formatCartItem).filter(item => item !== null);
                        setCartItems(formattedCart);
                        
                        const message = getStockLimitMessage(product.name, availableStock);
                        showStockLimitToast(message);
                        setLoading(false);
                        return; // Exit early since we recovered
                    } catch (retryError) {
                        console.error(`[CartContext Add] Retry failed:`, retryError);
                        // Fall through to normal error handling
                    }
                }
            }
            
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
        
        // IMPORTANT FIX: Don't let API calls go through if quantity is unchanged
        if (cartItems[itemIndex].quantity === quantity) {
            console.log(`[CartContext UpdateQ] Quantity unchanged (${quantity}), skipping API call`);
            return; // No need to update if quantity is the same
        }
        
        // Check if the requested quantity exceeds stock before proceeding
        const currentItem = cartItems[itemIndex];
        if (currentItem.stock !== undefined && quantity > currentItem.stock) {
            console.log(`[CartContext UpdateQ] Adjusting quantity from ${quantity} to ${currentItem.stock} due to stock limitation`);
            quantity = currentItem.stock;
            toast.warning(`Quantity adjusted to ${currentItem.stock} (maximum available stock)`, { duration: 2000 });
        }
        
        // First update state optimistically (for immediate UI feedback)
        const updatedCart = [...cartItems];
        updatedCart[itemIndex] = { 
            ...updatedCart[itemIndex], 
            quantity: quantity 
        };
        setCartItems(updatedCart);
        
        // Then make API request - BUT DON'T SET GLOBAL LOADING STATE
        setError(null);
        
        // Use a local loading state instead for this specific item
        const updatedWithLoading = [...updatedCart];
        updatedWithLoading[itemIndex] = {
            ...updatedCart[itemIndex],
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
                
                // FIX: Consider the case where the ID itself is the cart item ID (not the product ID)
                // This is important when the cart item ID and product ID are different
                const possibleCartItemId = item.id !== itemId ? item.id : null;
                if (possibleCartItemId && !cartItemId) {
                    console.log(`[CartContext UpdateQ] Using item.id as cartItemId since it differs from product ID`);
                    cartItemId = possibleCartItemId;
                }
                
                console.log(`[CartContext UpdateQ] Using ID properties:`, {
                    cartItemId,
                    itemId,
                    itemObject: item
                });
                
                // IMPORTANT FIX: For decrements, first try to use the direct update endpoint
                if (cartItemId) {
                    try {
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
                        
                        // Only show toast for significant changes
                        if (Math.abs(quantity - currentItem.quantity) > 2) {
                            toast.success("Cart updated", { duration: 1500 });
                        }
                        
                        return; // Exit early if successful
                    } catch (updateError) {
                        console.log(`[CartContext UpdateQ] Direct update failed, trying alternative approach`, updateError);
                        // Continue to alternative approaches
                    }
                }
                
                // IMPORTANT FIX: Use remove and add approach for decrement operations instead of the replace flag
                if (quantity < currentItem.quantity) {
                    console.log('[CartContext UpdateQ] Using remove/add approach for decreasing quantity');
                    
                    try {
                        // First remove the item
                        await api.removeFromCart({ itemId });
                        
                        // Then add with new quantity if quantity > 0
                        if (quantity > 0) {
                            await api.addToCart({
                                productId: itemId,
                                quantity: quantity,
                                // Include shade if available
                                shade: currentItem.selectedShade?.name
                            });
                        }
                        
                        // Success - update local state
                        const finalUpdatedCart = [...cartItems];
                        finalUpdatedCart[itemIndex] = {
                            ...finalUpdatedCart[itemIndex],
                            quantity: quantity,
                            isUpdating: false
                        };
                        setCartItems(finalUpdatedCart);
                        
                        // Only show toast for significant changes
                        if (Math.abs(quantity - currentItem.quantity) > 2) {
                            toast.success("Cart updated", { duration: 1500 });
                        }
                        
                        return; // Exit early if successful
                    } catch (removeAddError) {
                        console.log(`[CartContext UpdateQ] Remove/add approach failed`, removeAddError);
                        // Continue to fallback approaches
                    }
                }
                
                // If we still don't have a working approach, try the replacement approach (last resort)
                console.log('[CartContext UpdateQ] Using streamlined approach for updates');
                
                try {
                    // This will either create a new entry or find & update existing one
                    const result = await api.addToCart({
                        productId: itemId,
                        quantity: quantity,
                        replace: true, // Add a flag to indicate replacement
                        shade: currentItem.selectedShade?.name // Include shade if available
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
                } catch (apiError) {
                    // Handle the specific stock limitation error
                    if (apiError && apiError.message && apiError.message.includes("Not enough stock")) {
                        // Extract available stock from error message
                        const stockMatch = apiError.message.match(/Only (\d+) available/);
                        const availableStock = stockMatch && stockMatch[1] ? parseInt(stockMatch[1], 10) : null;
                        
                        if (availableStock !== null && !isNaN(availableStock)) {
                            console.log(`[CartContext UpdateQ] Stock limitation detected. Available: ${availableStock}`);
                            
                            // Update UI with available stock
                            const adjustedCart = [...cartItems];
                            adjustedCart[itemIndex] = {
                                ...adjustedCart[itemIndex],
                                quantity: availableStock,
                                isUpdating: false
                            };
                            setCartItems(adjustedCart);
                            
                            toast.warning(`Quantity adjusted to ${availableStock} (maximum available)`, { duration: 2000 });
                            return;
                        }
                    }
                    
                    // For other errors, revert the change and show error
                    console.error('[CartContext UpdateQ] Update failed:', apiError);
                    const revertedCart = [...cartItems];
                    revertedCart[itemIndex] = {
                        ...cartItems[itemIndex],
                        isUpdating: false
                    };
                    setCartItems(revertedCart);
                    toast.error('Failed to update cart');
                    return;
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
            // Don't set the global error state for stock limitation errors
            if (!err.message || !err.message.includes("Not enough stock")) {
                setError(err.message || "Failed to update item");
            }
            
            // Revert to original cart if the API call failed
            const revertedCart = [...cartItems];
            revertedCart[itemIndex] = {
                ...cartItems[itemIndex], // Revert to original item
                isUpdating: false // Clear the updating flag
            };
            setCartItems(revertedCart);
            
            // Only show error toast for non-stock issues
            if (!err.message || !err.message.includes("Not enough stock")) {
                toast.error(`Update failed: ${err.message || "Unknown error"}`);
            }
        }
        // We're not using the global loading state, so we don't need to clear it
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