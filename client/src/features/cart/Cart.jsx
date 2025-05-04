import React, { useContext, useState, useRef, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, Button, IconButton, TextField, CircularProgress, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../../context/CartContext'; // Import useCart hook
import { ThemeContext } from '../../context/ThemeContext';
import defaultProductImage from '../../assets/images/placeholder.webp'; // Fallback image
import toast from 'react-hot-toast'; // Add toast import

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

  // Add state to track local quantity input values
  const [localQuantities, setLocalQuantities] = useState({});
  // Add state to track which items are being edited
  const [editingItems, setEditingItems] = useState({});
  // Add ref for debounce timers
  const timerRefs = useRef({});
  
  // Initialize local quantities from cart items
  useEffect(() => {
    const quantities = {};
    cartItems.forEach(item => {
      quantities[item.id] = item.quantity;
    });
    setLocalQuantities(quantities);
  }, [cartItems]);

  const handleQuantityInputChange = (item, value) => {
    // Update local quantity state immediately without validation
    setLocalQuantities(prev => ({
      ...prev,
      [item.id]: value
    }));
    
    // Mark this item as being edited
    setEditingItems(prev => ({
      ...prev,
      [item.id]: true
    }));
    
    // Clear any existing timer for this item
    if (timerRefs.current[item.id]) {
      clearTimeout(timerRefs.current[item.id]);
    }
    
    // Set a new timer to update the cart after user stops typing
    timerRefs.current[item.id] = setTimeout(() => {
      validateAndUpdateQuantity(item, value);
    }, 800); // 800ms delay to wait for user to finish typing
  };

  const validateAndUpdateQuantity = (item, inputValue) => {
    // Parse the input value
    const quantityNum = parseInt(inputValue, 10);
    
    // Handle invalid input
    if (isNaN(quantityNum) || quantityNum < 1) {
      // Reset to current quantity
      setLocalQuantities(prev => ({
        ...prev,
        [item.id]: item.quantity
      }));
      setEditingItems(prev => ({
        ...prev,
        [item.id]: false
      }));
      return;
    }
    
    // Check against stock limits
    const maxStock = item.stock !== undefined ? item.stock : Infinity;
    
    if (quantityNum > maxStock) {
      // Cap at max stock and show toast
      console.log(`[Cart] Limiting quantity to max stock: ${maxStock} for item ${item.id}`);
      setLocalQuantities(prev => ({
        ...prev,
        [item.id]: maxStock
      }));
      
      // Show toast message
      toast.error(`Limited to ${maxStock} units (maximum available stock).`);
      
      // Update cart with max stock
      updateCartItem(item.id, maxStock);
    } else if (quantityNum !== item.quantity) {
      // Valid quantity that's different from current, update cart
      updateCartItem(item.id, quantityNum);
    }
    
    // Mark as no longer editing
    setEditingItems(prev => ({
      ...prev,
      [item.id]: false
    }));
  };

  const handleQuantityBlur = (item) => {
    // Validate and update immediately on blur
    const value = localQuantities[item.id];
    const quantityNum = parseInt(value, 10);
    
    if (!isNaN(quantityNum) && quantityNum >= 1) {
      const maxQuantity = item.stock ?? Infinity;
      const finalQuantity = Math.min(quantityNum, maxQuantity);
      
      // Update local state
      setLocalQuantities(prev => ({
        ...prev,
        [item.id]: finalQuantity
      }));
      
      // Update cart if different
      if (finalQuantity !== item.quantity) {
        updateCartItem(item.id, finalQuantity);
      }
    } else {
      // Invalid input, reset to current quantity
      setLocalQuantities(prev => ({
        ...prev,
        [item.id]: item.quantity
      }));
    }
    
    // Mark this item as no longer being edited
    setEditingItems(prev => ({
      ...prev,
      [item.id]: false
    }));
  };

  const handleQuantityChange = (item, newQuantity) => {
    // Use our new input handler
    handleQuantityInputChange(item, newQuantity);
  };

  const handleIncrement = (item) => {
    const maxQuantity = item.stock ?? Infinity;
    const newQuantity = item.quantity + 1;
    
    if (newQuantity <= maxQuantity) {
      // Update both local state for immediate feedback
      setLocalQuantities(prev => ({
        ...prev,
        [item.id]: newQuantity
      }));
      
      // And call the API
      updateCartItem(item.id, newQuantity);
    } else {
      // Show toast when trying to exceed max stock
      toast.error(`Cannot add more. Maximum stock (${maxQuantity}) reached.`);
    }
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      
      // Update local state for immediate feedback
      setLocalQuantities(prev => ({
        ...prev,
        [item.id]: newQuantity
      }));
      
      // And call the API
      updateCartItem(item.id, newQuantity);
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
                      Price: Ksh{typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
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
                      value={localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity}
                      onChange={(e) => handleQuantityInputChange(item, e.target.value)}
                      onBlur={() => handleQuantityBlur(item)}
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
                    {editingItems[item.id] && (
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: 'orange',
                          animation: 'pulse 1.5s infinite',
                          ml: 0.5
                        }}
                      />
                    )}
                    {item.isUpdating && !editingItems[item.id] && (
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Ksh{cartTotal.toFixed(2)}</Typography>
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