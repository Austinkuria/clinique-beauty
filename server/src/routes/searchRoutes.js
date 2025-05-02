import express from 'express';
import { supabase } from '../config/db.js';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search for products
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, sort = 'default' } = req.query;
    
    // Start with a base query
    let searchQuery = supabase.from('products').select('*');
    
    // Add search filter if a query is provided
    if (query) {
      searchQuery = searchQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }
    
    // Add category filter if provided
    if (category) {
      searchQuery = searchQuery.eq('category', category);
    }
    
    // Add price range filters if provided
    if (minPrice) {
      searchQuery = searchQuery.gte('price', minPrice);
    }
    
    if (maxPrice) {
      searchQuery = searchQuery.lte('price', maxPrice);
    }
    
    // Apply sorting
    switch (sort) {
      case 'price-asc':
        searchQuery = searchQuery.order('price', { ascending: true });
        break;
      case 'price-desc':
        searchQuery = searchQuery.order('price', { ascending: false });
        break;
      case 'name-asc':
        searchQuery = searchQuery.order('name', { ascending: true });
        break;
      case 'rating-desc':
        searchQuery = searchQuery.order('rating', { ascending: false });
        break;
      default:
        // Default sorting
        searchQuery = searchQuery.order('created_at', { ascending: false });
    }
    
    // Execute the query
    const { data, error } = await searchQuery;
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/search/autocomplete
 * @desc    Get search suggestions for autocomplete
 * @access  Public
 */
router.get('/autocomplete', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Get matching product names for autocomplete
    const { data, error } = await supabase
      .from('products')
      .select('name, id, category')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(10);
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching autocomplete suggestions',
      error: error.message
    });
  }
});

export default router;
