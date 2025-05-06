import express from 'express';

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
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`);
    
    if (error) {
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to search products' 
    });
  }
});

export default router;
