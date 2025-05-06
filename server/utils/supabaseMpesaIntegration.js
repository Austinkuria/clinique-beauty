/**
 * Supabase M-Pesa Integration Utilities
 * 
 * This file contains utility functions to handle M-Pesa callbacks
 * and update Supabase data accordingly.
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Process M-Pesa callback and update order status in Supabase
 * @param {Object} callbackData - The callback data from M-Pesa
 * @returns {Promise<Object>} - Result of the operation
 */
export const processMpesaCallback = async (callbackData) => {
  try {
    console.log('Processing M-Pesa callback:', callbackData);
    
    // Extract relevant data from the callback
    // Adjust these fields based on the actual M-Pesa callback structure
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = callbackData.Body.stkCallback;
    
    // Extract transaction details from metadata
    const metadata = {};
    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach(item => {
        if (item.Name && item.Value) {
          metadata[item.Name] = item.Value;
        }
      });
    }
    
    const transactionAmount = metadata.Amount;
    const mpesaReceiptNumber = metadata.MpesaReceiptNumber;
    const transactionDate = metadata.TransactionDate;
    const phoneNumber = metadata.PhoneNumber;
    
    // Get the order ID from the merchant request ID or from your database
    // This assumes you stored the merchant request ID when initiating the payment
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('mpesa_request_id', MerchantRequestID)
      .single();
    
    if (orderError) {
      console.error('Error finding order:', orderError);
      return { success: false, error: orderError };
    }
    
    if (!order) {
      console.error('Order not found for request ID:', MerchantRequestID);
      return { success: false, error: 'Order not found' };
    }
    
    // Update the order status based on the result code
    const isSuccessful = ResultCode === 0;
    const status = isSuccessful ? 'paid' : 'payment_failed';
    
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        payment_status: isSuccessful ? 'completed' : 'failed',
        payment_details: {
          provider: 'mpesa',
          transaction_id: mpesaReceiptNumber,
          amount: transactionAmount,
          date: transactionDate,
          phone: phoneNumber,
          result_code: ResultCode,
          result_desc: ResultDesc,
          checkout_request_id: CheckoutRequestID
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    if (error) {
      console.error('Error updating order:', error);
      return { success: false, error };
    }
    
    console.log(`Order ${order.id} updated successfully. Status: ${status}`);
    return { success: true, data };
    
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get M-Pesa transaction status from Supabase
 * @param {string} checkoutRequestId - The checkout request ID from STK push
 * @returns {Promise<Object>} - Status information
 */
export const getMpesaTransactionStatus = async (checkoutRequestId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, payment_status, payment_details')
      .eq('payment_details->checkout_request_id', checkoutRequestId)
      .single();
    
    if (error) {
      console.error('Error getting transaction status:', error);
      return { success: false, error };
    }
    
    if (!data) {
      return { 
        success: true, 
        status: 'pending',
        message: 'Transaction not yet processed' 
      };
    }
    
    return {
      success: true,
      status: data.payment_status,
      orderId: data.id,
      details: data.payment_details
    };
    
  } catch (error) {
    console.error('Error checking M-Pesa transaction status:', error);
    return { success: false, error: error.message };
  }
};

export default {
  processMpesaCallback,
  getMpesaTransactionStatus
};
