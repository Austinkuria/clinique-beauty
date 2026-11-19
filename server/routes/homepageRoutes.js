// server/routes/homepageRoutes.js
// Dynamic homepage content engine serving hero banners, flash sales, hot categories, and curated feeds

import express from 'express';
import { supabase } from '../config/db.js';

const router = express.Router();

// Fallback seed catalog for instant resilience if database queries are empty or offline
const DEFAULT_HERO_BANNERS = [
  {
    id: 'hero-1',
    title: 'Super Beauty Deals',
    subtitle: 'Up to 50% Off Top Skincare and Cosmetics',
    badge: 'Limited Time',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    link: '/products/skincare',
    ctaText: 'Shop Deals'
  },
  {
    id: 'hero-2',
    title: 'Professional Makeup Studio',
    subtitle: 'Flawless Coverage and Vibrant Mineral Palettes',
    badge: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
    link: '/products/makeup',
    ctaText: 'Explore Makeup'
  },
  {
    id: 'hero-3',
    title: 'Luxury Fragrance Collection',
    subtitle: 'Long-lasting Signature Scents from Verified Sellers',
    badge: 'Official Stores',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
    link: '/products/fragrance',
    ctaText: 'Discover Perfumes'
  }
];

const DEFAULT_SIDE_PROMOS = [
  {
    id: 'promo-1',
    title: 'Clear Skin Duo',
    tag: 'From KES 1,899',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
    link: '/products/skincare'
  },
  {
    id: 'promo-2',
    title: 'Intense Hair Repair',
    tag: 'Save 30%',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80',
    link: '/products/hair'
  }
];

const DEFAULT_HOT_CATEGORIES = [
  { id: 'cat-1', name: 'Moisturisers', slug: 'skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=240&q=80' },
  { id: 'cat-2', name: 'Face Serums', slug: 'skincare', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=240&q=80' },
  { id: 'cat-3', name: 'Cleansers', slug: 'skincare', image: 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=240&q=80' },
  { id: 'cat-4', name: 'Sunscreen', slug: 'skincare', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=240&q=80' },
  { id: 'cat-5', name: 'Foundation', slug: 'makeup', image: 'https://images.unsplash.com/photo-1631730486784-5456119f69ae?auto=format&fit=crop&w=240&q=80' },
  { id: 'cat-6', name: 'Lip Care', slug: 'makeup', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=240&q=80' },
  { id: 'cat-7', name: 'Eye Palettes', slug: 'makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=240&q=80' },
  { id: 'cat-8', name: 'Fragrance', slug: 'fragrance', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=240&q=80' },
  { id: 'cat-9', name: 'Hair Masks', slug: 'hair', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=240&q=80' },
  { id: 'cat-10', name: 'Body Care', slug: 'body', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=240&q=80' }
];

// Calculate next flash sale expiration timestamp (6-hour rotating window)
function getNextFlashSaleEndTime() {
  const now = new Date();
  const currentHours = now.getHours();
  const nextWindowHour = Math.ceil((currentHours + 1) / 6) * 6;
  const target = new Date(now);
  target.setHours(nextWindowHour, 0, 0, 0);
  if (target <= now) {
    target.setHours(target.getHours() + 6);
  }
  return target.toISOString();
}

router.get('/', async (req, res) => {
  try {
    let productsList = [];
    let heroBanners = DEFAULT_HERO_BANNERS;
    let sidePromoBanners = DEFAULT_SIDE_PROMOS;

    // Attempt to pull real products and banners from Supabase
    if (supabase) {
      try {
        const { data: dbBanners } = await supabase
          .from('homepage_banners')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (Array.isArray(dbBanners) && dbBanners.length > 0) {
          const heroes = dbBanners.filter((b) => b.slot === 'hero').map((b) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            badge: b.badge,
            image: b.image_url,
            link: b.link_url,
            ctaText: b.cta_text
          }));
          const sides = dbBanners.filter((b) => b.slot === 'side_promo').map((b) => ({
            id: b.id,
            title: b.title,
            tag: b.badge || 'Deal',
            image: b.image_url,
            link: b.link_url
          }));
          if (heroes.length > 0) heroBanners = heroes;
          if (sides.length > 0) sidePromoBanners = sides;
        }
      } catch (bannerErr) {
        // Table not migrated yet; defaults will be used
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, category, subcategory, rating, reviews_count, stock, seller_id')
        .limit(40);

      if (!error && Array.isArray(data) && data.length > 0) {
        productsList = data;
      }
    }

    // Dynamic Flash Sale generator from active products
    const flashSaleProducts = productsList.slice(0, 6).map((product, index) => {
      const discountPercent = 15 + ((index * 7) % 35);
      const originalPrice = Number(product.price) || 2500;
      const salePrice = Math.round(originalPrice * (1 - discountPercent / 100));
      const claimedPercent = 40 + ((index * 13) % 55);

      return {
        ...product,
        originalPrice,
        salePrice,
        discountPercent,
        claimedPercent
      };
    });

    // Dynamic New Arrivals shelf
    const newArrivals = productsList.slice(6, 12).map((product) => ({
      ...product,
      badge: 'New'
    }));

    // Dynamic "You May Also Like" feed with verified seller tags
    const recommended = productsList.slice(0, 24).map((product, index) => ({
      ...product,
      sellerBadge: index % 3 === 0 ? 'Official Store' : 'Fulfilled by Clinique',
      verifiedSeller: true
    }));

    return res.json({
      success: true,
      data: {
        heroBanners,
        sidePromoBanners,
        hotCategories: DEFAULT_HOT_CATEGORIES,
        flashSale: {
          title: 'Flash Sale',
          endsAt: getNextFlashSaleEndTime(),
          items: flashSaleProducts
        },
        newArrivals,
        recommended
      }
    });
  } catch (err) {
    console.error('Error compiling dynamic homepage feed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to compile homepage feed',
      error: err.message
    });
  }
});

export default router;
