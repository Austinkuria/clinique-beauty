import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ThemeContext } from '../context/ThemeContext';
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
    Link // Import Link for breadcrumbs/navigation
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import defaultProductImage from '../assets/images/placeholder.webp'; // Fallback image

function CartPage() {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        loading: cartLoading // Get loading state from context
    } = useCart();
    const { theme, colorValues } = useContext(ThemeContext);
    const navigate = useNavigate();

    // --- Add Logging ---
    console.log("[CartPage Render] Cart Items:", cartItems);
    console.log("[CartPage Render] Cart Loading:", cartLoading);
    // --- End Logging ---


    const handleQuantityChange = (item, newQuantity) => {
        const quantityNum = parseInt(newQuantity, 10);
        if (!isNaN(quantityNum) && quantityNum >= 0) {
            // Use item.selectedShade?.name if available, otherwise null
            updateQuantity(item.id, quantityNum, item.selectedShade?.name);
        }
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
                            {cartItems.map((item, index) => {
                                // --- Add Logging for each item ---
                                console.log(`[CartPage Render] Item ${index}:`, item);
                                // --- End Logging ---
                                const itemSubtotal = (item.price || 0) * item.quantity; // Use default 0 if price missing

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
                                                ${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || cartLoading} // Disable if loading
                                                aria-label="Decrease quantity"
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            <TextField
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item, e.target.value)}
                                                type="number"
                                                size="small"
                                                disabled={cartLoading} // Disable if loading
                                                inputProps={{ min: 1, style: { textAlign: 'center', width: '40px', MozAppearance: 'textfield' } }}
                                                sx={{ mx: 0.5, '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 } }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                disabled={cartLoading} // Disable if loading
                                                aria-label="Increase quantity"
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 500, minWidth: '80px', textAlign: 'right', mr: 2 }}>
                                            ${itemSubtotal.toFixed(2)}
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
                                    <Typography sx={{ fontWeight: 500 }}>${cartTotal.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography>Shipping</Typography>
                                    <Typography sx={{ fontWeight: 500, color: colorValues.success }}>FREE</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>${cartTotal.toFixed(2)}</Typography>
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
