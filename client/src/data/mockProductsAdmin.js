/**
 * Mock products data for admin product management
 * Contains extended fields for admin purposes
 */

export const categories = [
  { id: 1, name: 'Skincare', slug: 'skincare', productCount: 45 },
  { id: 2, name: 'Makeup', slug: 'makeup', productCount: 32 },
  { id: 3, name: 'Fragrance', slug: 'fragrance', productCount: 18 },
  { id: 4, name: 'Hair', slug: 'hair', productCount: 24 },
  { id: 5, name: 'Body', slug: 'body', productCount: 15 }
];

export const tags = [
  { id: 1, name: 'New Arrival', slug: 'new-arrival', productCount: 12 },
  { id: 2, name: 'Best Seller', slug: 'best-seller', productCount: 8 },
  { id: 3, name: 'Limited Edition', slug: 'limited-edition', productCount: 5 },
  { id: 4, name: 'Sale', slug: 'sale', productCount: 15 },
  { id: 5, name: 'Organic', slug: 'organic', productCount: 20 },
  { id: 6, name: 'Vegan', slug: 'vegan', productCount: 18 }
];

export const mockAdminProducts = [
  { 
    id: 1, 
    name: 'Moisturizing Cream', 
    slug: 'moisturizing-cream',
    category: 'Skincare',
    categoryId: 1,
    tags: ['Organic', 'Best Seller'],
    tagIds: [5, 2],
    price: 29.99,
    salePrice: null,
    stock: 45,
    sku: 'SK-MC-001',
    status: 'Active',
    visibility: 'Public',
    featured: true,
    approvalStatus: 'Approved',
    createdAt: '2025-01-15',
    updatedAt: '2025-06-20',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-5484860b7646?auto=format&fit=crop&w=800&q=80'
    ],
    seo: {
      title: 'Moisturizing Cream - Deep Hydration',
      description: 'Advanced moisturizing cream for deep hydration and skin nourishment.',
      keywords: 'moisturizer, hydration, skincare, cream'
    },
    attributes: {
      size: '50ml',
      ingredients: 'Water, Glycerin, Shea Butter, Vitamin E',
      directions: 'Apply to clean skin twice daily'
    }
  },
  { 
    id: 2, 
    name: 'Liquid Foundation', 
    slug: 'liquid-foundation',
    category: 'Makeup',
    categoryId: 2,
    tags: ['New Arrival'],
    tagIds: [1],
    price: 39.99,
    salePrice: 34.99,
    stock: 28,
    sku: 'MK-LF-002',
    status: 'Active',
    visibility: 'Public',
    featured: true,
    approvalStatus: 'Approved',
    createdAt: '2025-02-10',
    updatedAt: '2025-06-15',
    image: 'https://images.unsplash.com/photo-1631730486784-5456119f69ae?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    seo: {
      title: 'Liquid Foundation - Perfect Coverage',
      description: 'Silky smooth foundation for flawless all-day coverage.',
      keywords: 'foundation, makeup, coverage, liquid foundation'
    },
    attributes: {
      shades: '15 shades available',
      finish: 'Matte',
      coverage: 'Medium to Full'
    }
  },
  { 
    id: 3, 
    name: 'Citrus Perfume', 
    slug: 'citrus-perfume',
    category: 'Fragrance',
    categoryId: 3,
    tags: ['Limited Edition', 'Sale'],
    tagIds: [3, 4],
    price: 89.99,
    salePrice: 69.99,
    stock: 12,
    sku: 'FR-CP-003',
    status: 'Low Stock',
    visibility: 'Public',
    featured: false,
    approvalStatus: 'Approved',
    createdAt: '2025-03-05',
    updatedAt: '2025-05-18',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
    ],
    seo: {
      title: 'Citrus Perfume - Fresh & Vibrant',
      description: 'Refreshing citrus fragrance for a vibrant and energizing scent experience.',
      keywords: 'perfume, fragrance, citrus, fresh scent'
    },
    attributes: {
      volume: '50ml',
      notes: 'Top: Lemon, Middle: Orange blossom, Base: Amber',
      concentration: 'Eau de Parfum'
    }
  },
  { 
    id: 4, 
    name: 'Hair Repair Mask', 
    slug: 'hair-repair-mask',
    category: 'Hair',
    categoryId: 4,
    tags: ['Vegan', 'Organic'],
    tagIds: [6, 5],
    price: 24.99,
    salePrice: null,
    stock: 0,
    sku: 'HR-RM-004',
    status: 'Out of Stock',
    visibility: 'Public',
    featured: false,
    approvalStatus: 'Approved',
    createdAt: '2025-01-20',
    updatedAt: '2025-06-10',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&w=800&q=80'
    ],
    seo: {
      title: 'Hair Repair Mask - Intense Restoration',
      description: 'Deep conditioning hair mask for damaged and dry hair restoration.',
      keywords: 'hair mask, repair, conditioning, hair treatment'
    },
    attributes: {
      size: '250ml',
      ingredients: 'Argan Oil, Shea Butter, Keratin, Vitamins',
      hairType: 'All hair types, especially damaged'
    }
  },
  { 
    id: 5, 
    name: 'Cleansing Gel', 
    slug: 'cleansing-gel',
    category: 'Skincare',
    categoryId: 1,
    tags: ['Best Seller', 'Vegan'],
    tagIds: [2, 6],
    price: 19.99,
    salePrice: null,
    stock: 57,
    sku: 'SK-CG-005',
    status: 'Active',
    visibility: 'Public',
    featured: true,
    approvalStatus: 'Approved',
    createdAt: '2025-02-15',
    updatedAt: '2025-06-25',
    image: 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556228722-d0b503022e37?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'
    ],
    seo: {
      title: 'Cleansing Gel - Gentle Daily Cleanser',
      description: 'Gentle cleansing gel that removes impurities without stripping skin.',
      keywords: 'cleanser, face wash, skincare, cleansing gel'
    },
    attributes: {
      size: '200ml',
      skinType: 'All skin types',
      ingredients: 'Aloe Vera, Glycerin, Chamomile Extract'
    }
  },
  { 
    id: 6, 
    name: 'Exfoliating Scrub', 
    slug: 'exfoliating-scrub',
    category: 'Skincare',
    categoryId: 1,
    tags: ['New Arrival', 'Organic'],
    tagIds: [1, 5],
    price: 22.99,
    salePrice: null,
    stock: 38,
    sku: 'SK-ES-006',
    status: 'Active',
    visibility: 'Public',
    featured: false,
    approvalStatus: 'Pending',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1567928815116-24d1a37c9569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-5484860b7646?auto=format&fit=crop&w=800&q=80'
    ],
    seo: {
      title: 'Exfoliating Scrub - Refresh Your Skin',
      description: 'Gentle exfoliating scrub to remove dead skin cells and reveal radiant skin.',
      keywords: 'exfoliator, scrub, skincare, exfoliating'
    },
    attributes: {
      size: '100ml',
      ingredients: 'Jojoba Beads, Aloe Vera, Vitamin E',
      skinType: 'Normal to combination skin'
    }
  },
  { 
    id: 7, 
    name: 'Body Butter', 
    slug: 'body-butter',
    category: 'Body',
    categoryId: 5,
    tags: ['Vegan', 'Sale'],
    tagIds: [6, 4],
    price: 28.99,
    salePrice: 19.99,
    stock: 65,
    sku: 'BD-BB-007',
    status: 'Active',
    visibility: 'Hidden',
    featured: false,
    approvalStatus: 'Draft',
    createdAt: '2025-05-15',
    updatedAt: '2025-05-15',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556228724-4da94a73229b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    seo: {
      title: 'Body Butter - Rich Moisture',
      description: 'Rich and creamy body butter for intense moisturization.',
      keywords: 'body butter, moisturizer, body care, hydration'
    },
    attributes: {
      size: '200g',
      scent: 'Vanilla & Coconut',
      ingredients: 'Shea Butter, Cocoa Butter, Coconut Oil'
    }
  }
];

export const productStatuses = [
  'Active',
  'Low Stock',
  'Out of Stock',
  'Discontinued',
  'Coming Soon'
];

export const approvalStatuses = [
  'Approved',
  'Pending',
  'Rejected',
  'Draft'
];

export const visibilityOptions = [
  'Public',
  'Hidden',
  'Password Protected',
  'Scheduled'
];

export default mockAdminProducts;
