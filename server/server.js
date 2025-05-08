import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug logging
console.log("Environment loaded, SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
console.log("Environment loaded, SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

import express from 'express';
import axios from 'axios';
import connectDB, { supabase } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mpesaRoutes from './routes/mpesaRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { clerkMiddleware } from './middleware/clerkMiddleware.js';
import { corsMiddleware } from './middleware/corsMiddleware.js';

// Connect to Supabase
connectDB();

// Make supabase client available globally
global.supabase = supabase;

const app = express();

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
    // Other documentation sections
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

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 M-Pesa callback URL: ${process.env.MPESA_CALLBACK_URL || 'Not configured'}`);
});