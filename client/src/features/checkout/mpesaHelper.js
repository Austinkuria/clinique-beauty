import { mpesaConfig } from '../../config/env';
import { initiateSTKPush, querySTKStatus, formatPhoneNumber } from '../../api/mpesaService';

/**
 * Enhanced M-Pesa payment handler that works in both local and production environments
 */
export const processMpesaPayment = async ({
  phoneNumber,
  amount,
  orderId,
  description = "Payment for Clinique Beauty order",
  onStatusChange,
  onSuccess,
  onError
}) => {
  try {
    // Validate inputs
    if (!phoneNumber) throw new Error('Phone number is required');
    if (!amount) throw new Error('Amount is required');
    if (!orderId) throw new Error('Order ID is required');
    
    // Initial status update
    onStatusChange?.({
      status: 'processing',
      message: 'Initiating M-Pesa payment...',
      timestamp: new Date().toISOString()
    });
    
    // Log payment attempt
    console.log('Processing M-Pesa payment:', {
      phoneNumber,
      amount,
      orderId,
      environment: mpesaConfig.environment
    });
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Attempt STK push
    const startTime = Date.now();
    const stkResponse = await initiateSTKPush({
      phoneNumber: formattedPhone,
      amount,
      orderId,
      description
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`STK push response received in ${responseTime}ms:`, stkResponse);
    
    // If STK push failed
    if (!stkResponse.success) {
      throw new Error(stkResponse.message || 'Failed to initiate payment');
    }
    
    // Extract checkout request ID
    const checkoutRequestId = stkResponse.checkoutRequestId;
    if (!checkoutRequestId) {
      throw new Error('Missing checkout request ID in response');
    }
    
    // Update status to waiting
    onStatusChange?.({
      status: 'waiting',
      message: 'Please check your phone and enter M-Pesa PIN to complete payment',
      timestamp: new Date().toISOString(),
      checkoutRequestId
    });
    
    // Return the checkoutRequestId for polling
    return {
      success: true,
      checkoutRequestId,
      response: stkResponse,
      pollStatus: async () => {
        try {
          const statusResponse = await querySTKStatus(checkoutRequestId);
          return statusResponse;
        } catch (error) {
          console.error('Error polling payment status:', error);
          return { success: false, error: error.message };
        }
      }
    };
    
  } catch (error) {
    console.error('Error processing M-Pesa payment:', error);
    
    // Call error callback
    onError?.({
      error: error.message || 'Failed to process payment',
      timestamp: new Date().toISOString()
    });
    
    // Return error information
    return {
      success: false,
      error: error.message || 'Failed to process payment'
    };
  }
};

/**
 * Helper function to handle polling for payment status
 */
export const setupStatusPolling = ({
  checkoutRequestId,
  intervalMs = 5000,
  maxAttempts = 12, // 1 minute max by default
  onStatusChange,
  onSuccess,
  onError,
  onCancel
}) => {
  let attempts = 0;
  
  // Return the interval ID for cleanup
  const intervalId = setInterval(async () => {
    attempts++;
    
    try {
      console.log(`Polling payment status (attempt ${attempts}/${maxAttempts}):`, checkoutRequestId);
      
      // Query payment status
      const statusResponse = await querySTKStatus(checkoutRequestId);
      console.log('Status response:', statusResponse);
      
      // Process the response
      if (statusResponse.success) {
        // Check ResultCode to determine payment status
        if (statusResponse.ResultCode === 0) {
          // Payment successful
          clearInterval(intervalId);
          
          onStatusChange?.({
            status: 'success',
            message: 'Payment processed successfully!',
            timestamp: new Date().toISOString(),
            details: statusResponse
          });
          
          onSuccess?.(statusResponse);
          
        } else if (statusResponse.ResultCode === 1032) {
          // Payment cancelled by user
          clearInterval(intervalId);
          
          onStatusChange?.({
            status: 'cancelled',
            message: 'Payment cancelled by user',
            timestamp: new Date().toISOString(),
            details: statusResponse
          });
          
          onCancel?.(statusResponse);
          
        } else if (statusResponse.ResultCode) {
          // Other error with ResultCode
          clearInterval(intervalId);
          
          onStatusChange?.({
            status: 'error',
            message: statusResponse.ResultDesc || 'Payment failed',
            timestamp: new Date().toISOString(),
            details: statusResponse
          });
          
          onError?.({
            error: statusResponse.ResultDesc || 'Payment failed',
            code: statusResponse.ResultCode,
            details: statusResponse
          });
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Don't stop polling on network errors, just continue
    }
    
    // Stop after max attempts
    if (attempts >= maxAttempts) {
      clearInterval(intervalId);
      
      onStatusChange?.({
        status: 'timeout',
        message: 'Payment status check timed out. The payment might still be processing.',
        timestamp: new Date().toISOString()
      });
      
      onError?.({
        error: 'Payment status check timed out',
        isTimeout: true
      });
    }
  }, intervalMs);
  
  // Return the interval ID and a function to clear it
  return {
    intervalId,
    clear: () => clearInterval(intervalId)
  };
};

export default {
  processMpesaPayment,
  setupStatusPolling
};
