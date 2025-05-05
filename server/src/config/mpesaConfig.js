/**
 * M-Pesa Daraja API configuration settings
 * This file handles different environment configurations (local vs Vercel)
 */

// Base URLs for Safaricom API
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

// Determine the correct callback URL based on environment
const getCallbackUrl = () => {
  // If MPESA_CALLBACK_URL is explicitly set, use it
  if (process.env.MPESA_CALLBACK_URL) {
    return process.env.MPESA_CALLBACK_URL;
  }
  
  // If running on Vercel, use the Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/mpesa/callback`;
  }
  
  // For local development without ngrok, use localhost (won't work for real callbacks)
  return 'http://localhost:5000/api/mpesa/callback';
};

// Fixed configuration values
const MPESA_CONFIG = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  PASSKEY: process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  SHORTCODE: process.env.MPESA_SHORTCODE || '174379',
  TRANSACTION_TYPE: 'CustomerPayBillOnline',
  CALLBACK_URL: getCallbackUrl(),
  BASE_URL: BASE_URL
};

// Log configuration (but hide secrets)
console.log('M-Pesa Configuration:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- Base URL:', MPESA_CONFIG.BASE_URL);
console.log('- Callback URL:', MPESA_CONFIG.CALLBACK_URL);
console.log('- Shortcode:', MPESA_CONFIG.SHORTCODE);
console.log('- Consumer Key configured:', !!MPESA_CONFIG.CONSUMER_KEY);
console.log('- Consumer Secret configured:', !!MPESA_CONFIG.CONSUMER_SECRET);

export default MPESA_CONFIG;
