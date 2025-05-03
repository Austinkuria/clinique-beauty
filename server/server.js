import dotenv from 'dotenv';

// Load environment variables BEFORE other imports
dotenv.config();

// Debug logging
console.log("Environment loaded, SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
console.log("Environment loaded, SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

import express from 'express';
import cors from 'cors';
import connectDB, { supabase } from './src/config/db.js';
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import { errorMiddleware } from './src/middleware/errorMiddleware.js';
import { clerkMiddleware } from './src/middleware/clerkMiddleware.js'; // Keep Clerk middleware

// Connect to Supabase
connectDB();

// Make supabase client available globally (optional, consider dependency injection)
global.supabase = supabase;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // If you have local uploads

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', clerkMiddleware, cartRoutes);
app.use('/api/orders', clerkMiddleware, orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', clerkMiddleware, userRoutes);  // Add the user routes

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
