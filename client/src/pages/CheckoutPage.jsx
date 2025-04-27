import React, { useContext } from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';
import { useCart } from '../context/CartContext'; // Import useCart to potentially display items or total
import { useNavigate } from 'react-router-dom';

function CheckoutPage() {
    const { theme, colorValues } = useContext(ThemeContext);
    const { cartItems, cartTotal, itemCount, loading: cartLoading } = useCart();
    const navigate = useNavigate();

    // Basic checkout logic placeholder
    const handlePlaceOrder = () => {
        // In a real app:
        // 1. Validate form data (address, payment)
        // 2. Send order details to backend API
        // 3. Handle success/error response
        // 4. Clear cart (optional, maybe on order success page)
        console.log("Placing order with items:", cartItems, "Total:", cartTotal);
        alert("Order Placed! (Placeholder)");
        // navigate('/order-confirmation'); // Navigate to a confirmation page
    };

    return (
        <Box sx={{ backgroundColor: colorValues.bgDefault, color: colorValues.textPrimary, py: 4, minHeight: '80vh' }}>
            <Container maxWidth="md">
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                    Checkout
                </Typography>

                {cartLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <Typography>Loading Cart...</Typography>
                    </Box>
                )}

                {!cartLoading && cartItems.length === 0 && (
                     <Paper elevation={1} sx={{ p: 4, textAlign: 'center', backgroundColor: colorValues.bgPaper }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Your cart is empty.</Typography>
                        <Button variant="contained" onClick={() => navigate('/products')} sx={{ backgroundColor: colorValues.primary, '&:hover': { backgroundColor: colorValues.primaryDark } }}>
                            Continue Shopping
                        </Button>
                    </Paper>
                )}

                {!cartLoading && cartItems.length > 0 && (
                    <Paper elevation={theme === 'dark' ? 3 : 1} sx={{ p: 3, backgroundColor: colorValues.bgPaper, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>Order Summary</Typography>
                        {/* Display items or just the total */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
                            <Typography>Total Items:</Typography>
                            <Typography sx={{ fontWeight: 500 }}>{itemCount}</Typography>
                        </Box>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6">Total Amount:</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>${cartTotal.toFixed(2)}</Typography>
                        </Box>

                        {/* Placeholder for Address and Payment Forms */}
                        <Typography variant="body1" sx={{ my: 3, textAlign: 'center', color: colorValues.textSecondary }}>
                            (Address and Payment Forms would go here)
                        </Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handlePlaceOrder}
                            disabled={cartLoading || cartItems.length === 0}
                            sx={{
                                backgroundColor: colorValues.primary,
                                '&:hover': { backgroundColor: colorValues.primaryDark },
                                py: 1.5,
                                borderRadius: '50px',
                                color: 'white'
                            }}
                        >
                            Place Order (Placeholder)
                        </Button>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}

export default CheckoutPage;
