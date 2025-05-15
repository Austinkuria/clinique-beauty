import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug logging
console.log("Environment loaded, SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
console.log("Environment loaded, SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

import express from 'express';
import axios from 'axios';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB, { supabase } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mpesaRoutes from './routes/mpesaRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { clerkMiddleware } from './middleware/clerkMiddleware.js';
import { corsMiddleware } from './middleware/corsMiddleware.js';
import { handleChatMessage } from './services/chatbotService.js';

// Connect to Supabase
connectDB();

// Make supabase client available globally
global.supabase = supabase;

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://clinique-beauty.vercel.app', 'https://www.clinique-beauty.com'] 
      : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle chat messages
  socket.on('chat_message', async (message) => {
    try {
      // Process the message through our chatbot service
      const response = await handleChatMessage(message, socket.id);
      
      // Send response back to the specific client
      socket.emit('chat_response', response);
      
      // Log the interaction for analytics
      console.log(`Chat interaction - User: ${message.text} | Bot: ${response.text}`);
    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('chat_error', { error: 'Failed to process your message' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing_start', () => {
    socket.emit('bot_typing', true);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Use our custom CORS middleware instead of the cors package
app.use(corsMiddleware);

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ngrok status check
const checkNgrokStatus = async () => {
  const ports = [4040, 4041];
  for (const port of ports) {
    try {
      console.log(`Checking ngrok on port ${port}...`);
      const response = await axios.get(`http://localhost:${port}/api/tunnels`, { timeout: 2000 });
      if (response.data.tunnels.length > 0) {
        const tunnel = response.data.tunnels[0];
        console.log(`ngrok tunnel found on port ${port}: ${tunnel.public_url}`);
        return { online: true, url: tunnel.public_url };
      }
    } catch (error) {
      console.error(`ngrok check failed on port ${port}:`, error.message);
    }
  }
  console.error('No active ngrok tunnels found');
  return { online: false, message: 'Ngrok tunnel is offline. Please run: npm run ngrok' };
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const ngrokStatus = await checkNgrokStatus();
  res.json({
    status: 'ok',
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    ngrok: {
      online: ngrokStatus.online,
      message: ngrokStatus.message || 'Ngrok tunnel is online',
      domain: process.env.NGROK_STATIC_DOMAIN || 'deer-equal-blowfish.ngrok-free.app',
      url: ngrokStatus.url
    }
  });
});

// Add a root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Clinique Beauty API Server',
    version: '1.0.0',
    status: 'online',
    documentation: '/api/docs',
    endpoints: [
      '/api/products',
      '/api/cart',
      '/api/orders',
      '/api/search',
      '/api/users',
      '/api/mpesa'
    ]
  });
});

// M-Pesa callback endpoint
app.post('/api/mpesa/callback', async (req, res) => {
  const ngrokStatus = await checkNgrokStatus();
  if (!ngrokStatus.online) {
    return res.status(503).json({
      error: 'ERR_NGROK_OFFLINE',
      message: 'The ngrok tunnel is currently offline.',
      resolution: 'Please start the ngrok tunnel.'
    });
  }
  console.log('M-Pesa callback:', req.body);
  res.json({ ResultCode: 0, ResultDesc: 'Received' });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', clerkMiddleware, cartRoutes);
app.use('/api/orders', clerkMiddleware, orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', clerkMiddleware, userRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Add a documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    mpesaEndpoints: {
      '/api/mpesa/token': 'GET - Get M-Pesa OAuth token',
      '/api/mpesa/stkpush': 'POST - Initiate STK Push payment',
      '/api/mpesa/payment': 'POST - Process M-Pesa payment (alternative route)',
      '/api/mpesa/callback': 'POST - M-Pesa transaction callback',
      '/api/mpesa/query': 'POST - Query STK Push status',
      '/api/mpesa/health': 'GET - Check M-Pesa configuration'
    },
    adminEndpoints: {
      '/api/admin/dashboard': 'GET - Get admin dashboard analytics',
      '/api/admin/users': 'GET - Get users list with filtering options',
      '/api/admin/users/:id': 'GET - Get user details',
      '/api/admin/users/:id/role': 'PUT - Update user role',
      '/api/admin/products': 'GET - Get products list, POST - Create product',
      '/api/admin/products/:id': 'GET, PUT, DELETE - Get, update or delete product',
      '/api/admin/orders': 'GET - Get orders list with filtering options',
      '/api/admin/orders/:id': 'GET - Get order details',
      '/api/admin/orders/:id/status': 'PUT - Update order status',
      '/api/admin/analytics': 'GET - Get sales and performance analytics'
    },
    userEndpoints: {
      '/api/users/verify-admin-code': 'POST - Verify admin code',
      '/api/users/set-admin': 'POST - Set user as admin',
      '/api/users/sync': 'POST - Sync user data with Clerk'
    },
    chatbotEndpoints: {
      '/api/chatbot/train': 'POST - Add training data to the chatbot',
      '/api/chatbot/feedback': 'POST - Submit feedback about chatbot responses',
      '/api/chatbot/history': 'GET - Get chat history for a specific user',
      '/api/chatbot/analytics': 'GET - Get chatbot usage analytics'
    }
  });
});

