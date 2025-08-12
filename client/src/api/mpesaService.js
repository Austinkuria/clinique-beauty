import axios from 'axios';
import { mpesaConfig } from '../config/env.js';

// Use the centralized configuration for M-Pesa API URL
const BASE_URL = mpesaConfig.getApiUrl();
console.log('M-Pesa Service initialized with BASE_URL:', BASE_URL);
console.log('M-Pesa environment:', mpesaConfig.environment);

// M-Pesa Endpoints (relative to BASE_URL which already includes /api)
const ENDPOINTS = {
  GENERATE_TOKEN: '/mpesa/token',
  STK_PUSH: '/mpesa/stkpush',
  QUERY_STATUS: '/mpesa/query',
  CALLBACK: '/mpesa/callback'
};

/**
 * Initiates an STK push request to the customer's phone
 * @param {Object} paymentData - Payment information
 * @param {string} paymentData.phoneNumber - Customer's phone number (format: 254XXXXXXXXX)
 * @param {number} paymentData.amount - Amount to be paid
 * @param {string} paymentData.orderId - Order reference
 * @param {string} paymentData.description - Payment description
 * @returns {Promise<Object>} - Response from the STK push request
 */
export const initiateSTKPush = async (paymentData) => {
  try {
    const fullUrl = `${BASE_URL}${ENDPOINTS.STK_PUSH}`;
    console.log(`Sending M-Pesa STK push request to: ${fullUrl}`);
    console.log('M-Pesa API base URL:', BASE_URL);
    console.log('Payment data:', paymentData);
    
    // Format the phone number if needed
    const formattedPhone = formatPhoneNumber(paymentData.phoneNumber);
    
    // Add environment info to help with debugging
    const enhancedPaymentData = {
      ...paymentData,
      phoneNumber: formattedPhone,
      environment: import.meta.env.PROD ? 'production' : 'development',
      timestamp: new Date().toISOString()
    };
    
    const response = await axios.post(fullUrl, enhancedPaymentData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('STK push response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error initiating STK push:', error);
    
    // Enhanced error handling
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      // If we get a 405 Method Not Allowed or 404 Not Found, it means M-Pesa endpoints aren't available
      if (error.response.status === 405 || error.response.status === 404) {
        console.warn('M-Pesa endpoints not available. Providing fallback response.');
        
        // In development, provide a mock success response for testing
        if (import.meta.env.DEV) {
          return {
            success: true,
            message: 'DEV MODE: M-Pesa STK Push simulated',
            checkoutRequestId: `mock_${Date.now()}`,
            merchantRequestId: `mock_merchant_${Date.now()}`,
            responseDescription: 'Mock STK push initiated successfully',
            responseCode: '0'
          };
        }
        
        // In production, return a helpful error
        throw new Error('M-Pesa payment service is currently unavailable. Please try another payment method or contact support.');
      }
      
      // For other errors, throw with the response message
      throw new Error(error.response?.data?.message || `M-Pesa service error: ${error.response.status}`);
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      throw new Error('Unable to connect to M-Pesa service. Please check your internet connection and try again.');
    } else {
      // Other error
      console.error('Error setting up request:', error.message);
      throw new Error(error.message || 'Failed to initiate M-Pesa payment');
    }
  }
};

/**
 * Checks the status of an STK push request
 * @param {string} checkoutRequestId - The checkout request ID from the STK push response
 * @returns {Promise<Object>} - Status response
 */
export const querySTKStatus = async (checkoutRequestId) => {
  try {
    const fullUrl = `${BASE_URL}${ENDPOINTS.QUERY_STATUS}`;
    console.log(`Checking M-Pesa payment status at: ${fullUrl}`);
    console.log('M-Pesa API base URL:', BASE_URL);
    console.log('Checkout request ID:', checkoutRequestId);
    
    // If this is a mock checkout request ID from development, return mock success
    if (checkoutRequestId.startsWith('mock_')) {
      console.log('Mock checkout request detected, returning simulated success');
      return {
        success: true,
        ResultCode: 0,
        ResultDesc: 'Mock payment completed successfully',
        checkoutRequestId: checkoutRequestId,
        responseCode: '0'
      };
    }
    
    const response = await axios.post(fullUrl, {
      checkoutRequestId,
      environment: import.meta.env.PROD ? 'production' : 'development',
      timestamp: new Date().toISOString()
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error querying STK status:', error);
    
    // Enhanced error handling
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      // If endpoints aren't available
      if (error.response.status === 405 || error.response.status === 404) {
        console.warn('M-Pesa status endpoint not available.');
        
        // If it's a mock request, return success
        if (checkoutRequestId.startsWith('mock_')) {
          return {
            success: true,
            ResultCode: 0,
            ResultDesc: 'Mock payment completed successfully',
            checkoutRequestId: checkoutRequestId,
            responseCode: '0'
          };
        }
        
        // For real requests in production, return error
        throw new Error('M-Pesa status service is currently unavailable.');
      }
      
      throw new Error(error.response?.data?.message || `M-Pesa status check failed: ${error.response.status}`);
    } else if (error.request) {
      // Network error
      throw new Error('Unable to connect to M-Pesa status service. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'Failed to check payment status');
    }
  }
};

/**
 * Helper function to format phone numbers for M-Pesa
 * Ensures the number is in the format 254XXXXXXXXX
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If it starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  // If it doesn't start with 254, add it
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
};

export default {
  initiateSTKPush,
  querySTKStatus,
  formatPhoneNumber
};
