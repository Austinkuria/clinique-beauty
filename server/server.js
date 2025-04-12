import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB, { supabase } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import { errorMiddleware } from './src/middleware/errorMiddleware.js';
import { clerkMiddleware } from './src/middleware/clerkMiddleware.js';

dotenv.config();
// Connect to Supabase
connectDB();

// Make supabase client available globally
global.supabase = supabase;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
// Protected routes with Clerk authentication
app.use('/api/cart', clerkMiddleware, cartRoutes);
app.use('/api/orders', clerkMiddleware, orderRoutes);
app.use('/api/search', searchRoutes);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT,
    () => console.log(`Server running on port ${PORT}`));
