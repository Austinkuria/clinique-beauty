import axios from 'axios';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // Check if we're in production (Vercel)
  if (import.meta.env.PROD) {
    console.log('Using production API URL for M-Pesa');
    // Use the Vercel server URL for production
    return 'https://clinique-beauty.vercel.app/api';
  } else {
    console.log('Using development API URL for M-Pesa');
    // Use localhost for development
    return 'http://localhost:5000/api';
  }
};

// Base URLs - Use conditional URL based on environment
const BASE_URL = getBaseUrl();

// M-Pesa Endpoints
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
    console.log(`Sending payment request to: ${BASE_URL}${ENDPOINTS.STK_PUSH}`);
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
    
    const response = await axios.post(`${BASE_URL}${ENDPOINTS.STK_PUSH}`, enhancedPaymentData);
    
    console.log('STK push response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error initiating STK push:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw new Error(error.response?.data?.message || 'Failed to initiate M-Pesa payment');
  }
};

/**
 * Checks the status of an STK push request
 * @param {string} checkoutRequestId - The checkout request ID from the STK push response
 * @returns {Promise<Object>} - Status response
 */
export const querySTKStatus = async (checkoutRequestId) => {
  try {
    console.log(`Checking payment status at: ${BASE_URL}${ENDPOINTS.QUERY_STATUS}`);
    console.log('Checkout request ID:', checkoutRequestId);
    
    const response = await axios.post(`${BASE_URL}${ENDPOINTS.QUERY_STATUS}`, {
      checkoutRequestId,
      environment: import.meta.env.PROD ? 'production' : 'development',
      timestamp: new Date().toISOString()
    });
    
    console.log('Status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error querying STK status:', error);
    throw new Error(error.response?.data?.message || 'Failed to check payment status');
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
