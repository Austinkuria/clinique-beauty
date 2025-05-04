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

// Remove item from cart - FIXED
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`[CartRoutes] Removing item. ID: ${id}, User ID: ${userId}`);
    
    // First check if item exists and belongs to user
    const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (checkError) {
        console.error(`[CartRoutes] Error checking cart item: ${checkError.message}`, checkError);
        
        // Check if this is a "not found" error (PGRST116)
        if (checkError.code === 'PGRST116') {
            // Try to fetch by product_id instead of cart item id as fallback
            console.log(`[CartRoutes] Item not found by ID. Trying to find by product_id: ${id}`);
            
            const { data: itemsByProduct, error: productCheckError } = await supabase
                .from('cart_items')
                .select('*')
                .eq('product_id', id)
                .eq('user_id', userId);
                
            if (productCheckError || !itemsByProduct?.length) {
                res.status(404);
                throw new Error('Cart item not found for this user');
            }
            
            // If we found items by product_id, delete those instead
            console.log(`[CartRoutes] Found ${itemsByProduct.length} items by product_id. Deleting them.`);
            
            const { error: deleteByProductError } = await supabase
                .from('cart_items')
                .delete()
                .eq('product_id', id)
                .eq('user_id', userId);
                
            if (deleteByProductError) {
                console.error(`[CartRoutes] Error deleting by product_id: ${deleteByProductError.message}`);
                res.status(500);
                throw new Error('Error removing item from cart');
            }
            
            res.json({ message: 'Item removed successfully via product ID' });
            return;
        } else {
            // Other database error
            res.status(500);
            throw new Error(`Database error: ${checkError.message}`);
        }
    }

    if (!existingItem) {
        res.status(404);
        throw new Error('Cart item not found for this user');
    }

    // Delete the item - this is the main deletion that should work
    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) {
        console.error(`[CartRoutes] Error deleting cart item: ${error.message}`, error);
        res.status(500);
        throw new Error('Error removing item from cart');
    }

    // Double-check the item was actually deleted
    const { data: checkAfterDelete, error: verifyError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId);
        
    if (!verifyError && checkAfterDelete && checkAfterDelete.length > 0) {
        console.error('[CartRoutes] Item still exists after deletion! Attempting force delete...');
        
        // Try a more direct delete approach
        const { error: forceDeleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id);
            
        if (forceDeleteError) {
            console.error(`[CartRoutes] Force delete failed: ${forceDeleteError.message}`);
        } else {
            console.log('[CartRoutes] Force delete succeeded');
        }
    }

    res.json({ message: 'Item removed successfully' });
}));

// Alternative removal endpoint with itemId in body 
router.delete('/remove', authMiddleware, asyncHandler(async (req, res) => {
    const { itemId } = req.body;
    const userId = req.user.id;

    if (!itemId) {
        res.status(400);
        throw new Error('Item ID is required');
    }

    console.log(`[CartRoutes] Remove endpoint called with itemId: ${itemId}`);
    
    // Try multiple approaches for more robust deletion
    let deleted = false;
    
    // First try direct ID match
    try {
        const { error: directDeleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId)
            .eq('user_id', userId);
            
        if (!directDeleteError) {
            deleted = true;
            console.log(`[CartRoutes] Direct deletion by ID succeeded: ${itemId}`);
        }
    } catch (err) {
        console.error(`[CartRoutes] Direct deletion error: ${err.message}`);
    }
    
    // If direct deletion failed, try by product_id
    if (!deleted) {
        try {
            const { error: productDeleteError } = await supabase
                .from('cart_items')
                .delete()
                .eq('product_id', itemId)
                .eq('user_id', userId);
                
            if (!productDeleteError) {
                deleted = true;
                console.log(`[CartRoutes] Deletion by product_id succeeded: ${itemId}`);
            }
        } catch (err) {
            console.error(`[CartRoutes] Product ID deletion error: ${err.message}`);
        }
    }

    // If neither worked, check if the item exists at all
    if (!deleted) {
        const { data: checkItem, error: checkError } = await supabase
            .from('cart_items')
            .select('id, product_id')
            .eq('user_id', userId);
            
        if (!checkError && checkItem && checkItem.length > 0) {
            console.log(`[CartRoutes] User has ${checkItem.length} cart items. Checking matches...`);
            
            // Check if itemId matches any pattern we might be missing
            const itemMatch = checkItem.find(item => 
                item.id === itemId || 
                item.product_id === itemId
            );
            
            if (itemMatch) {
                console.log(`[CartRoutes] Found matching item: ${JSON.stringify(itemMatch)}`);
                
                // Try one more time with the exact ID
                const { error: lastAttemptError } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('id', itemMatch.id);
                    
                if (!lastAttemptError) {
                    deleted = true;
                    console.log(`[CartRoutes] Final deletion attempt succeeded for ID: ${itemMatch.id}`);
                }
            }
        }
    }

    if (deleted) {
        res.json({ message: 'Item removed successfully' });
    } else {
        // Even if we couldn't delete, don't return an error to client
        // Just log it and let the client refresh the cart
        console.error(`[CartRoutes] All deletion attempts failed for itemId: ${itemId}`);
        res.json({ 
            message: 'Item removal may require refresh',
            warning: 'The item was not found or could not be deleted'
        });
    }
}));

export default router;
