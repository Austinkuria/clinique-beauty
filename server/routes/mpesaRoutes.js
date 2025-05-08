import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const DEBUG = process.env.MPESA_DEBUG === 'true';

// Utility function for logging when debug is enabled
const debugLog = (...args) => {
    if (DEBUG) {
        console.log('[M-Pesa Debug]', ...args);
    }
};

// Get M-Pesa OAuth token
router.get('/token', async (req, res) => {
    try {
        debugLog('Getting M-Pesa token...');
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        
        debugLog('Credentials check:', {
            keyExists: !!consumerKey,
            secretExists: !!consumerSecret,
            keyLength: consumerKey?.length,
            secretLength: consumerSecret?.length
        });
        
        if (!consumerKey || !consumerSecret) {
            return res.status(500).json({ 
                error: true, 
                message: 'M-Pesa credentials not configured'
            });
        }
        
        // Create auth string and encode to base64
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        
        // Determine the API URL based on environment
        const apiUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';
        const tokenUrl = `${apiUrl}/oauth/v1/generate?grant_type=client_credentials`;
        
        debugLog('Requesting token from:', tokenUrl);
        debugLog('Using auth:', `Basic ${auth.substring(0, 10)}...`);
        
        // Send request to get the token with timeout and retries
        try {
            const response = await axios.get(tokenUrl, {
                headers: {
                    Authorization: `Basic ${auth}`
                },
                timeout: 10000 // 10 second timeout
            });
            
            if (!response.data || !response.data.access_token) {
                throw new Error('Invalid token response structure');
            }
            
            debugLog('Token response:', response.data);
            return res.json({ token: response.data.access_token });
        } catch (apiError) {
            debugLog('API error:', apiError);
            
            // Try an alternative approach with different headers
            try {
                debugLog('Trying alternative approach...');
                const altResponse = await axios({
                    method: 'get',
                    url: tokenUrl,
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });
                
                if (altResponse.data && altResponse.data.access_token) {
                    debugLog('Alternative approach succeeded:', altResponse.data);
                    return res.json({ token: altResponse.data.access_token });
                }
                
                throw new Error('Alternative approach failed');
            } catch (altError) {
                debugLog('Alternative approach error:', altError);
                throw apiError; // Throw the original error
            }
        }
    } catch (error) {
        console.error('M-Pesa token error:', error);
        
        // Add detailed error logging
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        }
        
        return res.status(500).json({ 
            error: true, 
            message: 'Failed to get M-Pesa token',
            details: error.response?.data || error.message,
            code: error.code,
            cause: error.cause
        });
    }
});

