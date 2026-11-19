-- server/migrations/003_homepage_campaigns.sql
-- Marketplace Campaigns, Flash Sales, and Homepage Banners Schema

-- 1. Campaigns table for promotional events (Admin curated)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'flash_sale', -- 'flash_sale', 'mega_deal', 'seasonal', 'brand_focus'
    banner_image TEXT,
    discount_rate NUMERIC(5, 2) DEFAULT 20.00,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_active ON public.campaigns(is_active, start_time, end_time);

-- 2. Campaign product nominations (Seller nominations approved by Admin)
CREATE TABLE IF NOT EXISTS public.campaign_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    deal_price NUMERIC(12, 2) NOT NULL,
    allocated_stock INT NOT NULL DEFAULT 20,
    claimed_stock INT NOT NULL DEFAULT 0,
    approval_status TEXT NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_products_lookup ON public.campaign_products(campaign_id, approval_status);

-- 3. Dynamic Homepage Banners (Admin controlled)
CREATE TABLE IF NOT EXISTS public.homepage_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot TEXT NOT NULL DEFAULT 'hero', -- 'hero', 'side_promo'
    title TEXT NOT NULL,
    subtitle TEXT,
    badge TEXT,
    image_url TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Shop Now',
    link_url TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Data for Homepage Banners
INSERT INTO public.homepage_banners (slot, title, subtitle, badge, image_url, cta_text, link_url, sort_order)
VALUES 
    ('hero', 'Super Beauty Deals', 'Up to 50% Off Top Skincare and Cosmetics', 'Limited Time', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', 'Shop Deals', '/products/skincare', 1),
    ('hero', 'Professional Makeup Studio', 'Flawless Coverage and Radiant Mineral Palettes', 'Trending Now', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80', 'Explore Makeup', '/products/makeup', 2),
    ('hero', 'Luxury Fragrance Collection', 'Long-lasting Signature Scents from Verified Sellers', 'Official Stores', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80', 'Discover Perfumes', '/products/fragrance', 3),
    ('side_promo', 'Clear Skin Essentials', 'From KES 1,899', 'Deal', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80', 'View', '/products/skincare', 1),
    ('side_promo', 'Intense Hair Repair', 'Save 30%', 'Promo', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80', 'View', '/products/hair', 2)
ON CONFLICT DO NOTHING;

-- Seed Initial Flash Sale Campaign
INSERT INTO public.campaigns (title, slug, type, discount_rate, start_time, end_time)
VALUES ('Daily Beauty Flash Sale', 'daily-flash-sale', 'flash_sale', 25.00, NOW(), NOW() + INTERVAL '1 day')
ON CONFLICT (slug) DO NOTHING;
