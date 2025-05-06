import express from 'express';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    
    let query = supabase.from('products').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to retrieve products' 
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ 
        error: true, 
        message: 'Product not found' 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Failed to retrieve product' 
    });
  }
});

export default router;
