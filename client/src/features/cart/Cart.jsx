import React, { useContext } from 'react';
import { Container, Typography, Box, Grid, Paper, Button, IconButton, TextField, CircularProgress, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../../context/CartContext'; // Import useCart hook
import { ThemeContext } from '../../context/ThemeContext';

function Cart() {
  // Use the cart context
  const { cartItems, total, loading, error, updateCartItem, removeFromCart, itemCount } = useCart();
  const { colorValues } = useContext(ThemeContext);

  const handleQuantityChange = (item, newQuantity) => {
    const quantityNum = parseInt(newQuantity, 10);
    if (!isNaN(quantityNum) && quantityNum >= 1) {
      // Check against stock if available on the item.product object
      const maxQuantity = item.product?.stock ?? Infinity;
      if (quantityNum <= maxQuantity) {
        updateCartItem(item.id, quantityNum);
      } else {
        // Optionally show a toast message about stock limit
        console.warn(`Quantity limited to ${maxQuantity} due to stock.`);
        updateCartItem(item.id, maxQuantity); // Update to max stock
      }
    } else if (!isNaN(quantityNum) && quantityNum < 1) {
      // If user tries to set quantity below 1, treat as removal or set to 1
      // Option 1: Remove item
      removeFromCart(item.id);
      // Option 2: Set to 1 (current updateCartItem might handle this if API enforces >= 1)
      // updateCartItem(item.id, 1);
    }
  };

  const handleIncrement = (item) => {
    const maxQuantity = item.product?.stock ?? Infinity;
    if (item.quantity < maxQuantity) {
      updateCartItem(item.id, item.quantity + 1);
    }
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      updateCartItem(item.id, item.quantity - 1);
    } else {
      // Optionally confirm removal or just remove
      removeFromCart(item.id);
    }
  };


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

        {!loading && !error && cartItems.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: colorValues.bgPaper }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Your cart is empty.</Typography>
            <Button variant="contained" component={RouterLink} to="/" sx={{ backgroundColor: colorValues.primary, '&:hover': { backgroundColor: colorValues.primaryDark } }}>
              Continue Shopping
            </Button>
          </Paper>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <Grid container spacing={4}>
            {/* Cart Items List */}
            <Grid item xs={12} md={8}>
              {cartItems.map((item) => (
                <Paper key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, backgroundColor: colorValues.bgPaper }}>
                  <Box
                    component="img"
                    src={item.product?.image}
                    alt={item.product?.name}
                    sx={{ width: 80, height: 80, objectFit: 'contain', mr: 2, borderRadius: 1 }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "/src/assets/images/products/cleanser.webp"; }} // Fallback image
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">{item.product?.name || 'Product Name Unavailable'}</Typography>
                    <Typography variant="body2" color={colorValues.textSecondary}>
                      Price: ${item.product?.price?.toFixed(2) || 'N/A'}
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
                    <IconButton onClick={() => handleDecrement(item)} size="small" aria-label="Decrease quantity">
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, e.target.value)}
                      type="number"
                      size="small"
                      aria-label={`Quantity for ${item.product?.name}`}
                      inputProps={{
                        min: 1,
                        max: item.product?.stock, // Use stock from product data
                        style: { textAlign: 'center', width: '40px', MozAppearance: 'textfield' },
                      }}
                      sx={{ mx: 0.5, '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 } }}
                    />
                    <IconButton
                      onClick={() => handleIncrement(item)}
                      size="small"
                      aria-label="Increase quantity"
                      disabled={item.product?.stock !== undefined && item.quantity >= item.product.stock} // Disable based on stock
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    {/* Remove Button */}
                    <IconButton onClick={() => removeFromCart(item.id)} color="error" aria-label={`Remove ${item.product?.name} from cart`} sx={{ ml: 1 }}>
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
                  <Typography>Subtotal ({itemCount} items)</Typography>
                  <Typography sx={{ fontWeight: 500 }}>${total.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Shipping</Typography>
                  <Typography sx={{ fontWeight: 500 }}>FREE</Typography> {/* Or calculate shipping */}
                </Box>
                <hr />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>${total.toFixed(2)}</Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  component={RouterLink}
                  to="/checkout" // Link to your checkout page
                  sx={{ backgroundColor: colorValues.primary, '&:hover': { backgroundColor: colorValues.primaryDark }, color: 'white' }}
                  disabled={loading} // Disable button during cart operations
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
