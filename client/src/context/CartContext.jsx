import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useApi } from '../api/apiClient';

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
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        // Ensure product object includes stock
        if (!product || product.stock === undefined) {
            console.error('Product data is missing stock information.');
            // Optionally fetch full product details if only ID was passed
            return;
        }

        setLoading(true);

        try {
            if (isSignedIn) {
                // Add to server cart for authenticated users
                // Server-side validation handles stock check
                await api.addToCart(product.id, quantity);
                fetchCart(); // Refresh cart from server
            } else {
                // Add to local cart for anonymous users
                setCart(prevCart => {
                    const existingItem = prevCart.items.find(item => item.product.id === product.id);
                    const availableStock = product.stock;

                    if (existingItem) {
                        const newQuantity = existingItem.quantity + quantity;
                        // Check stock for existing item update
                        if (newQuantity > availableStock) {
                            console.warn(`Cannot add ${quantity}. Total quantity would exceed stock (${availableStock} available).`);
                            // Optionally show a toast message
                            // Return previous cart state without changes
                            return prevCart;
                        }

                        // Update quantity if item exists and stock is sufficient
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
                            console.warn(`Cannot add ${quantity}. Requested quantity exceeds stock (${availableStock} available).`);
                            // Optionally show a toast message
                            // Return previous cart state without changes
                            return prevCart;
                        }
                        // Add new item if stock is sufficient
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
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Optionally show error toast to user
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        setLoading(true);

        try {
            if (isSignedIn) {
                // Update server cart for authenticated users
                // Server-side validation handles stock check
                await api.updateCartItem(itemId, quantity);
                fetchCart(); // Refresh cart from server
            } else {
                // Update local cart for anonymous users
                setCart(prevCart => {
                    const itemToUpdate = prevCart.items.find(item => item.product.id === itemId);
                    if (!itemToUpdate) return prevCart; // Item not found

                    const availableStock = itemToUpdate.product.stock;

                    // Validate quantity against stock and minimum value
                    let validatedQuantity = quantity;
                    if (validatedQuantity < 1) {
                        validatedQuantity = 1;
                    }
                    if (availableStock !== undefined && validatedQuantity > availableStock) {
                        console.warn(`Cannot set quantity above available stock (${availableStock})`);
                        validatedQuantity = availableStock; // Cap at max stock
                    }

                    const updatedItems = prevCart.items.map(item =>
                        item.product.id === itemId
                            ? { ...item, quantity: validatedQuantity }
                            : item
                    );

                    return {
                        items: updatedItems,
                        total: calculateTotal(updatedItems)
                    };
                });
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            // Optionally show error toast to user
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        setLoading(true);

        try {
            if (isSignedIn) {
                // Remove from server cart for authenticated users
                await api.removeFromCart(itemId);
                fetchCart(); // Refresh cart from server
            } else {
                // Remove from local cart for anonymous users
                setCart(prevCart => {
                    const updatedItems = prevCart.items.filter(item => item.product.id !== itemId);

                    return {
                        items: updatedItems,
                        total: calculateTotal(updatedItems)
                    };
                });
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    const clearCart = () => {
        setCart({ items: [], total: 0 });
        if (!isSignedIn) {
            localStorage.removeItem('cart');
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