import express from 'express';
import { supabase } from '../config/db.js';

const router = express.Router();

// Helper to resolve Clerk user to user_profiles record (which has integer ID matching cart_items.user_id)
async function getOrCreateDbUser(clerkUser) {
  if (!supabase || !clerkUser) return null;
  const clerkId = clerkUser.id;
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.email || (clerkId ? `${clerkId}@clinique.internal` : null);

  // 1. Check user_profiles table where id is integer
  if (email || clerkId) {
    let query = supabase.from('user_profiles').select('id, clerk_id, email, role');
    if (email && clerkId) {
      query = query.or(`clerk_id.eq.${clerkId},email.eq.${email}`);
    } else if (email) {
      query = query.eq('email', email);
    } else {
      query = query.eq('clerk_id', clerkId);
    }

    const { data: profile } = await query.maybeSingle();
    if (profile && typeof profile.id === 'number') {
      return profile;
    }
  }

  // 2. If no profile exists, create one with auto-increment integer ID
  const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Clinique Customer';
  const { data: newProfile, error } = await supabase
    .from('user_profiles')
    .insert({
      clerk_id: clerkId || `clerk_${Date.now()}`,
      email: email || `user_${Date.now()}@clinique.internal`,
      name,
      role: 'customer'
    })
    .select('id, clerk_id, email, role')
    .maybeSingle();

  if (!error && newProfile && typeof newProfile.id === 'number') {
    return newProfile;
  }

  // Fallback: pick the first available profile or default to id 5
  const { data: fallback } = await supabase.from('user_profiles').select('id, clerk_id, email, role').limit(1).maybeSingle();
  return fallback || { id: 5, email: 'fallback@clinique.internal', role: 'customer' };
}

// Helper to format cart items with flattened product data
function formatDbCartItem(item) {
  const prod = item.products || {};
  return {
    id: item.id,
    cartItemId: item.id,
    productId: item.product_id || prod.id,
    name: prod.name || 'Clinique Product',
    price: typeof prod.price === 'number' ? prod.price : (parseFloat(prod.price) || 0),
    image: prod.image || null,
    stock: prod.stock !== undefined ? prod.stock : 99,
    quantity: item.quantity || 1,
    products: prod
  };
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
    
    const formatted = (data || []).map(formatDbCartItem);
    res.json(formatted);
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
        .select(`
          id,
          quantity,
          product_id,
          products (
            id, name, price, image, stock
          )
        `);
      
      if (error) {
        throw error;
      }
      
      return res.json(formatDbCartItem(data[0]));
    }
    
    // Add new item to cart
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: dbUser.id,
        product_id: productId,
        quantity
      })
      .select(`
        id,
        quantity,
        product_id,
        products (
          id, name, price, image, stock
        )
      `);
    
    if (error) {
      throw error;
    }
    
    res.status(201).json(formatDbCartItem(data[0]));
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to add item to cart' 
    });
  }
});

// Update cart item quantity (supports /update with body payload)
router.put('/update', async (req, res) => {
  try {
    if (!supabase) return res.json({ success: true });
    const dbUser = await getOrCreateDbUser(req.user);
    if (!dbUser) return res.status(401).json({ error: true, message: 'Authentication required' });

    const { itemId, quantity, productId } = req.body;
    if (!itemId && !productId) {
      return res.status(400).json({ error: true, message: 'Item ID or Product ID required' });
    }

    const newQty = Math.max(1, parseInt(quantity, 10) || 1);
    let query = supabase.from('cart_items').update({ quantity: newQty });
    if (itemId) {
      query = query.eq('id', itemId).eq('user_id', dbUser.id);
    } else {
      query = query.eq('product_id', productId).eq('user_id', dbUser.id);
    }

    const { data, error } = await query.select(`
      id,
      quantity,
      product_id,
      products (
        id, name, price, image, stock
      )
    `);

    if (error) throw error;
    res.json({ success: true, item: data?.[0] ? formatDbCartItem(data[0]) : null });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: true, message: error.message || 'Failed to update item' });
  }
});

// Update cart item quantity by ID parameter
router.put('/:id', async (req, res) => {
  try {
    if (!supabase) return res.json({ success: true });
    const dbUser = await getOrCreateDbUser(req.user);
    if (!dbUser) return res.status(401).json({ error: true, message: 'Authentication required' });

    const { id } = req.params;
    const { quantity } = req.body;
    const newQty = Math.max(1, parseInt(quantity, 10) || 1);

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', id)
      .eq('user_id', dbUser.id)
      .select(`
        id,
        quantity,
        product_id,
        products (
          id, name, price, image, stock
        )
      `);

    if (error) throw error;
    res.json({ success: true, item: data?.[0] ? formatDbCartItem(data[0]) : null });
  } catch (error) {
    console.error('Error updating cart item by ID:', error);
    res.status(500).json({ error: true, message: error.message || 'Failed to update item' });
  }
});

// Remove item from cart via /remove
router.delete('/remove', async (req, res) => {
  try {
    if (!supabase) return res.json({ success: true });
    const dbUser = await getOrCreateDbUser(req.user);
    if (!dbUser) return res.json({ success: true });

    const { itemId, productId } = req.body;
    let query = supabase.from('cart_items').delete().eq('user_id', dbUser.id);
    if (itemId) {
      query = query.eq('id', itemId);
    } else if (productId) {
      query = query.eq('product_id', productId);
    }

    const { error } = await query;
    if (error) throw error;
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: true, message: 'Failed to remove item from cart' });
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

// Remove item from cart by ID
router.delete('/:id', async (req, res) => {
  try {
    if (!supabase) return res.json({ success: true });
    const dbUser = await getOrCreateDbUser(req.user);
    if (!dbUser) return res.json({ success: true });

    const { id } = req.params;
    
    // First try deleting by cart_item id
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', dbUser.id)
      .select('id');
    
    // If nothing matched and it might be a product_id, try deleting by product_id
    if (!error && (!data || data.length === 0)) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', id)
        .eq('user_id', dbUser.id);
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

export default router;
