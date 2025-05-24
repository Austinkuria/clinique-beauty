import express from 'express';
import multer from 'multer';
import { createProduct } from '../controllers/productController.js';
import { supabase } from '../config/db.js'; // Ensure Supabase is initialized

const router = express.Router();

// Multer configuration for image uploads
// Store in memory to pass buffer to Supabase
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    // Basic image type validation
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

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

// POST new product - Protected by admin middleware (to be added)
// For now, ensure this route is only accessible by authenticated admins
router.post('/', upload.single('image'), createProduct);

// POST /api/admin/products/import - Route for importing products from CSV
router.post('/admin/products/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Placeholder for CSV processing logic
        console.log('File uploaded for import:', req.file.originalname);
        // TODO: Add logic to parse CSV, validate data, and interact with database
        // For now, just return a success message

        res.status(200).json({ message: 'File uploaded successfully. Product import started.' });

    } catch (error) {
        console.error('Error importing products:', error);
        res.status(500).json({ message: 'Error importing products.', error: error.message });
    }
});

export default router;
