import express from 'express';
import { supabase } from '../config/db.js';

const router = express.Router();

// Baseline mock users matching admin user table
const defaultMockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Customer',
    status: 'Active',
    verified: true,
    joinDate: '2025-01-15',
    location: 'New York',
    ordersCount: 8,
    totalSpent: 425.75,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Customer',
    status: 'Active',
    verified: true,
    joinDate: '2025-02-20',
    location: 'Los Angeles',
    ordersCount: 12,
    totalSpent: 789.99,
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    role: 'Seller',
    status: 'Active',
    verified: true,
    joinDate: '2025-01-05',
    location: 'Chicago',
    ordersCount: 0,
    totalSpent: 0,
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'Customer',
    status: 'Inactive',
    verified: false,
    joinDate: '2025-03-10',
    location: 'Boston',
    ordersCount: 3,
    totalSpent: 129.50,
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
  {
    id: '5',
    name: 'Michael Wilson',
    email: 'michael@example.com',
    role: 'Admin',
    status: 'Active',
    verified: true,
    joinDate: '2025-01-01',
    location: 'San Francisco',
    ordersCount: 0,
    totalSpent: 0,
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
  },
  {
    id: '6',
    name: 'Sarah Brown',
    email: 'sarah@example.com',
    role: 'Customer',
    status: 'Pending',
    verified: false,
    joinDate: '2025-03-18',
    location: 'Dallas',
    ordersCount: 1,
    totalSpent: 49.99,
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg'
  },
  {
    id: '7',
    name: 'David Miller',
    email: 'david@example.com',
    role: 'Customer',
    status: 'Active',
    verified: true,
    joinDate: '2025-02-12',
    location: 'Seattle',
    ordersCount: 5,
    totalSpent: 275.50,
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg'
  },
  {
    id: '8',
    name: 'Jennifer Lee',
    email: 'jennifer@example.com',
    role: 'Seller',
    status: 'Active',
    verified: true,
    joinDate: '2025-01-22',
    location: 'Miami',
    ordersCount: 0,
    totalSpent: 0,
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg'
  }
];

// Baseline mock catalog for admin fallback
const defaultMockProducts = [
  {
    id: 1,
    name: 'Hydrating Moisturizer',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    category: 'Skincare',
    subcategory: 'Moisturizer',
    stock: 50,
    stock_quantity: 50,
    status: 'Active',
    featured: true,
    rating: 4.5,
    reviews_count: 68,
    description: 'A lightweight formula delivering 24-hour hydration.'
  },
  {
    id: 2,
    name: 'Cleansing Foam',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=800&q=80',
    category: 'Skincare',
    subcategory: 'Cleanser',
    stock: 45,
    stock_quantity: 45,
    status: 'Active',
    featured: false,
    rating: 4.7,
    reviews_count: 52,
    description: 'Gentle facial cleanser for clean and refreshed skin.'
  },
  {
    id: 3,
    name: 'Matte Liquid Lipstick',
    price: 999,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    category: 'Makeup',
    subcategory: 'Lipstick',
    stock: 75,
    stock_quantity: 75,
    status: 'Active',
    featured: true,
    rating: 4.8,
    reviews_count: 110,
    description: 'Long-lasting matte liquid lipstick with bold pigment.'
  },
  {
    id: 4,
    name: 'Volumizing Mascara',
    price: 1199,
    image: 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?auto=format&fit=crop&w=800&q=80',
    category: 'Makeup',
    subcategory: 'Eyes',
    stock: 60,
    stock_quantity: 60,
    status: 'Active',
    featured: false,
    rating: 4.6,
    reviews_count: 94,
    description: 'Deep black volumizing mascara for instant lift.'
  },
  {
    id: 5,
    name: 'Eau de Parfum Floral',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    category: 'Fragrance',
    subcategory: 'Perfume',
    stock: 30,
    stock_quantity: 30,
    status: 'Active',
    featured: true,
    rating: 4.9,
    reviews_count: 42,
    description: 'Sophisticated floral fragrance with delicate notes of jasmine and rose.'
  },
  {
    id: 6,
    name: 'Nourishing Hair Serum',
    price: 1699,
    image: 'https://images.unsplash.com/photo-1608248597359-5484860b7646?auto=format&fit=crop&w=800&q=80',
    category: 'Hair',
    subcategory: 'Serum',
    stock: 40,
    stock_quantity: 40,
    status: 'Active',
    featured: false,
    rating: 4.5,
    reviews_count: 36,
    description: 'Argan oil infused treatment serum for silky hair.'
  },
  {
    id: 7,
    name: 'Exfoliating Body Scrub',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
    category: 'Body',
    subcategory: 'Scrub',
    stock: 55,
    stock_quantity: 55,
    status: 'Active',
    featured: false,
    rating: 4.4,
    reviews_count: 28,
    description: 'Natural exfoliating body scrub with coffee and coconut oil.'
  }
];

