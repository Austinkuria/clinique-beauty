import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ThemeContext } from '../context/ThemeContext';
import { formatCurrency } from '../utils/helpers';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    Button,
    IconButton,
    TextField,
    Divider,
    Link, // Import Link for breadcrumbs/navigation
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import defaultProductImage from '../assets/images/placeholder.webp'; // Fallback image
import { debounce } from '../utils/helpers'; // We'll create this utility if needed

function CartPage() {
    const {
        cartItems,
        removeFromCart,
        updateCartItem, // Renamed for clarity
        clearCart,
        cartTotal,
        cartItemCount,
        loading: cartLoading,
        loadCart // Get the loadCart function from context if available
    } = useCart();
    const { theme, colorValues } = useContext(ThemeContext);
    const navigate = useNavigate();
    
    // Add state to track items being updated
    const [updatingItems, setUpdatingItems] = useState({});

    // Local state for optimistic UI updates
    const [localCartItems, setLocalCartItems] = useState([]);

    // Sync local state with context when cart items change
    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            setLocalCartItems(cartItems);
        }
    }, [cartItems]);

    // Add effect to load cart data when component mounts
    useEffect(() => {
        console.log("[CartPage] Component mounted, ensuring cart is loaded");
        // Check if loadCart function exists, otherwise try to access cart items directly
        if (loadCart && typeof loadCart === 'function') {
            console.log("[CartPage] Calling loadCart from context");
            loadCart();
        } else {
            console.log("[CartPage] loadCart function not available in context");
        }
    }, [loadCart]); // Only run on mount and if loadCart changes

    // Create a debounced update function to reduce API calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdateQuantity = React.useCallback(
        debounce((itemId, quantity, shade) => {
            updateCartItem(itemId, quantity, shade);
        }, 750), // 750ms delay
        [updateCartItem]
    );

    // --- Add Logging ---
    console.log("[CartPage Render] Cart Items:", cartItems);
    console.log("[CartPage Render] Cart Loading:", cartLoading);
    // --- End Logging ---

    // Fixed version that avoids unnecessary API calls
    const handleQuantityChange = (item, newQuantity) => {
        const quantityNum = parseInt(newQuantity, 10);
        
        // Early return for invalid values or no change
        if (isNaN(quantityNum) || quantityNum < 1 || quantityNum === item.quantity) {
            return;
        }
        
        // Respect stock limitations if available
        if (item.stock !== undefined && quantityNum > item.stock) {
            // If user is trying to exceed stock, cap at max stock
            console.log(`[CartPage] Capping quantity at stock limit: ${item.stock}`);
            updateCartItem(item.id, item.stock);
            return;
        }
        
        // Show local updating state
        setUpdatingItems(prev => ({...prev, [item.id]: true}));
        
        // Call context update function with correct item ID
        updateCartItem(item.id, quantityNum);
        
        // Clear updating state after a delay
        setTimeout(() => {
            setUpdatingItems(prev => ({...prev, [item.id]: false}));
        }, 2000);
    };

    const handleIncrementQuantity = (item) => {
        // Don't allow incrementing beyond stock
        if (item.stock && item.quantity >= item.stock) return;
        handleQuantityChange(item, item.quantity + 1);
    };

    const handleDecrementQuantity = (item) => {
        if (item.quantity <= 1) return;
        handleQuantityChange(item, item.quantity - 1);
    };

    const handleRemoveItem = (item) => {
        // Use item.selectedShade?.name if available, otherwise null
        removeFromCart(item.id, item.selectedShade?.name);
    };

    const handleCheckout = () => {
        navigate('/checkout'); // Navigate to checkout page
    };

    return (
        <Box sx={{ backgroundColor: colorValues.bgDefault, color: colorValues.textPrimary, py: 4, minHeight: '80vh' }}>
            <Container>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                    Shopping Cart
                </Typography>

                {cartLoading && ( // Display loading indicator if cart is loading
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <Typography>Loading Cart...</Typography>
                        {/* Or use a CircularProgress component */}
                    </Box>
                )}

                {!cartLoading && cartItems.length === 0 ? (
                    <Paper elevation={1} sx={{ p: 4, textAlign: 'center', backgroundColor: colorValues.bgPaper }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Your cart is empty.</Typography>
                        <Button variant="contained" component={RouterLink} to="/products" sx={{ backgroundColor: colorValues.primary, '&:hover': { backgroundColor: colorValues.primaryDark } }}>
                            Continue Shopping
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={4}>
                        {/* Cart Items List */}
                        <Grid item xs={12} md={8}>
                            {(localCartItems.length > 0 ? localCartItems : cartItems).map((item, index) => {
                                // --- Add Logging for each item ---
                                console.log(`[CartPage Render] Item ${index}:`, item);
                                // --- End Logging ---
                                const itemSubtotal = (item.price || 0) * item.quantity; // Use default 0 if price missing
                                const isUpdating = updatingItems[item.id];

                                return (
                                    <Paper key={`${item.id}-${item.selectedShade?.name || index}`} elevation={theme === 'dark' ? 3 : 1} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', backgroundColor: colorValues.bgPaper }}>
                                        <Box
                                            component="img"
                                            src={item.image || defaultProductImage} // Use item image or fallback
                                            alt={item.name || 'Product Image'} // Use item name or fallback alt
                                            sx={{ width: 80, height: 80, objectFit: 'contain', mr: 2, borderRadius: 1 }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = defaultProductImage; }} // Handle image loading errors
                                        />
                                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                                            {/* Safely access name */}
                                            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                                                {item.name || 'Product Name Unavailable'}
                                            </Typography>
                                            {/* Display shade if available */}
                                            {item.selectedShade && (
                                                <Typography variant="body2" sx={{ color: colorValues.textSecondary, fontSize: '0.9rem' }}>
                                                    Shade: {item.selectedShade.name}
                                                </Typography>
                                            )}
                                            {/* Safely access price */}
                                            <Typography variant="body1" sx={{ color: colorValues.primary, fontWeight: 500, my: 0.5 }}>
                                                {typeof item.price === 'number' ? formatCurrency(item.price) : 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, position: 'relative' }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => item.quantity > 1 && handleQuantityChange(item, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || cartLoading || updatingItems[item.id]}
                                                aria-label="Decrease quantity"
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            <TextField
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item, e.target.value)}
                                                type="number"
                                                size="small"
                                                disabled={cartLoading || updatingItems[item.id]}
                                                inputProps={{ 
                                                    min: 1, 
                                                    max: item.stock || undefined,
                                                    style: { textAlign: 'center', width: '40px', MozAppearance: 'textfield' } 
                                                }}
                                                sx={{ 
                                                    mx: 0.5, 
                                                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { 
                                                        WebkitAppearance: 'none', 
                                                        margin: 0 
                                                    },
                                                    position: 'relative'
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    // Don't allow incrementing beyond stock
                                                    if (item.stock !== undefined && item.quantity >= item.stock) return;
                                                    handleQuantityChange(item, item.quantity + 1);
                                                }}
                                                disabled={cartLoading || updatingItems[item.id] || (item.stock !== undefined && item.quantity >= item.stock)}
                                                aria-label="Increase quantity"
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                            
                                            {/* Item-specific loading indicator */}
                                            {isUpdating && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                                        borderRadius: '4px',
                                                        zIndex: 1,
                                                    }}
                                                >
                                                    <CircularProgress size={16} thickness={4} sx={{ color: colorValues.primary }} />
                                                </Box>
                                            )}
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500, minWidth: '80px', textAlign: 'right', mr: 2 }}>
                                            {formatCurrency(itemSubtotal)}
                                        </Typography>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleRemoveItem(item)}
                                            disabled={cartLoading} // Disable if loading
                                            sx={{ color: colorValues.error }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Paper>
                                );
                            })}
                             {/* Clear Cart Button */}
                             <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={clearCart}
                                    disabled={cartLoading || cartItems.length === 0} // Disable if loading or empty
                                >
                                    Clear Cart
                                </Button>
                            </Box>
                        </Grid>

                        {/* Order Summary */}
                        <Grid item xs={12} md={4}>
                            <Paper elevation={theme === 'dark' ? 4 : 2} sx={{ p: 3, backgroundColor: colorValues.bgPaper }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                    Order Summary
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Subtotal ({cartItemCount} items)</Typography>
                                    {/* Ensure cartTotal is calculated correctly */}
                                    <Typography sx={{ fontWeight: 500 }}>{formatCurrency(cartTotal)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography>Shipping</Typography>
                                    <Typography sx={{ fontWeight: 500, color: colorValues.success }}>FREE</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{formatCurrency(cartTotal)}</Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={handleCheckout}
                                    disabled={cartLoading || cartItems.length === 0} // Disable if loading or empty
                                    sx={{
                                        backgroundColor: colorValues.primary,
                                        '&:hover': { backgroundColor: colorValues.primaryDark },
                                        py: 1.5,
                                        borderRadius: '50px'
                                    }}
                                >
                                    Proceed to Checkout
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

export default CartPage;
