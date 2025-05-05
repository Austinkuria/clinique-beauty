import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { initiateSTKPush, querySTKStatus, formatPhoneNumber } from '../../api/mpesaService';

const MpesaPaymentTester = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  
  const handleTestPayment = async () => {
    if (!phoneNumber || !amount) {
      setStatus({ type: 'error', message: 'Please enter both phone number and amount' });
      return;
    }
    
    setLoading(true);
    setStatus({ type: 'info', message: 'Initiating STK push...' });
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await initiateSTKPush({
        phoneNumber: formattedPhone,
        amount: parseFloat(amount),
        orderId: 'TEST-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        description: 'Test payment'
      });
      
      if (response.success) {
        setCheckoutRequestId(response.checkoutRequestId);
        setStatus({ 
          type: 'success', 
          message: 'STK push initiated successfully! Check your phone for the M-Pesa prompt.' 
        });
      } else {
        setStatus({ type: 'error', message: response.message || 'Failed to initiate payment' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Error initiating payment' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckStatus = async () => {
    if (!checkoutRequestId) {
      setStatus({ type: 'error', message: 'No transaction to check' });
      return;
    }
    
    setLoading(true);
    setStatus({ type: 'info', message: 'Checking payment status...' });
    
    try {
      const statusResponse = await querySTKStatus(checkoutRequestId);
      
      if (statusResponse.success) {
        if (statusResponse.ResultCode === 0) {
          setStatus({ type: 'success', message: 'Payment completed successfully!' });
        } else {
          setStatus({ 
            type: 'warning', 
            message: `Payment not completed. Status: ${statusResponse.ResultDesc || 'Unknown status'}` 
          });
        }
      } else {
        setStatus({ type: 'error', message: statusResponse.message || 'Failed to check status' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Error checking payment status' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>M-Pesa Payment Tester</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Use this tool to test M-Pesa STK Push integration without going through the checkout flow.
      </Typography>
      
      {status && (
        <Alert severity={status.type} sx={{ mb: 3 }}>
          {status.message}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Phone Number"
          variant="outlined"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g., 254708374149"
          helperText="For testing, use numbers like 254708374149"
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Amount (Ksh)"
          variant="outlined"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputProps={{ min: 1 }}
          helperText="Minimum amount is Ksh 1"
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleTestPayment}
          disabled={loading || !phoneNumber || !amount}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Initiate Payment'}
        </Button>
        
        {checkoutRequestId && (
          <Button 
            variant="outlined"
            onClick={handleCheckStatus}
            disabled={loading || !checkoutRequestId}
            fullWidth
          >
            Check Status
          </Button>
        )}
      </Box>
      
      {checkoutRequestId && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" display="block">
            Request ID: {checkoutRequestId}
          </Typography>
          <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
            Note: For sandbox testing, use PIN: 12345678
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default MpesaPaymentTester;
