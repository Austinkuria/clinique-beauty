import { supabase } from '../config/db.js';
import { Readable } from 'stream';

// Function to upload image to Supabase Storage
async function uploadImageToSupabase(file) {
  if (!file || !file.originalname || !file.buffer) {
    console.error('Invalid file object for Supabase upload:', file);
    throw new Error('Invalid file object provided for upload.');
  }

  const fileName = `products/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
  
  // Log the file name and size before upload
  console.log(`Uploading ${fileName} to Supabase Storage. Size: ${file.size} bytes.`);

  const { data, error } = await supabase.storage
    .from('product-images') // Ensure this bucket exists and is configured for public access if needed
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600', // Cache for 1 hour
      upsert: false, // Do not overwrite if file with same name exists
    });

  if (error) {
    console.error('Error uploading image to Supabase:', error);
    throw error;
  }

  // Construct the public URL for the uploaded image
  // Ensure your Supabase URL is correctly set in environment variables
  const { publicUrl } = supabase.storage.from('product-images').getPublicUrl(fileName).data;
  
  // Log the public URL
  console.log(`Image uploaded successfully. Public URL: ${publicUrl}`);
  
  return publicUrl;
}

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      brand,
      sku,
      stock_quantity,
      ratings,
      reviews_count,
      color,
      size,
      material,
      tags, // Expect tags as a comma-separated string or an array
      availability,
      discount_price, // Optional: for sales or promotions
      meta_title, // SEO
      meta_description, // SEO
      meta_keywords, // SEO
      // approval_status will be managed by admin actions, not direct creation
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadImageToSupabase(req.file);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        // Decide if you want to proceed without an image or return an error
        // For now, let's return an error if image upload fails
        return res.status(500).json({
          error: true,
          message: 'Failed to upload product image.',
          details: uploadError.message,
        });
      }
    }

    // Convert tags from comma-separated string to array if necessary
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => typeof tag === 'string' && tag.trim()).map(tag => tag.trim());
      }
    }
    
    // Validate required fields
    if (!name || !description || !price || !category || !stock_quantity) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required fields: name, description, price, category, stock_quantity.' 
      });
    }

    const newProduct = {
      name,
      description,
      price: parseFloat(price),
      category,
      subcategory: subcategory || null,
      brand: brand || null,
      sku: sku || null,
      stock_quantity: parseInt(stock_quantity, 10),
      ratings: ratings ? parseFloat(ratings) : 0,
      reviews_count: reviews_count ? parseInt(reviews_count, 10) : 0,
      images: imageUrl ? [imageUrl] : [], // Store image URL in an array as per schema
      color: color || null,
      size: size || null,
      material: material || null,
      tags: processedTags, // Use processed tags
      availability: availability || 'in stock', // Default to 'in stock'
      // Default approval_status to 'pending'
      approval_status: 'pending', 
      // Add discount price if provided, otherwise null
      discount_price: discount_price ? parseFloat(discount_price) : null,
      // SEO fields
      meta_title: meta_title || name, // Default meta_title to product name
      meta_description: meta_description || description.substring(0, 160), // Default meta_description to start of product description
      meta_keywords: meta_keywords ? (typeof meta_keywords === 'string' ? meta_keywords.split(',').map(kw => kw.trim()) : meta_keywords) : [],
      // featured can be set later by an admin
      featured: false, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('products').insert([newProduct]).select();

    if (error) {
      console.error('Error creating product in Supabase:', error);
      // Check for specific Supabase errors, e.g., unique constraint violation
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ 
          error: true, 
          message: 'Failed to create product. A product with similar unique properties (e.g., SKU) might already exist.',
          details: error.details
        });
      }
      throw error; // Re-throw for generic error handling
    }

    res.status(201).json({
      message: 'Product created successfully!',
      product: data && data.length > 0 ? data[0] : null,
    });

  } catch (error) {
    console.error('Server error creating product:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to create product on the server.',
      details: error.message,
    });
  }
};
