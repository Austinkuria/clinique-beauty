import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useApi } from '../api/apiClient';
import toast from 'react-hot-toast'; // Import toast

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const { isSignedIn } = useAuth();
    const api = useApi();

    // Fetch cart from the server if user is signed in
    useEffect(() => {
        if (isSignedIn) {
            fetchCart();
        } else {
            // Load cart from localStorage for anonymous users
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        }
    }, [isSignedIn]);

    // Save cart to localStorage for anonymous users
    useEffect(() => {
        if (!isSignedIn && cart.items.length > 0) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, isSignedIn]);

    const fetchCart = async () => {
        if (!isSignedIn) return;

        setLoading(true);
        try {
            const cartData = await api.getCart();
            setCart(cartData);
        } catch (error) {
            console.error('Error fetching cart:', error);
            toast.error('Could not load your cart.'); // Toast on fetch error
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        // Ensure product object includes stock
        if (!product || product.stock === undefined) {
            console.error('Product data is missing stock information.');
            toast.error('Cannot add item: Product details incomplete.'); // Toast for incomplete data
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Adding to cart...'); // Loading toast

        try {
            if (isSignedIn) {
                // Add to server cart for authenticated users
                // Server-side validation handles stock check
                await api.addToCart(product.id, quantity);
                toast.success(`${quantity} ${product.name}(s) added to cart!`, { id: toastId }); // Success toast
                fetchCart(); // Refresh cart from server
            } else {
                // Add to local cart for anonymous users
                let itemAddedOrUpdated = false; // Flag to check if state changed
                setCart(prevCart => {
                    const existingItem = prevCart.items.find(item => item.product.id === product.id);
                    const availableStock = product.stock;

                    if (existingItem) {
                        const newQuantity = existingItem.quantity + quantity;
                        // Check stock for existing item update
                        if (newQuantity > availableStock) {
                            // console.warn(`Cannot add ${quantity}. Total quantity would exceed stock (${availableStock} available).`);
                            toast.error(`Only ${availableStock} ${product.name}(s) available.`, { id: toastId }); // Error toast for stock limit
                            return prevCart; // Return previous cart state without changes
                        }

                        // Update quantity if item exists and stock is sufficient
                        itemAddedOrUpdated = true; // Mark as updated
                        const updatedItems = prevCart.items.map(item =>
                            item.product.id === product.id
                                ? { ...item, quantity: newQuantity }
                                : item
                        );

                        return {
                            items: updatedItems,
                            total: calculateTotal(updatedItems)
                        };
                    } else {
                        // Check stock for new item addition
                        if (quantity > availableStock) {
                            //  console.warn(`Cannot add ${quantity}. Requested quantity exceeds stock (${availableStock} available).`);
                            toast.error(`Only ${availableStock} ${product.name}(s) available.`, { id: toastId }); // Error toast for stock limit
                            return prevCart; // Return previous cart state without changes
                        }
                        // Add new item if stock is sufficient
                        itemAddedOrUpdated = true; // Mark as added
                        const newItems = [
                            ...prevCart.items,
                            // Ensure the full product object (including stock) is stored
                            { product: { ...product }, quantity }
                        ];

                        return {
                            items: newItems,
                            total: calculateTotal(newItems)
                        };
                    }
                });
                // Show success toast only if an item was actually added/updated
                if (itemAddedOrUpdated) {
                    toast.success(`${quantity} ${product.name}(s) added to cart!`, { id: toastId });
                }
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(`Failed to add ${product.name} to cart.`, { id: toastId }); // Error toast on catch
        } finally {
            setLoading(false);
            // Ensure loading toast is dismissed if no other toast replaced it
            if (!toast.success && !toast.error) {
                 toast.dismiss(toastId);
            }
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        setLoading(true);
        const toastId = toast.loading('Updating quantity...'); // Loading toast

        try {
            if (isSignedIn) {
                // Update server cart for authenticated users
                // Server-side validation handles stock check
                await api.updateCartItem(itemId, quantity);
                toast.success('Cart updated!', { id: toastId }); // Success toast
                fetchCart(); // Refresh cart from server
            } else {
                // Update local cart for anonymous users
                let quantityChanged = false; // Flag to check if state changed
                setCart(prevCart => {
                    const itemToUpdate = prevCart.items.find(item => item.product.id === itemId);
                    if (!itemToUpdate) {
                        toast.error('Item not found in cart.', { id: toastId }); // Error if item missing
                        return prevCart; // Item not found
                    }

                    const availableStock = itemToUpdate.product.stock;

                    // Validate quantity against stock and minimum value
                    let validatedQuantity = quantity;
                    if (validatedQuantity < 1) {
                        validatedQuantity = 1;
                    }
                    if (availableStock !== undefined && validatedQuantity > availableStock) {
                        // console.warn(`Cannot set quantity above available stock (${availableStock})`);
                        toast.error(`Only ${availableStock} ${itemToUpdate.product.name}(s) available.`, { id: toastId }); // Error toast for stock limit
                        validatedQuantity = availableStock; // Cap at max stock
                    }

                    // Only update state if the quantity actually changes
                    if (itemToUpdate.quantity !== validatedQuantity) {
                        quantityChanged = true;
                        const updatedItems = prevCart.items.map(item =>
                            item.product.id === itemId
                                ? { ...item, quantity: validatedQuantity }
                                : item
                        );

                        return {
                            items: updatedItems,
                            total: calculateTotal(updatedItems)
                        };
                    } else {
                        // If quantity didn't change (e.g., tried to exceed stock), dismiss loading toast
                        toast.dismiss(toastId);
                        return prevCart; // No change needed
                    }
                });
                // Show success toast only if quantity actually changed
                if (quantityChanged) {
                     toast.success('Quantity updated!', { id: toastId });
                }
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update quantity.', { id: toastId }); // Error toast on catch
        } finally {
            setLoading(false);
             // Ensure loading toast is dismissed if no other toast replaced it
             if (!toast.success && !toast.error) {
                 toast.dismiss(toastId);
             }
        }
    };

    const removeItem = async (itemId) => {
        setLoading(true);
        const toastId = toast.loading('Removing item...'); // Loading toast

        // Find item name for toast message (needed for anonymous cart)
        const itemToRemove = cart.items.find(item => (isSignedIn ? item.id === itemId : item.product.id === itemId));
        const itemName = itemToRemove?.product?.name || 'Item';


        try {
            if (isSignedIn) {
                // Remove from server cart for authenticated users
                await api.removeFromCart(itemId);
                toast.success(`${itemName} removed from cart.`, { id: toastId }); // Success toast
                fetchCart(); // Refresh cart from server
            } else {
                // Remove from local cart for anonymous users
                let itemRemoved = false; // Flag
                setCart(prevCart => {
                    const initialLength = prevCart.items.length;
                    const updatedItems = prevCart.items.filter(item => item.product.id !== itemId);
                    if (updatedItems.length < initialLength) {
                        itemRemoved = true; // Mark as removed
                    }
                    return {
                        items: updatedItems,
                        total: calculateTotal(updatedItems)
                    };
                });
                 if (itemRemoved) {
                    toast.success(`${itemName} removed from cart.`, { id: toastId }); // Success toast
                 } else {
                    // If item wasn't found/removed, dismiss loading
                    toast.dismiss(toastId);
                 }
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error(`Failed to remove ${itemName}.`, { id: toastId }); // Error toast on catch
        } finally {
            setLoading(false);
             // Ensure loading toast is dismissed if no other toast replaced it
             if (!toast.success && !toast.error) {
                 toast.dismiss(toastId);
             }
        }
    };

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    const clearCart = async () => { // Make async if backend clear is needed
        const toastId = toast.loading('Clearing cart...');
        try {
            // Optional: Add backend call to clear cart if necessary for signed-in users
            // if (isSignedIn) { await api.clearServerCart(); }

            setCart({ items: [], total: 0 });
            if (!isSignedIn) {
                localStorage.removeItem('cart');
            }
            toast.success('Cart cleared.', { id: toastId });
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart.', { id: toastId });
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);