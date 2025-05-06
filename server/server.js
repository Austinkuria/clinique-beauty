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

// Use our custom CORS middleware instead of the cors packageration
app.use(corsMiddleware);
  const origins = process.env.ALLOWED_ORIGINS ? 
app.use(express.json());ED_ORIGINS.split(',') : 
app.use('/uploads', express.static('uploads'));/clinique-beauty.vercel.app'];

// ngrok status checkS origins:', origins);
const checkNgrokStatus = async () => {origins;
  const ports = [4040, 4041];
  for (const port of ports) {
    try {
      console.log(`Checking ngrok on port ${port}...`);
      const response = await axios.get(`http://localhost:${port}/api/tunnels`, { timeout: 2000 });
      if (response.data.tunnels.length > 0) {
        const tunnel = response.data.tunnels[0];Allow requests with no origin (like mobile apps, curl, etc.)
        console.log(`ngrok tunnel found on port ${port}: ${tunnel.public_url}`);lowedOrigins.indexOf(origin) !== -1) {
        return { online: true, url: tunnel.public_url };
      } else {
    } catch (error) {   console.warn(`Origin ${origin} not allowed by CORS policy`);
      console.error(`ngrok check failed on port ${port}:`, error.message); it
    }
  }    // To enforce CORS restrictions, use:
  console.error('No active ngrok tunnels found');      // callback(new Error('Not allowed by CORS'));
  return { online: false, message: 'Ngrok tunnel is offline. Please run: npm run ngrok' };
};

// Health check endpoint'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
app.get('/api/health', async (req, res) => { ['Content-Type', 'Authorization']
  const ngrokStatus = await checkNgrokStatus();
  res.json({
    status: 'ok',(corsOptions));
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    ngrok: {
      online: ngrokStatus.online,
      message: ngrokStatus.message || 'Ngrok tunnel is online', checkNgrokStatus = async () => {
      domain: process.env.NGROK_STATIC_DOMAIN || 'deer-equal-blowfish.ngrok-free.app',st ports = [4040, 4041];
      url: ngrokStatus.urlor (const port of ports) {
    }    try {
  }); ngrok on port ${port}...`);
}); axios.get(`http://localhost:${port}/api/tunnels`, { timeout: 2000 });
sponse.data.tunnels.length > 0) {
// Add a root route handlerls[0];
app.get('/', (req, res) => {ngrok tunnel found on port ${port}: ${tunnel.public_url}`);
  res.json({ne: true, url: tunnel.public_url };
    message: 'Clinique Beauty API Server',
    version: '1.0.0',or) {
    status: 'online',grok check failed on port ${port}:`, error.message);
    documentation: '/api/docs',
    endpoints: [
      '/api/products',active ngrok tunnels found');
      '/api/cart',false, message: 'Ngrok tunnel is offline. Please run: npm run ngrok' };
      '/api/orders',
      '/api/search',
      '/api/users',alth check endpoint
      '/api/mpesa'.get('/api/health', async (req, res) => {
    ]  const ngrokStatus = await checkNgrokStatus();
  });
});

// M-Pesa callback endpoint.NODE_ENV || 'development',
app.post('/api/mpesa/callback', async (req, res) => {
  const ngrokStatus = await checkNgrokStatus();
  if (!ngrokStatus.online) {nline',
    return res.status(503).json({deer-equal-blowfish.ngrok-free.app',
      error: 'ERR_NGROK_OFFLINE',rl: ngrokStatus.url
      message: 'The ngrok tunnel is currently offline.', }
      resolution: 'Please start the ngrok tunnel.'
    });
  }
  console.log('M-Pesa callback:', req.body);// Add a root route handler
  res.json({ ResultCode: 0, ResultDesc: 'Received' });/', (req, res) => {
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', clerkMiddleware, cartRoutes);
app.use('/api/orders', clerkMiddleware, orderRoutes);
app.use('/api/search', searchRoutes);      '/api/products',
app.use('/api/users', clerkMiddleware, userRoutes);
app.use('/api/mpesa', mpesaRoutes);
search',
// Add a documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    mpesaEndpoints: {
      '/api/mpesa/token': 'GET - Get M-Pesa OAuth token',
      '/api/mpesa/stkpush': 'POST - Initiate STK Push payment',
      '/api/mpesa/payment': 'POST - Process M-Pesa payment (alternative route)',
      '/api/mpesa/callback': 'POST - M-Pesa transaction callback',t ngrokStatus = await checkNgrokStatus();
      '/api/mpesa/query': 'POST - Query STK Push status',
      '/api/mpesa/health': 'GET - Check M-Pesa configuration'eturn res.status(503).json({
    },   error: 'ERR_NGROK_OFFLINE',
    // Other documentation sections      message: 'The ngrok tunnel is currently offline.',
  });art the ngrok tunnel.'
});
  }
// Error handling middlewarebody);
app.use(errorMiddleware); 0, ResultDesc: 'Received' });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {Routes



});  console.log(`🔗 M-Pesa callback URL: ${process.env.MPESA_CALLBACK_URL || 'Not configured'}`);  console.log(`🚀 Server running on http://localhost:${PORT}`);app.use('/api/products', productRoutes);
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

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 M-Pesa callback URL: ${process.env.MPESA_CALLBACK_URL || 'Not configured'}`);
});