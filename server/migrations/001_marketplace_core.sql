-- server/migrations/001_marketplace_core.sql
-- Multi-Vendor Marketplace Core Schema (Kilimall / Jumia Architecture)

-- Ensure UUID generation extension is active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Extend sellers table with vendor metadata and Clerk linkage
ALTER TABLE public.sellers 
ADD COLUMN IF NOT EXISTS clerk_id TEXT,
ADD COLUMN IF NOT EXISTS store_name TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS payout_phone TEXT,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2) DEFAULT 10.00;

CREATE INDEX IF NOT EXISTS idx_sellers_clerk_id ON public.sellers(clerk_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sellers_clerk_id_unique ON public.sellers(clerk_id) WHERE clerk_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sellers_slug_unique ON public.sellers(slug) WHERE slug IS NOT NULL;

-- 2. Link products to sellers
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);

-- 3. Extend orders table to act as Parent/Master Orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mpesa',
ADD COLUMN IF NOT EXISTS mpesa_checkout_id TEXT,
ADD COLUMN IF NOT EXISTS mpesa_receipt TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number) WHERE order_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_mpesa_checkout_id ON public.orders(mpesa_checkout_id) WHERE mpesa_checkout_id IS NOT NULL;

-- 4. Create vendor_orders table (The Kilimall/Jumia Sub-Order Split)
CREATE TABLE IF NOT EXISTS public.vendor_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
    sub_order_number TEXT NOT NULL UNIQUE,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    commission_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    seller_payout NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending', 
    -- 'pending', 'confirmed', 'packed', 'ready_for_pickup', 'in_transit', 'delivered', 'cancelled'
    shipping_carrier TEXT,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_orders_parent_id ON public.vendor_orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_seller_id ON public.vendor_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_status ON public.vendor_orders(status);

-- 5. Extend order_items table to link directly to vendor_orders and seller
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS vendor_order_id UUID REFERENCES public.vendor_orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12, 2);

CREATE INDEX IF NOT EXISTS idx_order_items_vendor_order_id ON public.order_items(vendor_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON public.order_items(seller_id);

-- 6. Vendor Wallets (Escrow & Settlement tracking)
CREATE TABLE IF NOT EXISTS public.vendor_wallets (
    seller_id UUID PRIMARY KEY REFERENCES public.sellers(id) ON DELETE CASCADE,
    pending_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Wallet Transaction Ledger
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    vendor_order_id UUID REFERENCES public.vendor_orders(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    transaction_type TEXT NOT NULL, -- 'escrow_credit', 'escrow_release', 'payout_deduction', 'refund_debit'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_seller_id ON public.wallet_transactions(seller_id);