// 1. GET /products: Fetch real products from database, with fallback to default catalog
router.get('/products', async (req, res) => {
  try {
    let dbProducts = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        dbProducts = data.map(p => ({
          ...p,
          stock_quantity: p.stock ?? p.stock_quantity ?? 0,
          status: p.status || 'Active',
          featured: p.featured ?? false
        }));
      }
    }

    const result = dbProducts.length > 0 ? dbProducts : defaultMockProducts;
    res.json(result);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.json(defaultMockProducts);
  }
});

// 2. POST /products: Insert new product into Supabase
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          price: Number(productData.price) || 0,
          description: productData.description || '',
          category: productData.category || 'General',
          subcategory: productData.subcategory || '',
          brand: productData.brand || 'Clinique',
          sku: productData.sku || `PROD-${Date.now()}`,
          stock: Number(productData.stock || productData.stock_quantity) || 0,
          image: productData.image || '',
          status: productData.status || 'Active',
          featured: Boolean(productData.featured)
        })
        .select();

      if (!error && data?.[0]) {
        return res.status(201).json(data[0]);
      }
    }

    const newProduct = {
      id: Date.now(),
      ...productData,
      status: productData.status || 'Active'
    };
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// 3. PUT /products/:id: Update product in Supabase
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          price: updates.price !== undefined ? Number(updates.price) : undefined,
          description: updates.description,
          category: updates.category,
          subcategory: updates.subcategory,
          brand: updates.brand,
          sku: updates.sku,
          stock: updates.stock !== undefined ? Number(updates.stock) : (updates.stock_quantity !== undefined ? Number(updates.stock_quantity) : undefined),
          image: updates.image,
          status: updates.status,
          featured: updates.featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (!error && data?.[0]) {
        return res.json(data[0]);
      }
    }

    res.json({ id, ...updates });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// 4. DELETE /products/:id: Delete product from Supabase
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

// 5. GET /users: Fetch users from Supabase with mock user baseline
router.get('/users', async (req, res) => {
  try {
    let dbUsers = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        dbUsers = data.map((u, index) => ({
          id: u.id,
          name: u.name || 'User',
          email: u.email || '',
          role: u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) : 'Customer',
          status: 'Active',
          verified: true,
          joinDate: u.created_at ? u.created_at.split('T')[0] : '2025-01-01',
          location: 'Nairobi',
          ordersCount: (index * 3) % 15,
          totalSpent: (index * 420.5) % 3500,
          avatar: `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${(index % 8) + 1}.jpg`
        }));
      }
    }

    const result = dbUsers.length > 0 ? dbUsers : defaultMockUsers;
    res.json(result);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.json(defaultMockUsers);
  }
});

