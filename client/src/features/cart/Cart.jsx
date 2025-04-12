import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast'; // Import toast
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  IconButton,
  Divider,
  Card,
  CardMedia,
  Stack,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  KeyboardReturn as ReturnIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Cart = () => {
  const { cartItems, setCartItems } = useCart(); // Assuming useCart provides items with product details including stock
  const [loading, setLoading] = useState(false);

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    const itemToUpdate = cartItems.find(item => item.id === itemId);
    if (!itemToUpdate) return;

    // Check against stock if product details are available
    const maxQuantity = itemToUpdate.product?.stock;
    if (maxQuantity !== undefined && newQuantity > maxQuantity) {
      toast.error(`Cannot set quantity above available stock (${maxQuantity})`); // Show toast message
      console.log(`Cannot set quantity above available stock (${maxQuantity})`)
      newQuantity = maxQuantity; // Cap at max stock
    }

    if (newQuantity < 1) {
      newQuantity = 1; // Ensure quantity doesn't go below 1
    }

    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  };

  const handleCheckout = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Redirect would happen here
    }, 1500);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Processing your order...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Your Shopping Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <CartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography color="text.secondary" paragraph>
            Looks like you haven't added any products to your cart yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/products"
            startIcon={<ReturnIcon />}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
              {cartItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <Box sx={{ display: 'flex', py: 2 }}>
                    <Card elevation={0} sx={{ display: 'flex', width: '100%' }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 100, height: 100, objectFit: 'cover' }}
                        image={item.image}
                        alt={item.name}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, px: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="h6">{item.name}</Typography>
                          <Typography variant="h6" color="primary">
                            ${(item.price * (item.quantity || 1)).toFixed(2)}
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {item.description?.substring(0, 60)}...
                        </Typography>

                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 2
                        }}>
                          <Stack direction="row" alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                              disabled={(item.quantity || 1) <= 1}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>

                            <TextField
                              size="small"
                              type="number" // Ensure type is number
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                // Allow empty input temporarily, but handle NaN/zero on blur or update
                                if (!isNaN(val)) {
                                  updateQuantity(item.id, val); // Update immediately or on blur
                                } else if (e.target.value === '') {
                                  // Handle empty string case if needed, maybe set temporary state
                                }
                              }}
                              // Optional: Add onBlur handler to finalize value if allowing empty input
                              // onBlur={(e) => {
                              //   const val = parseInt(e.target.value);
                              //   if (isNaN(val) || val < 1) {
                              //     updateQuantity(item.id, 1); // Reset to 1 if invalid on blur
                              //   }
                              // }}
                              inputProps={{
                                style: { textAlign: 'center', MozAppearance: 'textfield' }, // Hide spinners in Firefox
                                min: 1,
                                max: item.product?.stock, // Set max based on stock
                              }}
                              sx={{
                                width: '60px',
                                mx: 1,
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                  WebkitAppearance: 'none', // Hide spinners in Chrome/Safari
                                  margin: 0,
                                },
                              }}
                            />

                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                              // Disable if quantity reaches stock
                              disabled={item.product?.stock !== undefined && (item.quantity || 1) >= item.product.stock}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          <IconButton
                            color="error"
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove from cart"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  </Box>
                  {index < cartItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Paper>

            <Button
              component={RouterLink}
              to="/products"
              startIcon={<ReturnIcon />}
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>

              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                my: 2
              }}>
                <Typography>Subtotal ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</Typography>
                <Typography>${calculateSubtotal().toFixed(2)}</Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 2
              }}>
                <Typography>Shipping</Typography>
                <Typography>Free</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 3
              }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">${calculateSubtotal().toFixed(2)}</Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart;
