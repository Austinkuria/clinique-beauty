-- Migration to add seller_id to products table
-- This associates products with their sellers

-- Add seller_id column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);

-- Add comment for documentation
COMMENT ON COLUMN products.seller_id IS 'Reference to the seller who owns this product';
