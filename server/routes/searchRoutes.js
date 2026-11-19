import express from 'express';
import { supabase } from '../config/db.js';

const router = express.Router();

// Search products
router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: true, 
        message: 'Search query is required' 
      });
    }

    if (!supabase) {
      return res.json([]);
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`);
    
    if (error) {
      console.warn('Database error searching products:', error.message);
      return res.json([]);
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Error searching products:', error);
    res.json([]);
  }
});

export default router;
