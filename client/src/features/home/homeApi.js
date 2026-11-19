// client/src/features/home/homeApi.js
// Dynamic homepage API client for promotional feeds, flash sales, and category directories

import { getApiUrl } from '../../config/env';
import mockProducts from '../../data/mockProducts';

const FALLBACK_HERO_BANNERS = [
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
    subtitle: 'Flawless Coverage and Radiant Mineral Palettes',
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

const FALLBACK_SIDE_PROMOS = [
  {
    id: 'promo-1',
    title: 'Clear Skin Essentials',
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

const FALLBACK_HOT_CATEGORIES = [
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

export async function fetchHomepageData() {
  const baseUrl = getApiUrl();
  try {
    const res = await fetch(`${baseUrl}/homepage`);
    if (!res.ok) {
      throw new Error(`Homepage endpoint returned status ${res.status}`);
    }
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Falling back to local dynamic homepage data:', err.message);
  }

  // Construct structured fallback data from mock products
  const flashSaleItems = (mockProducts || []).slice(0, 6).map((item, idx) => {
    const discount = 15 + ((idx * 8) % 30);
    const orig = Number(item.price) || 2500;
    const sale = Math.round(orig * (1 - discount / 100));
    return {
      ...item,
      originalPrice: orig,
      salePrice: sale,
      discountPercent: discount,
      claimedPercent: 45 + ((idx * 11) % 50)
    };
  });

  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + 4);

  return {
    heroBanners: FALLBACK_HERO_BANNERS,
    sidePromoBanners: FALLBACK_SIDE_PROMOS,
    hotCategories: FALLBACK_HOT_CATEGORIES,
    flashSale: {
      title: 'Flash Sale',
      endsAt: targetDate.toISOString(),
      items: flashSaleItems
    },
    newArrivals: (mockProducts || []).slice(6, 12).map((item) => ({ ...item, badge: 'New' })),
    recommended: (mockProducts || []).map((item, idx) => ({
      ...item,
      sellerBadge: idx % 3 === 0 ? 'Official Store' : 'Fulfilled by Clinique',
      verifiedSeller: true
    }))
  };
}
