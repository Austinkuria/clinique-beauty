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
        setLoading(true);

        try {
            if (isSignedIn) {
                // Add to server cart for authenticated users
                await api.addToCart(product.id, quantity);
                fetchCart(); // Refresh cart from server
            } else {
                // Add to local cart for anonymous users
                setCart(prevCart => {
                    const existingItem = prevCart.items.find(item => item.product.id === product.id);

                    if (existingItem) {
                        // Update quantity if item exists
                        const updatedItems = prevCart.items.map(item =>
                            item.product.id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );

                        return {
                            items: updatedItems,
                            total: calculateTotal(updatedItems)
                        };
                    } else {
                        // Add new item
                        const newItems = [
                            ...prevCart.items,
                            { product, quantity }
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
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        setLoading(true);

        try {
            if (isSignedIn) {
                // Update server cart for authenticated users
                await api.updateCartItem(itemId, quantity);
                fetchCart(); // Refresh cart from server
            } else {
                // Update local cart for anonymous users
                setCart(prevCart => {
                    const updatedItems = prevCart.items.map(item =>
                        item.product.id === itemId
                            ? { ...item, quantity }
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