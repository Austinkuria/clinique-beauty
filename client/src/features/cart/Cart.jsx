import React, { useContext } from 'react';
import { Container, Typography, Box, Grid, Paper, Button, IconButton, TextField, CircularProgress, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../../context/CartContext'; // Import useCart hook
import { ThemeContext } from '../../context/ThemeContext';
import defaultProductImage from '../../assets/images/placeholder.webp'; // Fallback image

function Cart() {
  // Get cart data with safe destructuring
  const cartContext = useCart();
  
  // Add null check and default values to prevent "Cannot read properties of undefined" error
  const { 
      cartItems = [], 
      cartTotal = 0,
      itemCount = 0,  // Make sure to include itemCount in destructuring
      loading = false, 
      error = null,
      removeFromCart = () => {},
      updateCartItem = () => {},
      clearCart = () => {}
  } = cartContext || {};
  
  // Now use the destructured variables safely throughout the component
  
  const { theme, colorValues } = useContext(ThemeContext); // Get theme context
  const navigate = useNavigate(); // Get navigate function

  const handleQuantityChange = (item, newQuantity) => {
    const quantityNum = parseInt(newQuantity, 10);
    if (!isNaN(quantityNum) && quantityNum >= 1) {
      // Check against stock if available on the item object directly
      const maxQuantity = item.stock ?? Infinity;
      if (quantityNum <= maxQuantity) {
        updateCartItem(item.id, quantityNum); // Use context function
      } else {
        console.warn(`Quantity limited to ${maxQuantity} due to stock.`);
        updateCartItem(item.id, maxQuantity); // Update to max stock
      }
    } else if (!isNaN(quantityNum) && quantityNum < 1) {
      // If user tries to set quantity below 1, remove item
      removeFromCart(item.id); // Use context function
    }
  };

  const handleIncrement = (item) => {
    // First update the UI optimistically for better user experience
    const maxQuantity = item.stock ?? Infinity;
    if (item.quantity < maxQuantity) {
      // Create a copy of cartItems with updated quantity
      const optimisticCart = cartContext.cartItems.map(cartItem => {
        if (cartItem.id === item.id) {
          return { ...cartItem, quantity: cartItem.quantity + 1 };
        }
        return cartItem;
      });
      
      // Temporarily update the UI (this won't persist, just for visual feedback)
      console.log("[Cart] Optimistically updating quantity for item:", item.id);
      
      // Then make the API call
      updateCartItem(item.id, item.quantity + 1);
    } else {
      toast.error(`Cannot add more. Maximum stock (${maxQuantity}) reached.`);
    }
  };

  const handleDecrement = (item) => {
    // First update the UI optimistically
    if (item.quantity > 1) {
      // Create a copy of cartItems with updated quantity
      const optimisticCart = cartContext.cartItems.map(cartItem => {
        if (cartItem.id === item.id) {
          return { ...cartItem, quantity: cartItem.quantity - 1 };
        }
        return cartItem;
      });
      
      // Temporarily update the UI
      console.log("[Cart] Optimistically updating quantity for item:", item.id);
      
      // Then make the API call
      updateCartItem(item.id, item.quantity - 1);
    } else {
      // Remove item if quantity becomes 0 or less
      removeFromCart(item.id);
    }
  };

  const handleCheckout = () => {
      navigate('/checkout'); // Navigate to checkout page
  };

  // Replace any direct access to cartItems.length with a safe check
  const isEmpty = !cartItems || cartItems.length === 0;

  return (
    <Box sx={{ backgroundColor: colorValues.bgDefault, color: colorValues.textPrimary, py: 4, minHeight: '80vh' }}>
      <Container>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Shopping Cart
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading cart...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 3 }}>
            Error loading cart: {error}
          </Alert>
        )}

        {!loading && !error && isEmpty && (
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: colorValues.bgPaper }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Your cart is empty.</Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/"
              sx={{ backgroundColor: colorValues.primary, '&:hover': { backgroundColor: colorValues.primaryDark } }}
            >
              Continue Shopping
            </Button>
          </Paper>
        )}

        {!loading && !error && !isEmpty && (
          <Grid container spacing={4}>
            {/* Cart Items List */}
            <Grid item xs={12} md={8}>
              {cartItems.map((item) => (
                <Paper key={`${item.id}-${item.selectedShade?.name || 'nosha'}`} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, backgroundColor: colorValues.bgPaper }}>
                  <Box
                    component="img"
                    // Access image directly from item
                    src={item.image || defaultProductImage}
                    // Access name directly from item
                    alt={item.name || 'Product Image'}
                    sx={{ width: 80, height: 80, objectFit: 'contain', mr: 2, borderRadius: 1 }}
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultProductImage; }} // Use correct fallback
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    {/* Access name directly from item */}
                    <Typography variant="h6" component="div">{item.name || 'Product Name Unavailable'}</Typography>
                    <Typography variant="body2" color={colorValues.textSecondary}>
                      {/* Access price directly from item */}
                      Price: ${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
                    </Typography>
                    {/* Display selected shade if available */}
                    {item.selectedShade && (
                      <Typography variant="body2" color={colorValues.textSecondary}>
                        Shade: {item.selectedShade.name}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, justifyContent: 'space-between' }}>
                    {/* Quantity Controls */}
                    <IconButton 
                      onClick={() => handleDecrement(item)} 
                      size="small" 
                      aria-label="Decrease quantity" 
                      disabled={loading || item.isUpdating} // Use item-specific loading flag
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, e.target.value)}
                      type="number"
                      size="small"
                      // Access name directly from item
                      aria-label={`Quantity for ${item.name}`}
                      disabled={loading || item.isUpdating} // Use item-specific loading flag
                      inputProps={{
                        min: 1,
                        // Access stock directly from item
                        max: item.stock,
                        style: { textAlign: 'center', width: '40px', MozAppearance: 'textfield' },
                      }}
                      sx={{ mx: 0.5, '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 } }}
                    />
                    <IconButton
                      onClick={() => handleIncrement(item)}
                      size="small"
                      aria-label="Increase quantity"
                      // Access stock directly from item
                      disabled={loading || item.isUpdating || (item.stock !== undefined && item.quantity >= item.stock)} // Use item-specific loading flag
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    {/* Show a small indicator for the specific item being updated */}
                    {item.isUpdating && (
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: colorValues.primary,
                          animation: 'pulse 1.5s infinite',
                          ml: 0.5
                        }}
                      />
                    )}
                    {/* Remove Button */}
                    {/* Use context function */}
                    <IconButton 
                      onClick={() => removeFromCart(item.id)} 
                      color="error" 
                      aria-label={`Remove ${item.name} from cart`} 
                      sx={{ ml: 1 }} 
                      disabled={loading || item.isUpdating} // Use item-specific loading flag
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Grid>

            {/* Cart Summary */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, backgroundColor: colorValues.bgPaper }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Order Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  {/* Use itemCount from context */}
                  <Typography>Subtotal ({itemCount} items)</Typography>
                  {/* Use cartTotal from context */}
                  <Typography sx={{ fontWeight: 500 }}>${cartTotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Shipping</Typography>
                  <Typography sx={{ fontWeight: 500, color: colorValues.success }}>FREE</Typography> {/* Or calculate shipping */}
                </Box>
                <hr />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                  {/* Use cartTotal from context */}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>${cartTotal.toFixed(2)}</Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout} // Use handler to navigate
                  sx={{
                      backgroundColor: colorValues.primary,
                      '&:hover': { backgroundColor: colorValues.primaryDark },
                      color: 'white',
                      py: 1.5,
                      borderRadius: '50px'
                  }}
                  disabled={loading || cartItems.length === 0} // Disable button during cart operations or if empty
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

export default Cart;