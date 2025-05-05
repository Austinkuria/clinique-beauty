import axios from 'axios';
import { Buffer } from 'buffer';
import { supabase } from '../config/db.js';

// M-Pesa API credentials from environment variables
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const PASSKEY = process.env.MPESA_PASSKEY;
const BUSINESS_SHORT_CODE = process.env.MPESA_SHORTCODE;
const TRANSACTION_TYPE = 'CustomerPayBillOnline';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://your-domain.com/api/mpesa/callback';

// Base URLs for Safaricom API
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

/**
 * Generates an OAuth token for Safaricom API
 */
export const generateToken = async (req, res) => {
  try {
    // Basic auth is the base64 encoding of consumer key:consumer secret
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    return res.status(200).json({ token: response.data.access_token });
  } catch (error) {
    console.error('Error generating M-Pesa token:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to generate M-Pesa token' });
  }
};

/**
 * Initiates STK Push to customer's phone
 */
export const stkPush = async (req, res) => {
  try {
    // Extract data from request
    const { amount, phoneNumber, orderId, description } = req.body;
    const userId = req.user.id;
    
    if (!amount || !phoneNumber || !orderId) {
      return res.status(400).json({ message: 'Amount, phone number and order ID are required' });
    }
    
    // Get access token
    const tokenResponse = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')}`
      }
    });
    
    const token = tokenResponse.data.access_token;
    
    // Current timestamp in the format YYYYMMDDHHmmss
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    
    // Create password
    const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');
    
    // Prepare request body
    const requestBody = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: TRANSACTION_TYPE,
      Amount: Math.round(amount),
      PartyA: phoneNumber,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: phoneNumber,
      CallBackURL: CALLBACK_URL,
      AccountReference: `CliniqueBeauty-${orderId}`,
      TransactionDesc: description || 'Payment for order at Clinique Beauty'
    };
    
    // Make the request to initiate STK push
    const stkResponse = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`, 
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Save the STK response to database for tracking
    const { data: paymentRecord, error: dbError } = await supabase
      .from('mpesa_transactions')
      .insert({
        user_id: userId,
        order_id: orderId,
        checkout_request_id: stkResponse.data.CheckoutRequestID,
        merchant_request_id: stkResponse.data.MerchantRequestID,
        amount: amount,
        phone_number: phoneNumber,
        status: 'PENDING',
        transaction_type: 'STK_PUSH',
        request_timestamp: new Date().toISOString()
      })
      .select()
      .single();
      
    if (dbError) {
      console.error('Error saving payment record:', dbError);
    }
    
    return res.status(200).json({
      success: true,
      message: 'STK push initiated successfully',
      checkoutRequestId: stkResponse.data.CheckoutRequestID,
      merchantRequestId: stkResponse.data.MerchantRequestID,
      responseCode: stkResponse.data.ResponseCode,
      responseDescription: stkResponse.data.ResponseDescription,
      paymentId: paymentRecord?.id
    });
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to initiate M-Pesa payment',
      error: error.response?.data || error.message
    });
  }
};

/**
 * Query STK Push transaction status
 */
export const queryTransactionStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;
    
    if (!checkoutRequestId) {
      return res.status(400).json({ message: 'Checkout request ID is required' });
    }
    
    // Get access token
    const tokenResponse = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')}`
      }
    });
    
    const token = tokenResponse.data.access_token;
    
    // Current timestamp in the format YYYYMMDDHHmmss
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    
    // Create password
    const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');
    
    // Make the request to check status
    const statusResponse = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`, 
      {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update the transaction record in database
    if (statusResponse.data.ResultCode === '0') {
      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'COMPLETED',
          result_code: statusResponse.data.ResultCode,
          result_desc: statusResponse.data.ResultDesc,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', checkoutRequestId);
    } else {
      await supabase
        .from('mpesa_transactions')
        .update({
          status: 'FAILED',
          result_code: statusResponse.data.ResultCode,
          result_desc: statusResponse.data.ResultDesc,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', checkoutRequestId);
    }
    
    return res.status(200).json({
      success: true,
      ...statusResponse.data
    });
  } catch (error) {
    console.error('Query Status Error:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to check payment status',
      error: error.response?.data || error.message
    });
  }
};

/**
 * Callback handler for M-Pesa
 */
export const handleCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    
    // Log the callback data for debugging
    console.log('M-Pesa Callback Data:', JSON.stringify(callbackData, null, 2));
    
    // Extract the Body element which contains the actual transaction data
    const { Body: { stkCallback = {} } = {} } = callbackData;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;
    
    // Extract transaction details from CallbackMetadata if present
    let mpesaReceiptNumber = '';
    let transactionDate = '';
    let phoneNumber = '';
    let amount = 0;
    
    if (CallbackMetadata && CallbackMetadata.Item && Array.isArray(CallbackMetadata.Item)) {
      CallbackMetadata.Item.forEach(item => {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
        if (item.Name === 'TransactionDate') transactionDate = item.Value;
        if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
        if (item.Name === 'Amount') amount = item.Value;
      });
    }
    
    // Update transaction record in database
    const { data: transaction, error: findError } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();
    
    if (findError) {
      console.error('Error finding transaction:', findError);
      return res.status(200).json({ success: true }); // Always respond with success to M-Pesa
    }
    
    if (ResultCode === 0) {
      // Payment successful
      const { error: updateError } = await supabase
        .from('mpesa_transactions')
        .update({
          status: 'COMPLETED',
          result_code: ResultCode.toString(),
          result_desc: ResultDesc,
          mpesa_receipt: mpesaReceiptNumber,
          transaction_date: transactionDate,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', CheckoutRequestID);
      
      if (updateError) {
        console.error('Error updating transaction:', updateError);
      }
      
      // Update the order status if we have an order ID
      if (transaction && transaction.order_id) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            payment_status: 'PAID',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.order_id);
        
        if (orderError) {
          console.error('Error updating order:', orderError);
        }
      }
    } else {
      // Payment failed
      const { error: updateError } = await supabase
        .from('mpesa_transactions')
        .update({
          status: 'FAILED',
          result_code: ResultCode.toString(),
          result_desc: ResultDesc,
          updated_at: new Date().toISOString()
        })
        .eq('checkout_request_id', CheckoutRequestID);
      
      if (updateError) {
        console.error('Error updating transaction:', updateError);
      }
    }
    
    // Respond with success to M-Pesa (must always respond with a success)
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Callback Error:', error);
    // Always respond with success to M-Pesa
    return res.status(200).json({ success: true });
  }
};

export default {
  generateToken,
  stkPush,
  queryTransactionStatus,
  handleCallback
};
