import express from 'express';

const router = express.Router();

// Get cart items for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        shade,
        products (
          id, name, price, image, stock
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to fetch cart items' 
    });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, shade } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ 
        error: true, 
        message: 'Product ID and quantity are required' 
      });
    }
    
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('shade', shade || null)
      .single();
    
    if (existingItem) {
      // Update quantity if item already exists
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return res.json(data[0]);
    }
    
    // Add new item to cart
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
        shade
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to add item to cart' 
    });
  }
});

// Remove item from cart
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to remove item from cart' 
    });
  }
});

// Clear cart
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to clear cart' 
    });
  }
});

export default router;
