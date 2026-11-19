// server/utils/orderSplitter.js
import { supabase } from '../config/db.js';

/**
 * Splits a paid master order into vendor sub-orders (Kilimall / Jumia model).
 * Groups items by seller_id, calculates marketplace commission, and allocates vendor payouts.
 * @param {string} orderId - Master order UUID
 * @returns {Promise<{ success: boolean, subOrders: Array }>}
 */
export async function splitOrderIntoVendorOrders(orderId) {
  try {
    // 1. Retrieve order items with product details
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('id, product_id, quantity, price, shade, products(id, name, seller_id, stock)')
      .eq('order_id', orderId);

    if (itemsError || !items || items.length === 0) {
      console.error('No items found to split for order:', orderId, itemsError);
      return { success: false, error: 'No items found for order' };
    }

    // 2. Group items by seller_id
    const vendorGroups = {};
    for (const item of items) {
      const sellerId = item.products?.seller_id;
      if (!sellerId) {
        console.warn('Item missing seller_id, product:', item.product_id);
        continue;
      }
      if (!vendorGroups[sellerId]) {
        vendorGroups[sellerId] = [];
      }
      vendorGroups[sellerId].push(item);
    }

    const createdSubOrders = [];

    // 3. Process each vendor sub-order
    for (const [sellerId, vendorItems] of Object.entries(vendorGroups)) {
      // Fetch seller commission rate
      const { data: seller } = await supabase
        .from('sellers')
        .select('commission_rate')
        .eq('id', sellerId)
        .single();

      const commissionRate = Number(seller?.commission_rate || 10.00);
      const subtotal = vendorItems.reduce((acc, it) => acc + (Number(it.price) * Number(it.quantity)), 0);
      const commissionFee = +(subtotal * (commissionRate / 100)).toFixed(2);
      const sellerPayout = +(subtotal - commissionFee).toFixed(2);
      const subOrderNumber = `VO-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

      // Insert vendor sub-order
      const { data: subOrder, error: subOrderError } = await supabase
        .from('vendor_orders')
        .insert({
          parent_order_id: orderId,
          seller_id: sellerId,
          sub_order_number: subOrderNumber,
          subtotal,
          commission_fee: commissionFee,
          seller_payout: sellerPayout,
          status: 'pending'
        })
        .select()
        .single();

      if (subOrderError) {
        console.error('Error creating vendor sub-order:', subOrderError);
        continue;
      }

      createdSubOrders.push(subOrder);

      // Link order items to this sub-order
      const itemIds = vendorItems.map((i) => i.id);
      await supabase
        .from('order_items')
        .update({
          vendor_order_id: subOrder.id,
          seller_id: sellerId,
          unit_price: vendorItems[0]?.price
        })
        .in('id', itemIds);

      // 4. Update vendor wallet pending escrow balance
      const { data: wallet } = await supabase
        .from('vendor_wallets')
        .select('pending_balance')
        .eq('seller_id', sellerId)
        .single();

      if (wallet) {
        await supabase
          .from('vendor_wallets')
          .update({
            pending_balance: Number(wallet.pending_balance || 0) + sellerPayout,
            updated_at: new Date().toISOString()
          })
          .eq('seller_id', sellerId);
      } else {
        await supabase
          .from('vendor_wallets')
          .insert({
            seller_id: sellerId,
            pending_balance: sellerPayout,
            available_balance: 0.00
          });
      }

      // Record wallet transaction
      await supabase
        .from('wallet_transactions')
        .insert({
          seller_id: sellerId,
          vendor_order_id: subOrder.id,
          amount: sellerPayout,
          transaction_type: 'escrow_credit',
          description: `Escrow credit for sub-order ${subOrderNumber}`
        });

      // 5. Deduct inventory stock for each product
      for (const item of vendorItems) {
        const currentStock = item.products?.stock;
        if (typeof currentStock === 'number') {
          const nextStock = Math.max(0, currentStock - item.quantity);
          await supabase
            .from('products')
            .update({ stock: nextStock })
            .eq('id', item.product_id);
        }
      }
    }

    return { success: true, subOrders: createdSubOrders };
  } catch (err) {
    console.error('Failed to split order into vendor orders:', err);
    return { success: false, error: err.message };
  }
}
