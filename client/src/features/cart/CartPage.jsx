import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Cart from './Cart';
import { CartProvider } from '../../context/CartContext'; // Import CartProvider if needed

function CartPage() {
    return (
        <Box sx={{ py: 4 }}>
            <Container>
                <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Your Cart
                </Typography>
                
                {/* If CartProvider is not already in a parent component, add it here */}
                <Cart />
            </Container>
        </Box>
    );
}

export default CartPage;
