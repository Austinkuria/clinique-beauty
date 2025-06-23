-- Migration to add missing fields to sellers table for seller application form
-- This should be run in Supabase SQL Editor

-- Add missing columns to sellers table
ALTER TABLE public.sellers 
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS bank_info JSONB,
ADD COLUMN IF NOT EXISTS documents JSONB,
ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_sellers_clerk_id ON public.sellers(clerk_id);
CREATE INDEX IF NOT EXISTS idx_sellers_business_type ON public.sellers(business_type);
CREATE INDEX IF NOT EXISTS idx_sellers_country ON public.sellers(country);

-- Add constraint to ensure clerk_id is unique when not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_sellers_clerk_id_unique 
ON public.sellers(clerk_id) 
WHERE clerk_id IS NOT NULL;

-- Update comments for documentation
COMMENT ON TABLE public.sellers IS 'Table storing seller applications and approved sellers with complete application data';
COMMENT ON COLUMN public.sellers.business_type IS 'Type of business: Individual, LLC, Corporation, Partnership';
COMMENT ON COLUMN public.sellers.address IS 'Street address of the business';
COMMENT ON COLUMN public.sellers.city IS 'City where business is located';
COMMENT ON COLUMN public.sellers.state IS 'State/Province where business is located';
COMMENT ON COLUMN public.sellers.zip IS 'Postal/ZIP code';
COMMENT ON COLUMN public.sellers.country IS 'Country where business is located';
COMMENT ON COLUMN public.sellers.registration_number IS 'Business registration number';
COMMENT ON COLUMN public.sellers.tax_id IS 'Tax identification number';
COMMENT ON COLUMN public.sellers.bank_info IS 'JSON object containing bank account information for payments';
COMMENT ON COLUMN public.sellers.documents IS 'JSON array containing uploaded document metadata';
COMMENT ON COLUMN public.sellers.clerk_id IS 'Clerk user ID for authentication and user linking';

-- Update the location field to be computed from city and country if needed
UPDATE public.sellers 
SET location = CONCAT(city, ', ', country)
WHERE city IS NOT NULL AND country IS NOT NULL AND (location IS NULL OR location = '');

-- Grant permissions for the new columns
GRANT SELECT, INSERT, UPDATE ON public.sellers TO anon, service_role;
