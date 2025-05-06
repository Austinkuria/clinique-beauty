import express from 'express';

const router = express.Router();

// Get orders for authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id, quantity, price, product_id,
          products (id, name, image)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ 
        error: true, 
        message: 'Order not found' 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to fetch order details' 
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      items, 
      shippingAddress, 
      paymentMethod, 
      totalAmount 
    } = req.body;
    
    if (!items || !items.length || !shippingAddress || !paymentMethod || !totalAmount) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required order information' 
      });
    }
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        total_amount: totalAmount
      })
      .select()
      .single();
    
    if (orderError) {
      throw orderError;
    }
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      shade: item.shade
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      throw itemsError;
    }
    
    res.status(201).json({
      success: true,
      orderId: order.id,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to create order' 
    });
  }
});

export default router;
