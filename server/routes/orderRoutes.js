// server/routes/orderRoutes.js
import express from 'express';
import { supabase } from '../config/db.js';
import { splitOrderIntoVendorOrders } from '../utils/orderSplitter.js';

const router = express.Router();

/**
 * Helper to ensure a database user record exists for the authenticated Clerk user
 */
async function getOrCreateDbUser(clerkUser) {
  const clerkId = clerkUser.id;
  const email = clerkUser.email || `${clerkId}@example.com`;
  const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Customer';

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, clerk_id, email, role')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (existingUser) {
    return existingUser;
  }

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ clerk_id: clerkId, email, name, role: 'customer' })
    .select('id, clerk_id, email, role')
    .single();

  if (error) {
    throw error;
  }
  return newUser;
}

// Get all orders with vendor sub-orders for administrators
router.get('/admin/all', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        vendor_orders (
          id, sub_order_number, subtotal, commission_fee, seller_payout, status,
          sellers (id, business_name, store_name)
        ),
        order_items (
          id, quantity, price, unit_price,
          products (id, name, image)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ success: true, data: orders || [] });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: true, message: 'Failed to fetch admin orders' });
  }
});

// Get customer orders with sub-order tracking
router.get('/', async (req, res) => {
  try {
    const dbUser = await getOrCreateDbUser(req.user);

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        vendor_orders (
          id, sub_order_number, subtotal, status, shipping_carrier, tracking_number,
          sellers (id, business_name, store_name)
        ),
        order_items (
          id, quantity, price, unit_price, shade,
          products (id, name, image)
        )
      `)
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ success: true, data: orders || [] });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: true, message: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const dbUser = await getOrCreateDbUser(req.user);
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        vendor_orders (
          id, sub_order_number, subtotal, status, shipping_carrier, tracking_number,
          sellers (id, business_name, store_name)
        ),
        order_items (
          id, quantity, price, unit_price, shade,
          products (id, name, image)
        )
      `)
      .eq('id', id)
      .eq('user_id', dbUser.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: true, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ error: true, message: 'Failed to fetch order details' });
  }
});

// Create checkout order with server-side price verification
router.post('/checkout', async (req, res) => {
  try {
    const dbUser = await getOrCreateDbUser(req.user);
    const { items, shippingAddress, paymentMethod, customerPhone } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: true, message: 'Cart items are required' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ error: true, message: 'Valid shipping address is required' });
    }

    // 1. Fetch current product records from DB to verify price and stock
    const productIds = items.map((i) => i.productId || i.id || i.product_id);
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, price, stock, seller_id')
      .in('id', productIds);

    if (prodError || !dbProducts) {
      return res.status(500).json({ error: true, message: 'Failed to verify product information' });
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const pid = item.productId || item.id || item.product_id;
      const dbProduct = productMap.get(pid);

      if (!dbProduct) {
        return res.status(400).json({ error: true, message: `Product ${pid} no longer exists` });
      }

      const qty = parseInt(item.quantity, 10) || 1;
      if (dbProduct.stock < qty) {
        return res.status(400).json({
          error: true,
          message: `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.stock}`
        });
      }

      const unitPrice = Number(dbProduct.price);
      calculatedTotal += unitPrice * qty;

      validatedItems.push({
        product_id: dbProduct.id,
        quantity: qty,
        price: unitPrice,
        unit_price: unitPrice,
        seller_id: dbProduct.seller_id,
        shade: item.shade || item.selectedShade?.name || null
      });
    }

    const orderNumber = `CB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

    // 2. Insert master parent order
    const { data: masterOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: dbUser.id,
        order_number: orderNumber,
        total_price: calculatedTotal,
        total_amount: calculatedTotal,
        payment_status: 'pending',
        status: 'pending',
        payment_method: paymentMethod || 'mpesa',
        shipping_address: shippingAddress,
        customer_email: req.user.email || null,
        customer_phone: customerPhone || shippingAddress.phone || null
      })
      .select()
      .single();

    if (orderError) {
      console.error('Master order creation error:', orderError);
      return res.status(500).json({ error: true, message: 'Failed to create order record' });
    }

    // 3. Insert order items linked to master order
    const orderItemsToInsert = validatedItems.map((item) => ({
      ...item,
      order_id: masterOrder.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('Order items insertion error:', itemsError);
      return res.status(500).json({ error: true, message: 'Failed to record order items' });
    }

    res.status(201).json({
      success: true,
      orderId: masterOrder.id,
      orderNumber: masterOrder.order_number,
      totalAmount: calculatedTotal,
      message: 'Order created successfully. Awaiting payment.'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: true, message: 'Checkout failed due to server error' });
  }
});

export default router;
