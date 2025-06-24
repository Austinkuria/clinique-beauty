-- Migration to ensure categories column exists and is properly named
-- This migration will add a categories column and copy data from product_categories if needed

-- First, check if product_categories exists and categories doesn't
DO $$
BEGIN
    -- If product_categories exists but categories doesn't, rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sellers' AND column_name = 'product_categories'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sellers' AND column_name = 'categories'
    ) THEN
        -- Add the categories column
        ALTER TABLE sellers ADD COLUMN categories JSONB;
        
        -- Copy data from product_categories to categories
        UPDATE sellers SET categories = product_categories WHERE product_categories IS NOT NULL;
        
        -- Keep both columns for backward compatibility during transition
        RAISE NOTICE 'Added categories column and copied data from product_categories';
    END IF;
    
    -- If neither exists, create categories
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sellers' AND column_name = 'categories'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sellers' AND column_name = 'product_categories'
    ) THEN
        ALTER TABLE sellers ADD COLUMN categories JSONB;
        RAISE NOTICE 'Added categories column to sellers table';
    END IF;
    
    -- If only categories exists, we're good
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sellers' AND column_name = 'categories'
    ) THEN
        RAISE NOTICE 'Categories column already exists';
    END IF;
END
$$;

-- Create index for categories column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_sellers_categories ON sellers USING GIN (categories);

-- Add a comment to explain the column
COMMENT ON COLUMN sellers.categories IS 'JSON array of product categories this seller is interested in';
