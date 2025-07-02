// Debug helper for seller products issue
export const debugSellerProducts = () => {
  console.log('=== SELLER PRODUCTS DEBUG ===');
  console.log('Current URL:', window.location.href);
  console.log('API Base URL:', import.meta.env.VITE_API_URL);
  console.log('Supabase Functions URL:', import.meta.env.VITE_SUPABASE_FUNCTIONS_URL);
  console.log('Environment variables:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SUPABASE_FUNCTIONS_URL: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...'
  });
  
  // Test basic fetch to the API
  const testApiConnection = async () => {
    try {
      console.log('Testing basic API connection...');
      const response = await fetch(import.meta.env.VITE_API_URL || 'https://zdbfjwienzjdjpawcnuc.supabase.co/functions/v1/api', {
        method: 'OPTIONS',
        mode: 'cors'
      });
      console.log('OPTIONS request response:', response.status);
    } catch (error) {
      console.error('OPTIONS request failed:', error);
    }
  };
  
  testApiConnection();
  console.log('=== END DEBUG ===');
};

// Mock products for fallback
export const getMockSellerProducts = () => [
  {
    id: 'mock-1',
    name: 'Mock Product 1',
    category: 'Skincare',
    subcategory: 'Moisturizer',
    price: 29.99,
    stock: 100,
    status: 'Active',
    approval_status: 'approved',
    featured: false,
    image: '/api/placeholder/200/200',
    sku: 'MOCK-001',
    created_at: new Date().toISOString(),
    rating: 4.5,
    reviews_count: 10,
    description: 'This is a mock product for testing',
    brand: 'Test Brand',
    tags: ['mock', 'test']
  },
  {
    id: 'mock-2',
    name: 'Mock Product 2',
    category: 'Makeup',
    subcategory: 'Foundation',
    price: 39.99,
    stock: 50,
    status: 'Active',
    approval_status: 'pending',
    featured: true,
    image: '/api/placeholder/200/200',
    sku: 'MOCK-002',
    created_at: new Date().toISOString(),
    rating: 4.0,
    reviews_count: 5,
    description: 'Another mock product for testing',
    brand: 'Test Brand',
    tags: ['mock', 'test', 'featured']
  }
];
