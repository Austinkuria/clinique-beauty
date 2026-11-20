import express from 'express';
import { supabase } from '../config/db.js';

const router = express.Router();

// Helper to resolve Clerk user id to database user record
async function getOrCreateDbUser(clerkUser) {
  if (!supabase || !clerkUser) return null;
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.email || (clerkUser.id ? `${clerkUser.id}@clinique.internal` : null);
  if (!email) return null;

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .maybeSingle();

  if (existingUser) {
    return existingUser;
  }

  const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Clinique Customer';
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ email, name, role: 'customer', password: 'oauth_managed_clerk' })
    .select('id, email, role')
    .maybeSingle();

  if (error) {
    const { data: byEmail } = await supabase.from('users').select('id, email, role').eq('email', email).maybeSingle();
    return byEmail || null;
  }
  return newUser;
}

// Get cart items for the authenticated user
router.get('/', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([]);
    }

    const dbUser = await getOrCreateDbUser(req.user);
    if (!dbUser) {
      return res.json([]);
    }
    
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        products (
          id, name, price, image, stock
        )
      `)
      .eq('user_id', dbUser.id);
    
    if (error) {
      console.warn('Database error fetching cart items, returning empty array:', error.message);
      return res.json([]);
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.json([]);
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(200).json({ success: true, localOnly: true });
    }

    const dbUser = await getOrCreateDbUser(req.user);
    if (!dbUser) {
      return res.status(401).json({ error: true, message: 'Authentication required' });
    }

    const { productId, quantity } = req.body;
    
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
      .eq('user_id', dbUser.id)
      .eq('product_id', productId)
      .maybeSingle();
    
    if (existingItem) {
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
        user_id: dbUser.id,
        product_id: productId,
        quantity
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
    if (!supabase) return res.json({ success: true });
    const dbUser = await getOrCreateDbUser(req.user);
    if (!dbUser) return res.json({ success: true });

    const { id } = req.params;
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', dbUser.id);
    
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
    if (!supabase) return res.json({ success: true });
    const dbUser = await getOrCreateDbUser(req.user);
    if (!dbUser) return res.json({ success: true });
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', dbUser.id);
    
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
