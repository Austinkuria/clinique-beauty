import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Paper, Divider, Button, 
  TextField, FormControlLabel, Checkbox, RadioGroup, Radio, 
  FormControl, FormLabel, CircularProgress, Alert, Stepper,
  Step, StepLabel, Card, CardContent, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../api/apiClient';
import { useUser } from '@clerk/clerk-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useContext } from 'react';
import { prepareCheckout, createCheckoutSession } from './checkoutApi';
import defaultProductImage from '../../assets/images/placeholder.webp';

// Define shipping method options with Ksh currency
const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Shipping', price: 0, estimatedDays: '5-7' },
  { id: 'express', name: 'Express Shipping', price: 1299, estimatedDays: '2-3' },
  { id: 'overnight', name: 'Overnight Shipping', price: 2499, estimatedDays: '1' }
];

// Payment methods available in Kenya
const PAYMENT_METHODS = [
  { id: 'mpesa', name: 'M-Pesa' },
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'bank', name: 'Bank Transfer' },
  { id: 'paypal', name: 'PayPal' }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, loadCart } = useCart();
  const { isSignedIn, user } = useUser();
  const { theme, colorValues } = useContext(ThemeContext);
  const api = useApi();
  
  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderIssues, setOrderIssues] = useState([]);
  
  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    county: '',
    postalCode: '',
    sameAsBilling: true,
    billingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      county: '',
      postalCode: '',
    },
    orderNotes: '',
    agreeToTerms: false
  });
  
  // Shipping and payment state
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  
  // Format currency helper
  const formatCurrency = (amount) => {
    return `Ksh${Number(amount).toFixed(2)}`;
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartTotal || 0;
    const shippingMethod = SHIPPING_METHODS.find(method => method.id === selectedShipping);
    const shippingCost = shippingMethod ? shippingMethod.price : 0;
    const tax = Math.round(subtotal * 0.16); // 16% VAT for Kenya
    const total = subtotal + shippingCost + tax;
    
    return {
      subtotal,
      shippingCost,
      tax,
      total
    };
  };
  
  const { subtotal, shippingCost, tax, total } = calculateTotals();
  
  // Load cart and checkout options
  useEffect(() => {
    const prepareCheckoutData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Make sure cart is loaded
        if (loadCart) {
          await loadCart();
        }
        
        // Validate cart and get shipping options
        const checkoutData = await prepareCheckout();
        
        if (!checkoutData.valid) {
          setOrderIssues(checkoutData.issues || []);
        }
        
        // Pre-fill user data if signed in
        if (isSignedIn && user) {
          setCustomerInfo(prev => ({
            ...prev,
            email: user.primaryEmailAddress?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phoneNumbers?.[0]?.phoneNumber || ''
          }));
        }
        
      } catch (err) {
        console.error('Error preparing checkout:', err);
        setError(err.message || 'Failed to prepare checkout');
      } finally {
        setLoading(false);
      }
    };
    
    prepareCheckoutData();
  }, [isSignedIn, loadCart, user]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name.startsWith('billing.')) {
      // Handle billing address fields
      const billingField = name.replace('billing.', '');
      setCustomerInfo({
        ...customerInfo,
        billingAddress: {
          ...customerInfo.billingAddress,
          [billingField]: value
        }
      });
    } else if (name === 'sameAsBilling') {
      // Handle same as billing checkbox
      setCustomerInfo({
        ...customerInfo,
        sameAsBilling: checked
      });
    } else if (name === 'agreeToTerms') {
      // Handle terms checkbox
      setCustomerInfo({
        ...customerInfo,
        agreeToTerms: checked
      });
    } else {
      // Handle regular fields
      setCustomerInfo({
        ...customerInfo,
        [name]: value
      });
    }
  };
  
  // Handle shipping method selection
  const handleShippingChange = (e) => {
    setSelectedShipping(e.target.value);
  };
  
  // Handle payment method selection
  const handlePaymentChange = (e) => {
    setSelectedPayment(e.target.value);
  };
  
  // Navigate through checkout steps
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmitOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate form data
      if (!customerInfo.email || !customerInfo.phone || !customerInfo.firstName || 
          !customerInfo.lastName || !customerInfo.address || !customerInfo.city ||
          !customerInfo.county || !customerInfo.postalCode || !customerInfo.agreeToTerms) {
        throw new Error('Please fill in all required fields');
      }
      
      if (selectedPayment === 'mpesa' && !mpesaNumber) {
        throw new Error('Please enter your M-Pesa number');
      }
      
      // Create checkout session
      const checkoutData = {
        customer: {
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          phone: customerInfo.phone
        },
        shipping: {
          address: customerInfo.address,
          apartment: customerInfo.apartment,
          city: customerInfo.city,
          county: customerInfo.county,
          postalCode: customerInfo.postalCode,
          method: selectedShipping
        },
        billing: customerInfo.sameAsBilling 
          ? { 
              ...customerInfo, 
              apartment: customerInfo.apartment 
            }
          : { 
              ...customerInfo.billingAddress 
            },
        payment: {
          method: selectedPayment,
          mpesaNumber: mpesaNumber
        },
        orderNotes: customerInfo.orderNotes,
        totals: {
          subtotal,
          shipping: shippingCost,
          tax,
          total
        }
      };
      
      const result = await createCheckoutSession(checkoutData);
      
      if (result.success) {
        // Clear the cart and navigate to confirmation
        await clearCart();
        navigate('/checkout/confirmation', { 
          state: { 
            orderId: result.sessionId,
            orderDetails: checkoutData
          } 
        });
      } else {
        throw new Error(result.message || 'Failed to create checkout session');
      }
      
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(err.message || 'Failed to submit order');
      window.scrollTo(0, 0); // Scroll to top to see error
    } finally {
      setLoading(false);
    }
  };
  
  // Get content for current step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="firstName"
                name="firstName"
                label="First Name"
                fullWidth
                variant="outlined"
                value={customerInfo.firstName}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="lastName"
                name="lastName"
                label="Last Name"
                fullWidth
                variant="outlined"
                value={customerInfo.lastName}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="email"
                name="email"
                label="Email Address"
                fullWidth
                variant="outlined"
                value={customerInfo.email}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="phone"
                name="phone"
                label="Phone Number"
                fullWidth
                variant="outlined"
                value={customerInfo.phone}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Shipping Address
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                id="address"
                name="address"
                label="Address Line 1"
                fullWidth
                variant="outlined"
                value={customerInfo.address}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                id="apartment"
                name="apartment"
                label="Apartment, suite, etc. (optional)"
                fullWidth
                variant="outlined"
                value={customerInfo.apartment}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="city"
                name="city"
                label="City"
                fullWidth
                variant="outlined"
                value={customerInfo.city}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="county"
                name="county"
                label="County"
                fullWidth
                variant="outlined"
                value={customerInfo.county}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="postalCode"
                name="postalCode"
                label="Postal Code"
                fullWidth
                variant="outlined"
                value={customerInfo.postalCode}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="sameAsBilling"
                    checked={customerInfo.sameAsBilling}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="Billing address same as shipping address"
              />
            </Grid>
            
            {!customerInfo.sameAsBilling && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Billing Address
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="billing.firstName"
                    name="billing.firstName"
                    label="First Name"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.firstName}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="billing.lastName"
                    name="billing.lastName"
                    label="Last Name"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.lastName}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    id="billing.address"
                    name="billing.address"
                    label="Address"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.address}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    id="billing.apartment"
                    name="billing.apartment"
                    label="Apartment, suite, etc. (optional)"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.apartment}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="billing.city"
                    name="billing.city"
                    label="City"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.city}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="billing.county"
                    name="billing.county"
                    label="County"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.county}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="billing.postalCode"
                    name="billing.postalCode"
                    label="Postal Code"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.postalCode}
                    onChange={handleInputChange}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                id="orderNotes"
                name="orderNotes"
                label="Order Notes (optional)"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={customerInfo.orderNotes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Shipping Method
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  name="shipping"
                  value={selectedShipping}
                  onChange={handleShippingChange}
                >
                  {SHIPPING_METHODS.map((method) => (
                    <Paper
                      key={method.id}
                      elevation={selectedShipping === method.id ? 3 : 1}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        border: selectedShipping === method.id ? `2px solid ${colorValues.primary}` : 'none',
                        backgroundColor: colorValues.bgPaper
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio color="primary" />}
                        label={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1">{method.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Estimated Delivery: {method.estimatedDays} {method.estimatedDays === '1' ? 'day' : 'days'}
                              </Typography>
                            </Box>
                            <Typography variant="subtitle1">
                              {method.price === 0 ? 'FREE' : formatCurrency(method.price)}
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%', margin: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Payment Method
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  name="payment"
                  value={selectedPayment}
                  onChange={handlePaymentChange}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <Paper
                      key={method.id}
                      elevation={selectedPayment === method.id ? 3 : 1}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        border: selectedPayment === method.id ? `2px solid ${colorValues.primary}` : 'none',
                        backgroundColor: colorValues.bgPaper
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio color="primary" />}
                        label={method.name}
                        sx={{ width: '100%', margin: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {selectedPayment === 'mpesa' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="mpesaNumber"
                  label="M-Pesa Number"
                  fullWidth
                  variant="outlined"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  placeholder="e.g., 254712345678"
                  helperText="Enter your M-Pesa registered phone number"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeToTerms"
                    checked={customerInfo.agreeToTerms}
                    onChange={handleInputChange}
                    color="primary"
                    required
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the Terms and Conditions and Privacy Policy
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Order Review
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Customer Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  {customerInfo.firstName} {customerInfo.lastName}
                </Typography>
                <Typography variant="body2">{customerInfo.email}</Typography>
                <Typography variant="body2">{customerInfo.phone}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Shipping Address
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">{customerInfo.address}</Typography>
                {customerInfo.apartment && (
                  <Typography variant="body2">{customerInfo.apartment}</Typography>
                )}
                <Typography variant="body2">
                  {customerInfo.city}, {customerInfo.county} {customerInfo.postalCode}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Billing Address
              </Typography>
              <Box sx={{ mb: 2 }}>
                {customerInfo.sameAsBilling ? (
                  <Typography variant="body2">Same as shipping address</Typography>
                ) : (
                  <>
                    <Typography variant="body2">
                      {customerInfo.billingAddress.firstName} {customerInfo.billingAddress.lastName}
                    </Typography>
                    <Typography variant="body2">{customerInfo.billingAddress.address}</Typography>
                    {customerInfo.billingAddress.apartment && (
                      <Typography variant="body2">{customerInfo.billingAddress.apartment}</Typography>
                    )}
                    <Typography variant="body2">
                      {customerInfo.billingAddress.city}, {customerInfo.billingAddress.county} {customerInfo.billingAddress.postalCode}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Shipping Method
              </Typography>
              <Box sx={{ mb: 2 }}>
                {SHIPPING_METHODS.find(method => method.id === selectedShipping)?.name || ''}
                {' - '}
                {selectedShipping === 'standard' ? 'FREE' : formatCurrency(
                  SHIPPING_METHODS.find(method => method.id === selectedShipping)?.price || 0
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Method
              </Typography>
              <Box sx={{ mb: 2 }}>
                {PAYMENT_METHODS.find(method => method.id === selectedPayment)?.name || ''}
                {selectedPayment === 'mpesa' && mpesaNumber && (
                  <Typography variant="body2">M-Pesa Number: {mpesaNumber}</Typography>
                )}
              </Box>
            </Grid>
            
            {customerInfo.orderNotes && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Order Notes
                </Typography>
                <Typography variant="body2">{customerInfo.orderNotes}</Typography>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              {cartItems.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={item.image || defaultProductImage}
                    alt={item.name}
                    sx={{ width: 60, height: 60, objectFit: 'contain', mr: 2, borderRadius: 1 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">{item.name}</Typography>
                    {item.selectedShade && (
                      <Typography variant="body2" color="text.secondary">
                        Shade: {item.selectedShade.name}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  // Render the page
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/cart')}
        sx={{ mb: 4 }}
      >
        Return to Cart
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Checkout
      </Typography>
      
      {/* Show errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Show cart issues */}
      {orderIssues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            We've found some issues with your order:
          </Typography>
          <ul>
            {orderIssues.map((issue, idx) => (
              <li key={idx}>{issue.message}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Empty cart warning */}
      {!loading && cartItems.length === 0 && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', backgroundColor: colorValues.bgPaper }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Your cart is empty.</Typography>
          <Button variant="contained" onClick={() => navigate('/products')} sx={{ backgroundColor: colorValues.primary, '&:hover': { backgroundColor: colorValues.primaryDark } }}>
            Continue Shopping
          </Button>
        </Paper>
      )}
      
      {/* Main checkout flow */}
      {!loading && cartItems.length > 0 && (
        <Grid container spacing={4}>
          {/* Left side: Checkout steps */}
          <Grid item xs={12} md={8}>
            <Paper elevation={theme === 'dark' ? 3 : 1} sx={{ p: 3, backgroundColor: colorValues.bgPaper }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                <Step>
                  <StepLabel>Customer Information</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Shipping & Payment</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Review Order</StepLabel>
                </Step>
              </Stepper>
              
              <Box sx={{ mt: 2 }}>
                {getStepContent(activeStep)}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                {activeStep !== 0 && (
                  <Button
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                )}
                
                <Box sx={{ flex: '1 1 auto' }} />
                
                {activeStep === 2 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmitOrder}
                    disabled={!customerInfo.agreeToTerms || loading}
                    sx={{ 
                      backgroundColor: colorValues.primary, 
                      '&:hover': { backgroundColor: colorValues.primaryDark },
                      px: 4
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Place Order'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ 
                      backgroundColor: colorValues.primary, 
                      '&:hover': { backgroundColor: colorValues.primaryDark } 
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Right side: Order summary */}
          <Grid item xs={12} md={4}>
            <Card elevation={theme === 'dark' ? 3 : 1} sx={{ backgroundColor: colorValues.bgPaper, position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {cartItems.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={item.image || defaultProductImage}
                        alt={item.name}
                        sx={{ width: 40, height: 40, objectFit: 'contain', mr: 2, borderRadius: 1 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                          {item.name} {item.quantity > 1 && `(${item.quantity})`}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">
                    {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">VAT (16%)</Typography>
                  <Typography variant="body2">{formatCurrency(tax)}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LockIcon fontSize="small" sx={{ mr: 1, color: colorValues.success }} />
                  <Typography variant="caption" color="text.secondary">
                    Secure checkout powered by trusted payment providers
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CheckoutPage;
