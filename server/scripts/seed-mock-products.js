import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock products data from Products.jsx
const mockProducts = [
  {
    name: 'Vitamin C Brightening Serum',
    category: 'Skincare',
    subcategory: 'Serums',
    price: 45.99,
    stock: 25,
    status: 'active',
    approval_status: 'approved',
    featured: true,
    image: '/api/placeholder/200/200',
    sku: 'VCS-001',
    brand: 'Clinique Beauty',
    description: 'A powerful vitamin C serum that brightens and evens skin tone while providing antioxidant protection.',
    rating: 4.8,
    reviews_count: 23,
    tags: ['vitamin-c', 'brightening', 'antioxidant', 'serum'],
    availability: 'in stock',
    meta_title: 'Vitamin C Brightening Serum - Clinique Beauty',
    meta_description: 'Transform your skin with our powerful Vitamin C serum for brighter, more even-toned skin.',
    meta_keywords: ['vitamin c', 'brightening', 'serum', 'skincare', 'antioxidant']
  },
  {
    name: 'Hydrating Face Cream',
    category: 'Skincare',
    subcategory: 'Moisturizers',
    price: 35.99,
    stock: 15,
    status: 'active',
    approval_status: 'approved',
    featured: false,
    image: '/api/placeholder/200/200',
    sku: 'HFC-002',
    brand: 'Clinique Beauty',
    description: 'Rich, nourishing face cream that provides long-lasting hydration for all skin types.',
    rating: 4.6,
    reviews_count: 18,
    tags: ['hydrating', 'moisturizer', 'face-cream', 'dry-skin'],
    availability: 'in stock',
    meta_title: 'Hydrating Face Cream - Deep Moisture - Clinique Beauty',
    meta_description: 'Intensive hydrating face cream for smooth, supple skin. Perfect for dry and sensitive skin.',
    meta_keywords: ['face cream', 'hydrating', 'moisturizer', 'dry skin', 'skincare']
  },
  {
    name: 'Gentle Cleansing Oil',
    category: 'Skincare',
    subcategory: 'Cleansers',
    price: 28.99,
    stock: 32,
    status: 'active',
    approval_status: 'pending',
    featured: false,
    image: '/api/placeholder/200/200',
    sku: 'GCO-003',
    brand: 'Clinique Beauty',
    description: 'Gentle yet effective cleansing oil that removes makeup and impurities without stripping the skin.',
    rating: 4.5,
    reviews_count: 15,
    tags: ['cleansing-oil', 'makeup-remover', 'gentle', 'cleansing'],
    availability: 'in stock',
    meta_title: 'Gentle Cleansing Oil - Makeup Remover - Clinique Beauty',
    meta_description: 'Effective yet gentle cleansing oil that melts away makeup and impurities for clean, soft skin.',
    meta_keywords: ['cleansing oil', 'makeup remover', 'gentle cleanser', 'skincare']
  },
  {
    name: 'SPF 50 Sunscreen Lotion',
    category: 'Skincare',
    subcategory: 'Sun Protection',
    price: 32.99,
    stock: 0,
    status: 'active',
    approval_status: 'approved',
    featured: false,
    image: '/api/placeholder/200/200',
    sku: 'SPF-004',
    brand: 'Clinique Beauty',
    description: 'Broad-spectrum SPF 50 sunscreen that provides superior protection against UVA and UVB rays.',
    rating: 4.7,
    reviews_count: 12,
    tags: ['sunscreen', 'spf-50', 'sun-protection', 'broad-spectrum'],
    availability: 'out of stock',
    meta_title: 'SPF 50 Sunscreen Lotion - Sun Protection - Clinique Beauty',
    meta_description: 'High-performance SPF 50 sunscreen lotion for daily sun protection and skin health.',
    meta_keywords: ['sunscreen', 'spf 50', 'sun protection', 'uv protection', 'skincare']
  },
  {
    name: 'Anti-Aging Night Cream',
    category: 'Skincare',
    subcategory: 'Anti-Aging',
    price: 65.99,
    stock: 18,
    status: 'active',
    approval_status: 'rejected',
    featured: false,
    image: '/api/placeholder/200/200',
    sku: 'ANC-005',
    brand: 'Clinique Beauty',
    description: 'Advanced night cream with retinol and peptides to reduce fine lines and improve skin texture.',
    rating: 4.3,
    reviews_count: 8,
    tags: ['anti-aging', 'night-cream', 'retinol', 'peptides'],
    availability: 'in stock',
    meta_title: 'Anti-Aging Night Cream with Retinol - Clinique Beauty',
    meta_description: 'Powerful anti-aging night cream with retinol and peptides for younger-looking skin.',
    meta_keywords: ['anti-aging', 'night cream', 'retinol', 'peptides', 'skincare']
  }
];