// Initiate STK Push
router.post('/stkpush', async (req, res) => {
    try {
        const { phoneNumber, amount, orderId, description } = req.body;
        
        debugLog('Received STK push request:', { phoneNumber, amount, orderId, description });
        
        if (!phoneNumber || !amount) {
            return res.status(400).json({
                error: true,
                message: 'Phone number and amount are required'
            });
        }
        
        debugLog(`Processing M-Pesa STK push for ${orderId || 'N/A'}`);
        
        // Get the M-Pesa token
        debugLog('Requesting token...');
        const tokenUrl = `${req.protocol}://${req.get('host')}/api/mpesa/token`;
        debugLog('Token URL:', tokenUrl);
        
        const tokenResponse = await axios.get(tokenUrl);
        const token = tokenResponse.data.token;
        
        debugLog('Received token:', token.substring(0, 10) + '...');
        
        // Prepare STK Push parameters
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const shortCode = process.env.MPESA_SHORTCODE || '174379'; // Default to sandbox shortcode
        const passkey = process.env.MPESA_PASSKEY;
        
        // Generate password (base64 of shortcode + passkey + timestamp)
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
        
        // Configure callback URL
        const callbackUrl = process.env.MPESA_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/mpesa/callback`;
        debugLog(`Using callback URL: ${callbackUrl}`);
        
        // Format phone number if needed (ensure it starts with 254)
        let formattedPhone = phoneNumber;
        if (phoneNumber.startsWith('0')) {
            formattedPhone = `254${phoneNumber.substring(1)}`;
        } else if (!phoneNumber.startsWith('254')) {
            formattedPhone = `254${phoneNumber}`;
        }
        
        debugLog('Formatted phone number:', formattedPhone);
        
        // Ensure amount is a whole number
        const formattedAmount = Math.round(Number(amount));
        debugLog('Formatted amount:', formattedAmount);
        
        // Prepare request data
        const data = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: formattedAmount,
            PartyA: formattedPhone,
            PartyB: shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: orderId || `ORDER-${Date.now()}`,
            TransactionDesc: description || 'Clinique Beauty Purchase'
        };
        
        debugLog('Sending M-Pesa request with data:', JSON.stringify(data, null, 2));
        
        // Determine the API URL based on environment
        const apiUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';
        const stkUrl = `${apiUrl}/mpesa/stkpush/v1/processrequest`;
        
        debugLog('STK push URL:', stkUrl);
        
        // Send STK Push request
        const response = await axios.post(
            stkUrl,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        debugLog('M-Pesa response:', JSON.stringify(response.data, null, 2));
        
        // Return the response with additional information
        res.json({
            success: true,
            message: 'STK push initiated successfully',
            checkoutRequestId: response.data.CheckoutRequestID,
            merchantRequestId: response.data.MerchantRequestID,
            responseCode: response.data.ResponseCode,
            responseDescription: response.data.ResponseDescription,
            customerMessage: response.data.CustomerMessage
        });
    } catch (error) {
        console.error('STK Push error:', error);
        
        // Add detailed error logging
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        }
        
        res.status(500).json({
            error: true,
            message: error.response?.data?.errorMessage || error.message || 'Failed to initiate payment',
            details: error.response?.data || {},
            code: error.code || 'UNKNOWN_ERROR'
        });
    }
});

// Add additional payment route with better error handling
router.post('/payment', async (req, res) => {
    try {
        const { phoneNumber, amount, orderId, description } = req.body;
        
        if (!phoneNumber || !amount) {
            return res.status(400).json({
                error: true,
                message: 'Phone number and amount are required',
                received: { phoneNumber, amount, orderId, description }
            });
        }
        
        console.log(`Processing M-Pesa payment: ${amount} KES from ${phoneNumber} for order ${orderId || 'N/A'}`);
        
        // Get the M-Pesa token
        const tokenBaseUrl = process.env.MPESA_TOKEN_BASE_URL || 'https://default-trusted-url.com';
        const tokenResponse = await axios.get(`${tokenBaseUrl}/api/mpesa/token`);
        const token = tokenResponse.data.token;
        
        // Prepare STK Push parameters
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const shortCode = process.env.MPESA_SHORTCODE || '174379';
        const passkey = process.env.MPESA_PASSKEY;
        
        // Generate password (base64 of shortcode + passkey + timestamp)
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
        
        // Configure callback URL
        const callbackUrl = process.env.MPESA_CALLBACK_URL;
        console.log(`Using callback URL: ${callbackUrl}`);
        
        // Format phone number if needed (ensure it starts with 254)
        let formattedPhone = phoneNumber;
        if (phoneNumber.startsWith('0')) {
            formattedPhone = `254${phoneNumber.substring(1)}`;
        } else if (!phoneNumber.startsWith('254')) {
            formattedPhone = `254${phoneNumber}`;
        }
        
        // Prepare request data
        const data = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount), // Ensure whole number
            PartyA: formattedPhone,
            PartyB: shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: orderId || `ORDER-${Date.now()}`,
            TransactionDesc: description || 'Clinique Beauty Purchase'
        };
        
        console.log('Sending M-Pesa request with data:', JSON.stringify(data, null, 2));
        
        // Determine the API URL based on environment
        const apiUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';
        
        // Send STK Push request
        const response = await axios.post(
            `${apiUrl}/mpesa/stkpush/v1/processrequest`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('M-Pesa response:', JSON.stringify(response.data, null, 2));
        
        // Return the response with additional information
        res.json({
            success: true,
            message: 'STK push initiated successfully',
            checkoutRequestId: response.data.CheckoutRequestID,
            merchantRequestId: response.data.MerchantRequestID,
            responseCode: response.data.ResponseCode,
            responseDescription: response.data.ResponseDescription,
            customerMessage: response.data.CustomerMessage
        });
    } catch (error) {
        console.error('M-Pesa payment error:', error);
        
        // Extract detailed error information
        const errorDetails = error.response?.data || {};
        
        // Return detailed error information
        res.status(500).json({
            error: true,
            message: 'Failed to initiate M-Pesa payment',
            errorCode: errorDetails.errorCode || error.code,
            errorMessage: errorDetails.errorMessage || error.message,
            requestId: errorDetails.requestId,
            details: errorDetails
        });
    }
});

// Import the Supabase integration
import { processMpesaCallback, getMpesaTransactionStatus } from '../utils/supabaseMpesaIntegration.js';

// Callback route for M-Pesa - this receives the transaction result
router.post('/callback', async (req, res) => {
    console.log('M-Pesa callback received:', JSON.stringify(req.body, null, 2));
    
    // Extract the callback data
    const callbackData = req.body;
    
    // Process the callback and update Supabase
    try {
        const result = await processMpesaCallback(callbackData);
        console.log('Callback processing result:', result);
    } catch (error) {
        console.error('Error processing callback:', error);
    }
    
    // Always respond to Safaricom with success to avoid retries
    res.json({ ResultCode: 0, ResultDesc: 'Callback received successfully' });
});

// Enhanced STK status query endpoint with Supabase integration
router.post('/query', async (req, res) => {
    try {
        const { checkoutRequestId } = req.body;
        
        if (!checkoutRequestId) {
            return res.status(400).json({
                error: true,
                message: 'Checkout request ID is required'
            });
        }
        
        // First check if we already have the transaction in Supabase
        const supabaseStatus = await getMpesaTransactionStatus(checkoutRequestId);
        
        // If the transaction is already completed in Supabase, return that status
        if (supabaseStatus.success && supabaseStatus.status === 'completed') {
            return res.json({
                ResultCode: 0,
                ResultDesc: 'The service request is processed successfully.',
                ...supabaseStatus
            });
        }
        
        // If not found or not completed, query Safaricom API
        // Get the M-Pesa token
        const baseUrl = process.env.INTERNAL_BASE_URL || 'http://localhost';
        const tokenResponse = await axios.get(`${baseUrl}/api/mpesa/token`);
        const token = tokenResponse.data.token;
        
        // Prepare query parameters
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const shortCode = process.env.MPESA_SHORTCODE || '174379';
        const passkey = process.env.MPESA_PASSKEY;
        
        // Generate password (base64 of shortcode + passkey + timestamp)
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
        
        // Prepare request data
        const data = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId
        };
        
        // Determine the API URL based on environment
        const apiUrl = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';
        
        // Send query request
        const response = await axios.post(
            `${apiUrl}/mpesa/stkpushquery/v1/query`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Return the response
        res.json(response.data);
    } catch (error) {
        console.error('Status query error:', error.response?.data || error.message);
        res.status(500).json({
            error: true,
            message: error.response?.data?.errorMessage || error.message || 'Failed to query payment status'
        });
    }
});

// Health check endpoint specific to M-Pesa
router.get('/health', (req, res) => {
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    res.json({
        status: 'ok',
        message: 'M-Pesa API routes are operational',
        callbackConfigured: !!callbackUrl,
        apiCredentialsConfigured: !!(consumerKey && consumerSecret),
        callbackUrl: callbackUrl || 'Not configured'
    });
});

export default router;
