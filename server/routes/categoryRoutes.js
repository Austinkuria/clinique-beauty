// server/routes/categoryRoutes.js
// Dynamic category and taxonomy management powered by Supabase

import express from 'express';
import { supabase } from '../config/db.js';

const router = express.Router();

// Fallback category catalog if database query fails
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Skincare', slug: 'skincare', description: 'Cleansers, moisturisers, serums, and sunscreen' },
  { id: 2, name: 'Makeup', slug: 'makeup', description: 'Foundations, concealers, lipsticks, and eye palettes' },
  { id: 3, name: 'Fragrance', slug: 'fragrance', description: 'Perfumes, colognes, and body mists' },
  { id: 4, name: 'Hair', slug: 'hair', description: 'Shampoos, conditioners, hair oils, and styling' },
  { id: 5, name: 'Body', slug: 'body', description: 'Body butter, scrubs, and bath essentials' }
];

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const enriched = data.map((cat) => ({
          ...cat,
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
        }));
        return res.json(enriched);
      }
    }
    return res.json(DEFAULT_CATEGORIES);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.json(DEFAULT_CATEGORIES);
  }
});

// Get category by ID
router.get('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return res.json(data);
      }
    }
    const fallback = DEFAULT_CATEGORIES.find((c) => String(c.id) === String(id));
    if (fallback) return res.json(fallback);
    return res.status(404).json({ error: 'Category not found' });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category (Admin controlled)
router.post('/categories', async (req, res) => {
  try {
    const { name, description, slug } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, description, slug: categorySlug }])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// Get all tags
router.get('/tags', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (!error && Array.isArray(data)) {
        return res.json(data);
      }
    }
    return res.json([]);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

export default router;
