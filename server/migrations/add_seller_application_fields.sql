-- Migration to add missing fields to sellers table for seller applications
-- Run this after the initial database-schema.sql

-- Add missing columns to sellers table
ALTER TABLE sellers 
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS bank_info JSONB,
ADD COLUMN IF NOT EXISTS documents JSONB,
ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- Create index for clerk_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_sellers_clerk_id ON sellers(clerk_id);

-- Add constraint to ensure either email or clerk_id is unique (but allow one to be null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sellers_clerk_id_unique ON sellers(clerk_id) WHERE clerk_id IS NOT NULL;

-- Update the existing table structure comment
COMMENT ON TABLE sellers IS 'Table storing seller applications and approved sellers';
COMMENT ON COLUMN sellers.business_type IS 'Type of business: Individual, LLC, Corporation, Partnership';
COMMENT ON COLUMN sellers.registration_number IS 'Business registration number';
COMMENT ON COLUMN sellers.tax_id IS 'Tax identification number';
COMMENT ON COLUMN sellers.bank_info IS 'JSON object containing bank account information';
COMMENT ON COLUMN sellers.documents IS 'JSON array containing uploaded document file paths';
COMMENT ON COLUMN sellers.clerk_id IS 'Clerk user ID for authentication';
