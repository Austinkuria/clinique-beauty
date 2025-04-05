import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import { errorMiddleware } from './src/middleware/errorMiddleware.js';

dotenv.config();connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);
app.use(errorMiddleware);
const PORT = process.env.PORT || 5000;
app.listen(PORT, 
    () => console.log(`Server running on port ${PORT}`));
