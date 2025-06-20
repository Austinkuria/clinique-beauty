-- Migration script to add missing columns to products table
-- Run this in your Supabase SQL Editor to add the missing columns

-- IMPORTANT: Run this entire script at once to avoid schema cache issues

-- Add brand column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand TEXT;

-- Add reviews_count column  
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Add tags column (array of text)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add availability column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'in stock';

-- Add SEO columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_title TEXT;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];

-- Update existing products to have default values
UPDATE products 
SET 
    reviews_count = 0 
WHERE reviews_count IS NULL;

UPDATE products 
SET 
    availability = 'in stock' 
WHERE availability IS NULL;

UPDATE products 
SET 
    tags = '{}' 
WHERE tags IS NULL;

UPDATE products 
SET 
    meta_keywords = '{}' 
WHERE meta_keywords IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN products.brand IS 'Product brand name';
COMMENT ON COLUMN products.reviews_count IS 'Number of customer reviews';
COMMENT ON COLUMN products.tags IS 'Array of product tags for categorization';
COMMENT ON COLUMN products.availability IS 'Product availability status (in stock, out of stock, discontinued)';
COMMENT ON COLUMN products.meta_title IS 'SEO meta title';
COMMENT ON COLUMN products.meta_description IS 'SEO meta description';
COMMENT ON COLUMN products.meta_keywords IS 'Array of SEO keywords';