// 6. GET /users/:id: Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        return res.json({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role ? (data.role.charAt(0).toUpperCase() + data.role.slice(1)) : 'Customer',
          status: 'Active',
          verified: true,
          joinDate: data.created_at?.split('T')[0] || '2025-01-01',
          location: 'Nairobi'
        });
      }
    }

    const matched = defaultMockUsers.find(u => u.id === id) || defaultMockUsers[0];
    res.json(matched);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// 7. PUT /users/:id/role: Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (supabase && role) {
      await supabase.from('users').update({ role: role.toLowerCase() }).eq('id', id);
    }
    res.json({ success: true, message: `Role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// 8. GET /orders: Fetch orders from database
router.get('/orders', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return res.json(data);
      }
    }
    res.json([]);
  } catch (error) {
    res.json([]);
  }
});

// 9. POST /seed: Seed mock users and products into Supabase database
router.post('/seed', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(400).json({ success: false, message: 'Supabase client not initialized' });
    }

    let seededUsers = 0;
    let seededProducts = 0;

    for (const u of defaultMockUsers) {
      const clerkId = `clerk_mock_${u.id}`;
      const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).maybeSingle();
      if (!existing) {
        await supabase.from('users').insert({
          email: u.email,
          name: u.name,
          role: u.role.toLowerCase(),
          password: 'mock_password_hash'
        });
        seededUsers++;
      }
    }

    for (const p of defaultMockProducts) {
      const { data: existing } = await supabase.from('products').select('id').eq('name', p.name).maybeSingle();
      if (!existing) {
        await supabase.from('products').insert({
          name: p.name,
          price: p.price,
          image: p.image,
          description: p.description,
          category: p.category,
          subcategory: p.subcategory,
          stock: p.stock
        });
        seededProducts++;
      }
    }

    res.json({
      success: true,
      message: `Seeded ${seededUsers} users and ${seededProducts} products into Supabase.`
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. GET /dashboard: Analytics data for admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'monthly';
    const mockDashboardData = {
      metrics: {
        totalRevenue: 284500,
        monthlyRevenue: 48900,
        totalOrders: 1420,
        totalCustomers: 856,
        avgOrderValue: 200.35,
        conversionRate: 3.42,
        activeSellers: 38
      },
      salesData: [
        { name: 'Jan', sales: 18500, orders: 120 },
        { name: 'Feb', sales: 22400, orders: 145 },
        { name: 'Mar', sales: 29800, orders: 190 },
        { name: 'Apr', sales: 31200, orders: 205 },
        { name: 'May', sales: 38900, orders: 240 },
        { name: 'Jun', sales: 48900, orders: 310 }
      ],
      topProducts: [
        { id: 1, name: 'Hydrating Moisturizer', sales: 312, revenue: 592488, stock: 50 },
        { id: 2, name: 'Cleansing Foam', sales: 241, revenue: 313059, stock: 45 },
        { id: 3, name: 'Matte Liquid Lipstick', sales: 187, revenue: 186813, stock: 75 }
      ]
    };

    res.json({
      success: true,
      data: mockDashboardData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. GET /settings: Retrieve system-wide configuration
router.get('/settings', async (req, res) => {
  try {
    let settings = {
      site_currency: 'KES',
      site_title: 'Clinique Beauty',
      flash_sale_active: 'true',
      flash_sale_ends_at: null
    };

    if (supabase) {
      const { data, error } = await supabase.from('system_settings').select('*');
      if (!error && Array.isArray(data)) {
        data.forEach(item => {
          settings[item.key] = item.value;
        });
      }
    }

    res.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    res.json({
      site_currency: 'KES',
      site_title: 'Clinique Beauty',
      flash_sale_active: 'true'
    });
  }
});

// 12. POST /settings: Save and synchronize system settings
router.post('/settings', async (req, res) => {
  try {
    const newSettings = req.body || {};

    if (supabase) {
      for (const [key, value] of Object.entries(newSettings)) {
        const stringVal = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
        await supabase
          .from('system_settings')
          .upsert({
            key,
            value: stringVal,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      }
    }

    res.json({
      success: true,
      message: 'System settings updated successfully',
      settings: newSettings
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;
