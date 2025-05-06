import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Get M-Pesa OAuth token
router.get('/token', async (req, res) => {
    try {
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        
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
        
        // Send request to get the token
        const response = await axios.get(`${apiUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });
        
        res.json({ token: response.data.access_token });
    } catch (error) {
        console.error('M-Pesa token error:', error);
        res.status(500).json({ 
            error: true, 
            message: error.message || 'Failed to get M-Pesa token'
        });
    }
});

// Initiate STK Push
router.post('/stkpush', async (req, res) => {
    try {
        const { phoneNumber, amount, orderId, description } = req.body;
        
        if (!phoneNumber || !amount) {
            return res.status(400).json({
                error: true,
                message: 'Phone number and amount are required'
            });
        }
        
        // Get the M-Pesa token
        const tokenResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/mpesa/token`);
        const token = tokenResponse.data.token;
        
        // Prepare STK Push parameters
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const shortCode = process.env.MPESA_SHORTCODE || '174379'; // Default to sandbox shortcode
        const passkey = process.env.MPESA_PASSKEY;
        
        // Generate password (base64 of shortcode + passkey + timestamp)
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
        
        // Configure callback URL
        const callbackUrl = process.env.MPESA_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/mpesa/callback`;
        
        // Prepare request data
        const data = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: shortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: callbackUrl,
            AccountReference: orderId || `ORDER-${Date.now()}`,
            TransactionDesc: description || 'Clinique Beauty Purchase'
        };
        
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
        
        // Return the response
        res.json(response.data);
    } catch (error) {
        console.error('STK Push error:', error.response?.data || error.message);
        res.status(500).json({
            error: true,
            message: error.response?.data?.errorMessage || error.message || 'Failed to initiate payment'
        });
    }
});

// Callback route for M-Pesa - this receives the transaction result
router.post('/callback', (req, res) => {
    console.log('M-Pesa callback received:', JSON.stringify(req.body, null, 2));
    
    // Extract the callback data
    const callbackData = req.body;
    
    // In a production app, you would process the callback data
    // For example: update order status, notify user, etc.
    
    // Respond to Safaricom
    res.json({ ResultCode: 0, ResultDesc: 'Callback received successfully' });
});

// Query STK Push status
router.post('/query', async (req, res) => {
    try {
        const { checkoutRequestId } = req.body;
        
        if (!checkoutRequestId) {
            return res.status(400).json({
                error: true,
                message: 'Checkout request ID is required'
            });
        }
        
        // Get the M-Pesa token
        const tokenResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/mpesa/token`);
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
