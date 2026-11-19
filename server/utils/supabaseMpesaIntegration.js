// server/utils/supabaseMpesaIntegration.js
import { supabase } from '../config/db.js';
import { splitOrderIntoVendorOrders } from './orderSplitter.js';

/**
 * Process M-Pesa callback and update order status in Supabase
 * @param {Object} callbackData - The callback data from Safaricom Daraja
 * @returns {Promise<Object>} - Result of the operation
 */
export const processMpesaCallback = async (callbackData) => {
  try {
    console.log('Processing M-Pesa callback:', JSON.stringify(callbackData));

    const stkCallback = callbackData?.Body?.stkCallback;
    if (!stkCallback) {
      return { success: false, error: 'Invalid callback payload structure' };
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;

    // Extract transaction details from metadata
    const metadata = {};
    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach((item) => {
        if (item.Name && item.Value !== undefined) {
          metadata[item.Name] = item.Value;
        }
      });
    }

    const transactionAmount = metadata.Amount;
    const mpesaReceiptNumber = metadata.MpesaReceiptNumber;
    const phoneNumber = metadata.PhoneNumber;

    // Find master order by CheckoutRequestID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .or(`mpesa_checkout_id.eq.${CheckoutRequestID},id.eq.${stkCallback.AccountReference || '00000000-0000-0000-0000-000000000000'}`)
      .maybeSingle();

    if (orderError) {
      console.error('Error finding order for M-Pesa callback:', orderError);
      return { success: false, error: orderError };
    }

    if (!order) {
      console.warn('Order not found for CheckoutRequestID:', CheckoutRequestID);
      return { success: false, error: 'Order not found' };
    }

    const isSuccessful = ResultCode === 0;
    const status = isSuccessful ? 'paid' : 'payment_failed';

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: isSuccessful ? 'processing' : 'payment_failed',
        payment_status: status,
        mpesa_receipt: mpesaReceiptNumber || null,
        payment_details: {
          provider: 'mpesa',
          receipt: mpesaReceiptNumber,
          amount: transactionAmount,
          phone: phoneNumber,
          result_code: ResultCode,
          result_desc: ResultDesc,
          checkout_request_id: CheckoutRequestID,
          merchant_request_id: MerchantRequestID
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order payment status:', updateError);
      return { success: false, error: updateError };
    }

    // On successful payment, trigger order splitting into vendor sub-orders
    if (isSuccessful) {
      console.log(`Splitting master order ${order.id} into vendor sub-orders...`);
      const splitResult = await splitOrderIntoVendorOrders(order.id);
      console.log('Order splitting result:', splitResult);
    }

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error('Error in processMpesaCallback:', error);
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
      .select('id, status, payment_status, total_price, total_amount, mpesa_receipt, order_number')
      .eq('mpesa_checkout_id', checkoutRequestId)
      .maybeSingle();

    if (error || !data) {
      return { success: false, status: 'pending' };
    }

    return {
      success: true,
      status: data.payment_status === 'paid' ? 'completed' : data.payment_status,
      order: data
    };
  } catch (error) {
    console.error('Error checking M-Pesa transaction status:', error);
    return { success: false, error: error.message };
  }
};
