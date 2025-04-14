import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();
const LOCAL_STORAGE_KEY = 'anonymousWishlist';

export const WishlistProvider = ({ children }) => {
    const { user, isSignedIn, isLoaded } = useUser();
    // This state holds the current wishlist, regardless of auth status
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false); // For Clerk updates

    // --- Load initial wishlist ---
    useEffect(() => {
        if (!isLoaded) return; // Wait for Clerk to load

        if (isSignedIn && user) {
            // Signed-in user: Load from Clerk metadata
            console.log("[Wishlist Init] Signed in. Loading from metadata.");
            const metadataWishlist = Array.isArray(user.publicMetadata?.wishlist)
                ? user.publicMetadata.wishlist
                : [];
            setWishlist(metadataWishlist);
            // Clear local storage if user is signed in to avoid conflicts
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } else {
            // Anonymous user: Load from localStorage
            console.log("[Wishlist Init] Anonymous. Loading from localStorage.");
            try {
                const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
                const localWishlist = localData ? JSON.parse(localData) : [];
                // Ensure it's an array
                setWishlist(Array.isArray(localWishlist) ? localWishlist : []);
            } catch (error) {
                console.error("Error reading anonymous wishlist from localStorage:", error);
                setWishlist([]); // Reset on error
            }
        }
    }, [isLoaded, isSignedIn, user]); // Rerun when auth state changes

    // --- Save anonymous wishlist to localStorage ---
    useEffect(() => {
        // Only save if the user is anonymous AND the wishlist has been initialized
        if (!isSignedIn && isLoaded) {
            console.log("[Wishlist Save] Anonymous. Saving to localStorage:", wishlist);
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlist));
            } catch (error) {
                console.error("Error saving anonymous wishlist to localStorage:", error);
            }
        }
    }, [wishlist, isSignedIn, isLoaded]); // Rerun when wishlist or auth state changes

    // --- Update Clerk Metadata (for signed-in users) ---
    const updateWishlistMetadata = async (newWishlist) => {
        // This function is only for signed-in users
        if (!isSignedIn || !user) return false;

        setLoading(true);
        // Use a variable for the toast message
        const isAdding = newWishlist.length > wishlist.length;
        const loadingMessage = isAdding ? "Adding to wishlist..." : "Removing from wishlist...";
        console.log(`[WishlistContext] Calling toast.loading: "${loadingMessage}"`); // Log before loading toast
        const toastId = toast.loading(loadingMessage);
        try {
            await user.update({
                publicMetadata: {
                    ...user.publicMetadata,
                    wishlist: newWishlist,
                },
            });
            // Update local state *after* successful metadata update
            // Clerk's hook might update user object, triggering the load effect,
            // but setting state here ensures immediate UI feedback.
            setWishlist(newWishlist);
            // Update toast message on success
            const successMessage = isAdding ? "Added to wishlist!" : "Removed from wishlist!";
            console.log(`[WishlistContext] Calling toast.success: "${successMessage}" (ID: ${toastId})`); // Log before success toast
            toast.success(successMessage, { id: toastId });
            return true;
        } catch (error) {
            console.error("Error updating wishlist metadata:", error);
            console.log(`[WishlistContext] Calling toast.error: "Failed to update wishlist." (ID: ${toastId})`); // Log before error toast
            toast.error("Failed to update wishlist.", { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // --- Public Actions (Work for both signed-in and anonymous) ---

    const addToWishlist = async (productId) => {
        if (wishlist.includes(productId)) {
            // Inform user it's already there, maybe use a less prominent toast or none
            // toast.success("Item already in wishlist.");
            return; // No change needed
        }

        const newWishlist = [...wishlist, productId];

        if (isSignedIn) {
            console.log("[WishlistContext] Calling updateWishlistMetadata for add.");
            // updateWishlistMetadata handles its own toasts (loading/success/error)
            await updateWishlistMetadata(newWishlist);
        } else {
            // Anonymous: Update state and show a simple success toast
            setWishlist(newWishlist);
            const successMessage = "Added to wishlist!";
            console.log(`[WishlistContext] Anonymous: Calling toast.success: "${successMessage}"`); // Log before anonymous success toast
            toast.success(successMessage); // Simple success for local add
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!wishlist.includes(productId)) {
            // Item not found, maybe show an error or do nothing silently
            // toast.error("Item not found in wishlist.");
            return; // No change needed
        }

        const newWishlist = wishlist.filter(id => id !== productId);

        if (isSignedIn) {
            console.log("[WishlistContext] Calling updateWishlistMetadata for remove.");
            // updateWishlistMetadata handles its own toasts (loading/success/error)
            await updateWishlistMetadata(newWishlist);
        } else {
            // Anonymous: Update state and show a simple success toast
            setWishlist(newWishlist);
            const successMessage = "Removed from wishlist!";
            console.log(`[WishlistContext] Anonymous: Calling toast.success: "${successMessage}"`); // Log before anonymous success toast
            toast.success(successMessage); // Simple success for local remove
        }
    };

    const isInWishlist = (productId) => {
        // Simply checks the current state, which is loaded based on auth status
        return wishlist.includes(productId);
    };

    const toggleWishlist = async (productId) => {
        if (isInWishlist(productId)) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
    };

    // Note: This context doesn't handle merging local wishlist to Clerk on sign-in.
    // It currently just switches to the Clerk data when signed in.

    return (
        <WishlistContext.Provider value={{
            wishlist, // The current wishlist (either local or from metadata)
            loading, // Loading state specifically for metadata updates
            isInWishlist,
            toggleWishlist,
            addToWishlist,
            removeFromWishlist,
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
