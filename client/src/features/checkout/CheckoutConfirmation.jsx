import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ThemeContext } from '../../context/ThemeContext';
import { useContext } from 'react';

const CheckoutConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, colorValues } = useContext(ThemeContext);
  
  // Get order details from navigation state
  const { orderId, orderDetails } = location.state || {};
  
  // Format currency helper
  const formatCurrency = (amount) => {
    return `Ksh${Number(amount).toFixed(2)}`;
  };
  
  // Handle case where page is loaded directly without going through checkout
  if (!orderId || !orderDetails) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Order Information Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          We couldn't find information about your order. This might happen if you accessed this page directly.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/products')}
          sx={{ 
            backgroundColor: colorValues.primary, 
            '&:hover': { backgroundColor: colorValues.primaryDark } 
          }}
        >
          Browse Products
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon 
          sx={{ 
            fontSize: 64, 
            color: colorValues.success,
            mb: 2
          }} 
        />
        <Typography variant="h4" gutterBottom>
          Thank You for Your Order!
        </Typography>
        <Typography variant="body1">
          Your order has been placed successfully. We've sent a confirmation email to {orderDetails.customer.email}.
        </Typography>
      </Box>
      
      <Paper 
        elevation={theme === 'dark' ? 3 : 1} 
        sx={{ 
          p: 4, 
          backgroundColor: colorValues.bgPaper,
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Order #{orderId?.substring(0, 8) || 'UNKNOWN'}
          </Typography>
          <Typography variant="h6">
            {new Date().toLocaleDateString()}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Shipping Information
            </Typography>
            <Typography variant="body2">
              {orderDetails.customer.firstName} {orderDetails.customer.lastName}
            </Typography>
            <Typography variant="body2">
              {orderDetails.shipping.address}
              {orderDetails.shipping.apartment && `, ${orderDetails.shipping.apartment}`}
            </Typography>
            <Typography variant="body2">
              {orderDetails.shipping.city}, {orderDetails.shipping.county} {orderDetails.shipping.postalCode}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Phone: {orderDetails.customer.phone}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Payment Information
            </Typography>
            <Typography variant="body2">
              Payment Method: {orderDetails.payment.method.toUpperCase()}
            </Typography>
            {orderDetails.payment.method === 'mpesa' && orderDetails.payment.mpesaNumber && (
              <>
                <Typography variant="body2">
                  M-Pesa Number: {orderDetails.payment.mpesaNumber}
                </Typography>
                {orderDetails.payment.mpesaReceiptNumber && (
                  <Typography variant="body2">
                    M-Pesa Receipt: {orderDetails.payment.mpesaReceiptNumber}
                  </Typography>
                )}
              </>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Subtotal: {formatCurrency(orderDetails.totals.subtotal)}
            </Typography>
            <Typography variant="body2">
              Shipping: {orderDetails.totals.shipping === 0 ? 'FREE' : formatCurrency(orderDetails.totals.shipping)}
            </Typography>
            <Typography variant="body2">
              Tax: {formatCurrency(orderDetails.totals.tax)}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>
              Total: {formatCurrency(orderDetails.totals.total)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Card sx={{ backgroundColor: colorValues.bgPaper, mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            What's Next?
          </Typography>
          <Typography variant="body2" paragraph>
            Your order is being processed. We'll send you a notification when your items are ready for shipping.
          </Typography>
          <Typography variant="body2">
            For any questions about your order, please contact our customer service at support@cliniquebeauty.com or call us at (254) 700-123-456.
          </Typography>
        </CardContent>
      </Card>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/products')}
        >
          Continue Shopping
        </Button>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ 
            backgroundColor: colorValues.primary, 
            '&:hover': { backgroundColor: colorValues.primaryDark } 
          }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default CheckoutConfirmation;
