import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { processMpesaPayment, setupStatusPolling } from './mpesaHelper';

/**
 * Custom hook to handle checkout logic
 */
export const useCheckout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  
  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Payment state
  const [selectedPayment, setSelectedPayment] = useState('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [paymentPollingInterval, setPaymentPollingInterval] = useState(null);
  
  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (paymentPollingInterval) {
        paymentPollingInterval.clear();
      }
    };
  }, [paymentPollingInterval]);
  
  // Handle M-Pesa payment
  const handleMpesaPayment = useCallback(async (orderData) => {
    setPaymentProcessing(true);
    setPaymentStatus({ status: 'processing', message: 'Initiating M-Pesa payment...' });
    setPaymentDialogOpen(true);
    
    try {
      // Process payment
      const result = await processMpesaPayment({
        phoneNumber: mpesaNumber,
        amount: orderData.totals.total,
        orderId: orderData.orderId,
        description: `Payment for order at Clinique Beauty`,
        onStatusChange: setPaymentStatus
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to initiate payment');
      }
      
      // Set checkout request ID for status checking
      setCheckoutRequestId(result.checkoutRequestId);
      
      // Setup polling for payment status
      const polling = setupStatusPolling({
        checkoutRequestId: result.checkoutRequestId,
        onStatusChange: setPaymentStatus,
        onSuccess: (statusResponse) => {
          // Clear cart and redirect after 2 seconds
          setTimeout(() => {
            setPaymentDialogOpen(false);
            setPaymentProcessing(false);
            clearCart();
            navigate('/checkout/confirmation', {
              state: {
                orderId: orderData.orderId,
                orderDetails: orderData
              }
            });
          }, 2000);
        },
        onError: (errorInfo) => {
          setPaymentProcessing(false);
        },
        onCancel: () => {
          setPaymentProcessing(false);
        }
      });
      
      // Store polling interval for cleanup
      setPaymentPollingInterval(polling);
      
    } catch (error) {
      console.error('Error processing M-Pesa payment:', error);
      setPaymentStatus({
        status: 'error',
        message: error.message || 'Failed to process payment. Please try again.'
      });
      setPaymentProcessing(false);
    }
  }, [mpesaNumber, navigate, clearCart]);
  
  // Handle payment dialog close
  const handlePaymentDialogClose = useCallback(() => {
    if (!paymentProcessing) {
      setPaymentDialogOpen(false);
      
      // Clean up interval
      if (paymentPollingInterval) {
        paymentPollingInterval.clear();
        setPaymentPollingInterval(null);
      }
    }
  }, [paymentProcessing, paymentPollingInterval]);
  
  return {
    // State
    activeStep,
    loading,
    error,
    selectedPayment,
    mpesaNumber,
    paymentDialogOpen,
    paymentProcessing,
    paymentStatus,
    
    // Actions
    setActiveStep,
    setLoading,
    setError,
    setSelectedPayment,
    setMpesaNumber,
    handleMpesaPayment,
    handlePaymentDialogClose
  };
};

export default useCheckout;