async function seedProducts() {
  try {
    console.log('Starting product seeding process...');

    // First, check if we have any sellers to associate products with
    const { data: sellers, error: sellersError } = await supabase
      .from('sellers')
      .select('id, business_name, status')
      .eq('status', 'approved')
      .limit(1);

    if (sellersError) {
      console.error('Error fetching sellers:', sellersError);
      return;
    }

    if (!sellers || sellers.length === 0) {
      console.log('No approved sellers found. Creating a default seller first...');
      
      // Create a default seller for the products
      const { data: newSeller, error: sellerCreateError } = await supabase
        .from('sellers')
        .insert({
          business_name: 'Clinique Beauty Official',
          contact_name: 'Clinique Team',
          email: 'official@cliniquebeauty.com',
          phone: '+1-800-CLINIQUE',
          location: JSON.stringify({
            address: '123 Beauty Street',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
          }),
          status: 'approved',
          verification_date: new Date().toISOString(),
          product_categories: ['Skincare', 'Makeup', 'Fragrance'],
          rating: 4.8,
          sales_count: 0,
          clerk_id: 'user_default_seller_clinique'
        })
        .select()
        .single();

      if (sellerCreateError) {
        console.error('Error creating default seller:', sellerCreateError);
        return;
      }

      console.log('Created default seller:', newSeller.business_name);
      sellers[0] = newSeller;
    }

    const sellerId = sellers[0].id;
    console.log(`Using seller: ${sellers[0].business_name} (${sellerId})`);

    // Check if products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('sku')
      .in('sku', mockProducts.map(p => p.sku));

    const existingSKUs = existingProducts?.map(p => p.sku) || [];
    const productsToInsert = mockProducts.filter(p => !existingSKUs.includes(p.sku));

    if (productsToInsert.length === 0) {
      console.log('All mock products already exist in the database.');
      return;
    }

    console.log(`Inserting ${productsToInsert.length} new products...`);

    // Prepare products for insertion
    const productsData = productsToInsert.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      sku: product.sku,
      status: product.status,
      approval_status: product.approval_status,
      featured: product.featured,
      stock: product.stock,
      rating: product.rating,
      reviews_count: product.reviews_count,
      tags: product.tags,
      availability: product.availability,
      image: product.image,
      images: [product.image], // Add to images array as well
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      meta_keywords: product.meta_keywords,
      seller_id: sellerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert products
    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .insert(productsData)
      .select();

    if (insertError) {
      console.error('Error inserting products:', insertError);
      return;
    }

    console.log(`Successfully inserted ${insertedProducts.length} products:`);
    insertedProducts.forEach(product => {
      console.log(`- ${product.name} (${product.sku}) - ${product.approval_status}`);
    });

    console.log('\nProduct seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Seller: ${sellers[0].business_name}`);
    console.log(`- Products inserted: ${insertedProducts.length}`);
    console.log(`- Approved products: ${insertedProducts.filter(p => p.approval_status === 'approved').length}`);
    console.log(`- Pending products: ${insertedProducts.filter(p => p.approval_status === 'pending').length}`);
    console.log(`- Rejected products: ${insertedProducts.filter(p => p.approval_status === 'rejected').length}`);

  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

// Run the seeding if this file is executed directly
seedProducts().then(() => {
  console.log('Seeding process finished.');
  process.exit(0);
}).catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});

export { seedProducts };
