import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB, { supabase } from './src/config/db.js';
// import authRoutes from './src/routes/authRoutes.js'; // Remove if Clerk handles all auth
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import { errorMiddleware } from './src/middleware/errorMiddleware.js';
import { clerkMiddleware } from './src/middleware/clerkMiddleware.js'; // Keep Clerk middleware

dotenv.config();
// Connect to Supabase
connectDB();

// Make supabase client available globally (optional, consider dependency injection)
global.supabase = supabase;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // If you have local uploads

// Routes
// app.use('/api/auth', authRoutes); // Remove if Clerk handles all auth
app.use('/api/products', productRoutes); // Public product routes
app.use('/api/users', clerkMiddleware, userRoutes); // Add user routes with Clerk middleware
// Protected routes using Clerk authentication
app.use('/api/cart', clerkMiddleware, cartRoutes);
app.use('/api/orders', clerkMiddleware, orderRoutes);
app.use('/api/search', searchRoutes); // Assuming search might be public or handled differently

// Error handling middleware should be last
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT,
    () => console.log(`Server running on port ${PORT}`));
