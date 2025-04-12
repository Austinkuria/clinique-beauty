import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { supabase } from '../config/db.js';

const router = express.Router();

// Get user's cart
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get cart items with product details
    const { data, error } = await supabase
        .from('cart_items')
        .select(`
            id, 
            quantity,
            products (*)
        `)
        .eq('user_id', userId);

    if (error) {
        res.status(500);
        throw new Error('Error fetching cart');
    }

    // Calculate total
    const total = data.reduce((sum, item) => {
        return sum + (item.products.price * item.quantity);
    }, 0);

    res.json({
        items: data.map(item => ({
            id: item.id,
            product: item.products,
            quantity: item.quantity
        })),
        total
    });
}));

// Add item to cart
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity) {
        res.status(400);
        throw new Error('Product ID and quantity are required');
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

    if (productError || !product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if item already in cart
    const { data: existingItem, error: existingError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

    if (existingError && existingError.code !== 'PGRST116') {
        res.status(500);
        throw new Error('Error checking cart');
    }

    let result;

    if (existingItem) {
        // Update quantity if already in cart
        const newQuantity = existingItem.quantity + quantity;

        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id)
            .select()
            .single();

        if (error) {
            res.status(500);
            throw new Error('Error updating cart item');
        }

        result = data;
    } else {
        // Add new item to cart
        const { data, error } = await supabase
            .from('cart_items')
            .insert({
                user_id: userId,
                product_id: productId,
                quantity
            })
            .select()
            .single();

        if (error) {
            res.status(500);
            throw new Error('Error adding item to cart');
        }

        result = data;
    }

    res.status(201).json(result);
}));

// Update cart item quantity
router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Valid quantity is required');
    }

    // Verify item belongs to user
    const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (checkError || !existingItem) {
        res.status(404);
        throw new Error('Cart item not found');
    }

    // Update quantity
    const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        res.status(500);
        throw new Error('Error updating cart item');
    }

    res.json(data);
}));

// Remove item from cart
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify item belongs to user
    const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (checkError || !existingItem) {
        res.status(404);
        throw new Error('Cart item not found');
    }

    // Delete the item
    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);

    if (error) {
        res.status(500);
        throw new Error('Error removing item from cart');
    }

    res.json({ message: 'Item removed from cart' });
}));

export default router;