// Add this endpoint for admin verification with better error handling
app.post('/api/users/verify-admin-code', async (req, res) => {
  try {
    const { code } = req.body;
    
    console.log("Admin code verification request received:", { codeProvided: !!code });
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Admin code is required'
      });
    }
    
    // Valid codes - in a real app, this would query the database
    const validCodes = [
      'admin123',
      'clinique-beauty-admin-2023',
      'clinique-admin-2023'
    ];
    
    if (!validCodes.includes(code)) {
      console.log("Invalid admin code provided:", code);
      return res.status(403).json({
        success: false,
        message: 'Invalid admin code'
      });
    }
    
    console.log("Valid admin code verified");
    return res.json({
      success: true,
      message: 'Admin code verified successfully'
    });
  } catch (err) {
    console.error('Error verifying admin code:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error when verifying admin code'
    });
  }
});

// Add this endpoint to set a user as admin with better logging
app.post('/api/users/set-admin', async (req, res) => {
  try {
    const { clerkId } = req.body;
    
    console.log("Admin role update request received:", { clerkId });
    
    if (!clerkId) {
      return res.status(400).json({
        success: false,
        message: 'Clerk ID is required'
      });
    }
    
    // In a real app, this would update the database
    // For development, just respond with success
    console.log(`Setting user ${clerkId} as admin`);
    
    return res.json({
      success: true,
      message: 'Admin role granted successfully',
      user: {
        id: 'dev-user-id',
        clerk_id: clerkId,
        role: 'admin',
        updated: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error setting admin role:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error when setting admin role'
    });
  }
});

// Add this endpoint for dashboard analytics
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    // Get time range from query params (default to 'weekly')
    const timeRange = req.query.timeRange || 'weekly';
    
    // In a production environment, this would fetch data from your database
    // For now, we'll use the same mock data structure as the client
    
    // Create more realistic daily data with some variance
    const generateDailyData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const baseRevenue = 1500;
      return days.map(day => {
        // Add some randomness for more realistic data
        const variance = Math.floor(Math.random() * 800) - 400; // Random value between -400 and 400
        const revenue = Math.max(baseRevenue + variance, 800);
        const transactions = Math.floor(Math.random() * 50) + 30;
        return { 
          day,
          revenue,
          transactions,
          avgOrderValue: +(revenue / transactions).toFixed(2)
        };
      });
    };
    
    // Create more realistic weekly data with trend
    const generateWeeklyData = () => {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      let baseRevenue = 8000;
      return weeks.map(week => {
        const variance = Math.floor(Math.random() * 1200) - 400;
        const revenue = baseRevenue + variance;
        const transactions = Math.floor(revenue / 75);
        baseRevenue += 800; // Upward trend
        return {
          week,
          revenue,
          transactions,
          avgOrderValue: +(revenue / transactions).toFixed(2)
        };
      });
    };
    
    // Mock data for development - in production this would come from the database
    const mockDashboardData = {
      stats: {
        revenue: { total: 156789.99, growth: 12.5 },
        orders: { total: 1256, growth: 8.2 },
        users: { total: 3254, growth: 5.1 },
        products: { total: 527, growth: -2.3 },
        fulfillmentRate: { value: 94.7, growth: 3.8 }
      },
      
      // Regenerate the data each time to simulate dynamic data
      revenueCharts: {
        daily: generateDailyData(),
        weekly: generateWeeklyData(),
        monthly: [
          { month: 'Jan', revenue: 12000, transactions: 168, avgOrderValue: 71.43 },
          { month: 'Feb', revenue: 15000, transactions: 205, avgOrderValue: 73.17 },
          { month: 'Mar', revenue: 18000, transactions: 243, avgOrderValue: 74.07 },
          { month: 'Apr', revenue: 16000, transactions: 213, avgOrderValue: 75.12 },
          { month: 'May', revenue: 21000, transactions: 275, avgOrderValue: 76.36 },
          { month: 'Jun', revenue: 19000, transactions: 244, avgOrderValue: 77.87 },
          { month: 'Jul', revenue: 22000, transactions: 278, avgOrderValue: 79.14 },
          { month: 'Aug', revenue: 20500, transactions: 256, avgOrderValue: 80.08 },
          { month: 'Sep', revenue: 23000, transactions: 283, avgOrderValue: 81.27 },
          { month: 'Oct', revenue: 21800, transactions: 265, avgOrderValue: 82.26 },
          { month: 'Nov', revenue: 24000, transactions: 290, avgOrderValue: 82.76 },
          { month: 'Dec', revenue: 28000, transactions: 335, avgOrderValue: 83.58 }
        ],
        yearly: [
          { year: '2019', revenue: 120000, growth: null },
          { year: '2020', revenue: 150000, growth: 25.0 },
          { year: '2021', revenue: 180000, growth: 20.0 },
          { year: '2022', revenue: 210000, growth: 16.7 },
          { year: '2023', revenue: 250000, growth: 19.0 }
        ]
      },
      
      // User growth data with acquisition channels
      userGrowth: [
        { month: 'Jan', users: 2800, newUsers: 120, organic: 72, paid: 48 },
        { month: 'Feb', users: 2900, newUsers: 135, organic: 81, paid: 54 },
        { month: 'Mar', users: 3000, newUsers: 148, organic: 86, paid: 62 },
        { month: 'Apr', users: 3050, newUsers: 102, organic: 63, paid: 39 },
        { month: 'May', users: 3150, newUsers: 156, organic: 92, paid: 64 },
        { month: 'Jun', users: 3200, newUsers: 128, organic: 77, paid: 51 },
        { month: 'Jul', users: 3254, newUsers: 143, organic: 85, paid: 58 }
      ],
      
      // Product category data with profit margins
      categoryData: [
        { name: 'Skincare', value: 400, growth: 15.2, margin: 42 },
        { name: 'Makeup', value: 300, growth: 8.7, margin: 38 },
        { name: 'Fragrance', value: 200, growth: 5.3, margin: 45 },
        { name: 'Hair', value: 100, growth: -2.1, margin: 36 },
        { name: 'Body', value: 85, growth: 3.8, margin: 40 },
        { name: 'Tools', value: 65, growth: 12.5, margin: 48 }
      ],
      
      // Top performing products with added metrics
      topProducts: [
        { id: 1, name: 'Anti-Aging Serum', sales: 253, revenue: 15180, growth: 12.3, avgRating: 4.8, stock: 142 },
        { id: 2, name: 'Facial Moisturizer', sales: 241, revenue: 12050, growth: 8.7, avgRating: 4.7, stock: 215 },
        { id: 3, name: 'Vitamin C Cleanser', sales: 187, revenue: 8415, growth: 15.2, avgRating: 4.9, stock: 93 },
        { id: 4, name: 'Eye Cream', sales: 156, revenue: 7800, growth: 6.8, avgRating: 4.6, stock: 128 },
        { id: 5, name: 'SPF 50 Sunscreen', sales: 142, revenue: 6390, growth: 4.2, avgRating: 4.5, stock: 176 },
        { id: 6, name: 'Hydrating Toner', sales: 138, revenue: 5520, growth: 7.5, avgRating: 4.4, stock: 152 },
        { id: 7, name: 'Lip Treatment', sales: 125, revenue: 3750, growth: 9.8, avgRating: 4.7, stock: 204 }
      ],
      
      // Enhanced geographical sales data with more countries and metrics
      geographicalData: [
        { country: 'USA', sales: 1250, revenue: 87500, growth: 8.5, avgOrderValue: 70 },
        { country: 'Canada', sales: 520, revenue: 36400, growth: 6.2, avgOrderValue: 70 },
        { country: 'UK', sales: 480, revenue: 33600, growth: 7.8, avgOrderValue: 70 },
        { country: 'Australia', sales: 320, revenue: 22400, growth: 5.4, avgOrderValue: 70 },
        { country: 'Germany', sales: 290, revenue: 20300, growth: 9.2, avgOrderValue: 70 },
        { country: 'France', sales: 275, revenue: 19250, growth: 4.7, avgOrderValue: 70 },
        { country: 'Japan', sales: 260, revenue: 18200, growth: 3.9, avgOrderValue: 70 },
        { country: 'South Korea', sales: 230, revenue: 16100, growth: 11.3, avgOrderValue: 70 },
        { country: 'Brazil', sales: 180, revenue: 12600, growth: 15.8, avgOrderValue: 70 },
        { country: 'Mexico', sales: 175, revenue: 12250, growth: 12.2, avgOrderValue: 70 },
        { country: 'Italy', sales: 165, revenue: 11550, growth: 6.8, avgOrderValue: 70 },
        { country: 'Spain', sales: 152, revenue: 10640, growth: 5.3, avgOrderValue: 70 },
        { country: 'Netherlands', sales: 135, revenue: 9450, growth: 7.9, avgOrderValue: 70 },
        { country: 'Sweden', sales: 128, revenue: 8960, growth: 8.4, avgOrderValue: 70 },
        { country: 'Singapore', sales: 115, revenue: 8050, growth: 9.7, avgOrderValue: 70 },
        { country: 'UAE', sales: 108, revenue: 7560, growth: 13.5, avgOrderValue: 70 },
        { country: 'India', sales: 95, revenue: 6650, growth: 17.2, avgOrderValue: 70 },
        { country: 'South Africa', sales: 85, revenue: 5950, growth: 10.8, avgOrderValue: 70 },
        { country: 'New Zealand', sales: 78, revenue: 5460, growth: 6.5, avgOrderValue: 70 },
        { country: 'Argentina', sales: 65, revenue: 4550, growth: 8.9, avgOrderValue: 70 }
      ],
      
      // Order fulfillment data with more detailed metrics
      fulfillmentData: {
        rates: [
          { month: 'Jan', rate: 91.2, onTime: 87.5, returned: 3.2 },
          { month: 'Feb', rate: 92.4, onTime: 88.7, returned: 2.8 },
          { month: 'Mar', rate: 93.1, onTime: 90.2, returned: 2.5 },
          { month: 'Apr', rate: 92.8, onTime: 89.6, returned: 2.7 },
          { month: 'May', rate: 93.7, onTime: 91.3, returned: 2.1 },
          { month: 'Jun', rate: 94.2, onTime: 92.5, returned: 1.9 },
          { month: 'Jul', rate: 94.7, onTime: 93.1, returned: 1.8 }
        ],
        statuses: [
          { status: 'Delivered', count: 892, percentage: 71 },
          { status: 'Shipped', count: 230, percentage: 18.3 },
          { status: 'Processing', count: 104, percentage: 8.3 },
          { status: 'Cancelled', count: 30, percentage: 2.4 }
        ],
        shippingMethods: [
          { method: 'Standard', count: 723, percentage: 57.6 },
          { method: 'Express', count: 352, percentage: 28.0 },
          { method: 'Next Day', count: 181, percentage: 14.4 }
        ]
      },
      
      // Revenue projections with more realistic confidence intervals
      revenueProjections: [
        { month: 'Aug', projected: 24000, actual: 23850, upperBound: 25200, lowerBound: 22800 },
        { month: 'Sep', projected: 25500, actual: null, upperBound: 26700, lowerBound: 24300 },
        { month: 'Oct', projected: 26800, actual: null, upperBound: 28200, lowerBound: 25400 },
        { month: 'Nov', projected: 29000, actual: null, upperBound: 30600, lowerBound: 27500 },
        { month: 'Dec', projected: 32500, actual: null, upperBound: 34500, lowerBound: 30500 },
        { month: 'Jan', projected: 26000, actual: null, upperBound: 27800, lowerBound: 24300 }
      ],
      
      // Recent orders with more details
      recentOrders: [
        { id: 'ORD-1001', customer: 'Emma Watson', total: 89.99, status: 'Completed', date: '2023-09-15', items: 3, paymentMethod: 'Credit Card' },
        { id: 'ORD-1002', customer: 'John Doe', total: 124.50, status: 'Processing', date: '2023-09-14', items: 4, paymentMethod: 'PayPal' },
        { id: 'ORD-1003', customer: 'Alice Smith', total: 76.25, status: 'Shipped', date: '2023-09-14', items: 2, paymentMethod: 'Credit Card' },
        { id: 'ORD-1004', customer: 'Robert Brown', total: 212.99, status: 'Processing', date: '2023-09-13', items: 6, paymentMethod: 'Credit Card' },
        { id: 'ORD-1005', customer: 'Jane Cooper', total: 45.00, status: 'Completed', date: '2023-09-12', items: 1, paymentMethod: 'M-Pesa' },
        { id: 'ORD-1006', customer: 'Michael Johnson', total: 156.75, status: 'Shipped', date: '2023-09-12', items: 3, paymentMethod: 'Credit Card' },
        { id: 'ORD-1007', customer: 'Sarah Williams', total: 97.50, status: 'Completed', date: '2023-09-11', items: 2, paymentMethod: 'PayPal' },
        { id: 'ORD-1008', customer: 'David Miller', total: 189.25, status: 'Delivered', date: '2023-09-10', items: 5, paymentMethod: 'Credit Card' }
      ]
    };
    
    // For a real application, you would query your database here instead of using mock data
    
    return res.json({
      success: true,
      data: mockDashboardData
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error when fetching dashboard data'
    });
  }
});

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 M-Pesa callback URL: ${process.env.MPESA_CALLBACK_URL || 'Not configured'}`);
  console.log(`💬 Chatbot service initialized and ready`);
});