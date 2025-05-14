-- Run this in the Supabase SQL Editor directly

-- Create sellers table
CREATE TABLE IF NOT EXISTS public.sellers (
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

-- Enable row-level security (RLS)
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can see all sellers" ON public.sellers;
DROP POLICY IF EXISTS "Public can see approved sellers" ON public.sellers;
DROP POLICY IF EXISTS "Admins can update sellers" ON public.sellers;

-- Create new policies that work with the Edge Functions context
-- Policy for admins (can see all sellers) - no auth check in Edge Functions
CREATE POLICY "Anyone can see all sellers" ON public.sellers
    FOR SELECT
    USING (true);

-- Policy for admins to update sellers - handled in code instead of RLS
CREATE POLICY "Anyone can update sellers" ON public.sellers
    FOR UPDATE
    USING (true);

-- Policy for insert and delete
CREATE POLICY "Anyone can insert sellers" ON public.sellers
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can delete sellers" ON public.sellers
    FOR DELETE
    USING (true);

-- Create public function to get pending verification requests
CREATE OR REPLACE FUNCTION public.get_pending_sellers()
RETURNS SETOF public.sellers
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM public.sellers
    WHERE status = 'pending'
    ORDER BY registration_date DESC;
$$;

-- Grant necessary permissions to anon and service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellers TO anon, service_role;
GRANT USAGE ON SEQUENCE sellers_id_seq TO anon, service_role;

-- Test insert (will be removed by the seeding script)
INSERT INTO public.sellers (business_name, contact_name, email, phone, location, status)
VALUES ('Test Seller', 'Test Contact', 'test@example.com', '+1234567890', 'Test Location', 'pending')
ON CONFLICT (email) DO NOTHING;
