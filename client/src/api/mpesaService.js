import axios from 'axios';

// Base URLs
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    // Format the phone number if needed (remove leading 0, ensure 254 prefix)
    const formattedPhone = formatPhoneNumber(paymentData.phoneNumber);
    
    const response = await axios.post(`${BASE_URL}${ENDPOINTS.STK_PUSH}`, {
      ...paymentData,
      phoneNumber: formattedPhone
    });
    
    return response.data;
  } catch (error) {
    console.error('Error initiating STK push:', error);
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
    const response = await axios.post(`${BASE_URL}${ENDPOINTS.QUERY_STATUS}`, {
      checkoutRequestId
    });
    
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
