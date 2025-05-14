-- Run this SQL in the Supabase SQL Editor to create the sellers table

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    location TEXT,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending',
    verification_date TIMESTAMPTZ,
    product_categories JSONB,
    rating NUMERIC,
    sales_count INTEGER DEFAULT 0,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for sellers table
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);

-- Insert a sample seller to verify the table works
INSERT INTO sellers (
    business_name, 
    contact_name, 
    email, 
    phone, 
    location, 
    status,
    product_categories
) VALUES (
    'Test Seller', 
    'Admin User', 
    'test@example.com', 
    '+254 712 345 678', 
    'Nairobi, Kenya', 
    'approved',
    '["Skincare", "Haircare"]'
);
