import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM categories ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all tags
router.get('/tags', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM tags ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get category by ID
router.get('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM categories WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Get tag by ID
router.get('/tags/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM tags WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// Create new category (admin only)
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === '23505') { // unique constraint violation
      res.status(409).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Create new tag (admin only)
router.post('/tags', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO tags (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error.code === '23505') { // unique constraint violation
      res.status(409).json({ error: 'Tag name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }
});

export default router;