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

    if (!productId || !quantity || quantity < 1) { // Ensure quantity is at least 1
        res.status(400);
        throw new Error('Product ID and a valid quantity are required');
    }

    // Check if product exists and get stock
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, stock') // Select only id and stock
        .eq('id', productId)
        .single();

    if (productError || !product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if requested quantity exceeds stock
    if (quantity > product.stock) {
        res.status(400);
        throw new Error(`Not enough stock. Only ${product.stock} available.`);
    }

    // Check if item already in cart
    const { data: existingItem, error: existingError } = await supabase
        .from('cart_items')
        .select('id, quantity') // Select only needed fields
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

    if (existingError && existingError.code !== 'PGRST116') {
        res.status(500);
        throw new Error('Error checking cart');
    }

    let updatedOrNewItemId;

    if (existingItem) {
        // Update quantity if already in cart
        const newQuantity = existingItem.quantity + quantity;

        // Check if new quantity exceeds stock
        if (newQuantity > product.stock) {
            res.status(400);
            throw new Error(`Cannot add ${quantity}. Total quantity would exceed stock (${product.stock} available).`);
        }

        const { data: updatedItem, error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity, updated_at: new Date() }) // Also update timestamp
            .eq('id', existingItem.id)
            .select('id') // Select only the ID
            .single();

        if (updateError) {
            res.status(500);
            throw new Error('Error updating cart item');
        }
        updatedOrNewItemId = updatedItem.id;

    } else {
        // Add new item to cart (already checked quantity against stock above)
        const { data: newItem, error: insertError } = await supabase
            .from('cart_items')
            .insert({
                user_id: userId,
                product_id: productId,
                quantity
            })
            .select('id') // Select only the ID
            .single();

        if (insertError) {
            res.status(500);
            throw new Error('Error adding item to cart');
        }
        updatedOrNewItemId = newItem.id;
    }

    // Fetch the updated/new cart item with product details to return
    const { data: resultItem, error: resultError } = await supabase
        .from('cart_items')
        .select(`
            id,
            quantity,
            products (*)
        `)
        .eq('id', updatedOrNewItemId)
        .single();

    if (resultError || !resultItem) {
        console.error("Error fetching result item after add/update:", resultError);
        // Don't throw here, but maybe log. The operation succeeded, just fetching failed.
        // We could return a simpler success message or the basic ID.
        // For now, let's return the ID if fetching fails.
        res.status(201).json({ id: updatedOrNewItemId, message: "Operation successful, but failed to fetch full item details." });
    } else {
        // Map to the expected client structure
        const responseItem = {
            id: resultItem.id,
            product: resultItem.products,
            quantity: resultItem.quantity
        };
        res.status(201).json(responseItem);
    }
}));

// Update cart item quantity
router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Valid quantity is required (must be 1 or greater)');
    }

    // Verify item belongs to user and get product ID
    const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, product_id') // Select product_id as well
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (checkError || !existingItem) {
        res.status(404);
        throw new Error('Cart item not found');
    }

    // Get product stock
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, stock')
        .eq('id', existingItem.product_id)
        .single();

    if (productError || !product) {
        // This case should ideally not happen if cart item exists, but good to check
        res.status(404);
        throw new Error('Associated product not found');
    }

    // Check if requested quantity exceeds stock
    if (quantity > product.stock) {
        res.status(400);
        throw new Error(`Not enough stock. Only ${product.stock} available.`);
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
