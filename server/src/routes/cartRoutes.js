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

// Alternative removal endpoint with itemId in body - Enhanced with better logging
router.delete('/remove', authMiddleware, asyncHandler(async (req, res) => {
    const { itemId, productId, originalItem, fullItem } = req.body;
    const userId = req.user.id;

    console.log(`[CartRoutes Remove] Called with body:`, req.body);

    if (!itemId && !productId) {
        console.log(`[CartRoutes Remove] Missing required identifier in body:`, req.body);
        res.status(400);
        throw new Error('Item ID or product ID is required');
    }

    const targetId = itemId || productId;
    console.log(`[CartRoutes Remove] Using targetId: ${targetId} for user ${userId}`);
    
    // Try multiple approaches for more robust deletion
    let deleted = false;
    let deletionDetails = { attempts: [] };
    
    // First try direct ID match
    try {
        console.log(`[CartRoutes Remove] Attempt 1: Direct deletion by ID ${targetId}`);
        const { error: directDeleteError, data: directDeleteData } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', targetId)
            .eq('user_id', userId)
            .select();
            
        deletionDetails.attempts.push({
            type: 'direct_id',
            id: targetId,
            success: !directDeleteError,
            error: directDeleteError?.message,
            data: directDeleteData
        });
        
        if (!directDeleteError) {
            deleted = true;
            console.log(`[CartRoutes Remove] Direct deletion by ID succeeded: ${targetId}`);
        } else {
            console.error(`[CartRoutes Remove] Direct deletion error: ${directDeleteError.message}`);
        }
    } catch (err) {
        console.error(`[CartRoutes Remove] Exception during direct deletion: ${err.message}`);
        deletionDetails.attempts.push({
            type: 'direct_id',
            id: targetId,
            success: false,
            exception: err.message
        });
    }
    
    // If direct deletion failed and we have a product_id, try that
    if (!deleted && productId) {
        try {
            console.log(`[CartRoutes Remove] Attempt 2: Delete by product_id ${productId}`);
            const { error: productDeleteError, data: productDeleteData } = await supabase
                .from('cart_items')
                .delete()
                .eq('product_id', productId)
                .eq('user_id', userId)
                .select();
                
            deletionDetails.attempts.push({
                type: 'product_id',
                id: productId,
                success: !productDeleteError,
                error: productDeleteError?.message,
                data: productDeleteData
            });
            
            if (!productDeleteError) {
                deleted = true;
                console.log(`[CartRoutes Remove] Deletion by product_id succeeded: ${productId}`);
            } else {
                console.error(`[CartRoutes Remove] Product ID deletion error: ${productDeleteError.message}`);
            }
        } catch (err) {
            console.error(`[CartRoutes Remove] Exception during product_id deletion: ${err.message}`);
            deletionDetails.attempts.push({
                type: 'product_id',
                id: productId,
                success: false,
                exception: err.message
            });
        }
    }

    // If neither worked, check if the item exists at all
    if (!deleted) {
        try {
            console.log(`[CartRoutes Remove] Attempt 3: Looking up all cart items for user ${userId}`);
            const { data: checkItem, error: checkError } = await supabase
                .from('cart_items')
                .select('id, product_id')
                .eq('user_id', userId);
                
            if (checkError) {
                console.error(`[CartRoutes Remove] Error listing cart items: ${checkError.message}`);
                deletionDetails.attempts.push({
                    type: 'list_items',
                    success: false,
                    error: checkError.message
                });
            } 
            else if (checkItem && checkItem.length > 0) {
                console.log(`[CartRoutes Remove] User has ${checkItem.length} cart items: ${JSON.stringify(checkItem.map(i => ({id: i.id, product_id: i.product_id})))}`);
                deletionDetails.cartItems = checkItem.map(i => ({id: i.id, product_id: i.product_id}));
                
                // Look for a matching item - check both ID and product_id
                const itemMatch = checkItem.find(item => 
                    item.id === targetId || 
                    item.product_id === targetId
                );
                
                if (itemMatch) {
                    console.log(`[CartRoutes Remove] Found matching item: ${JSON.stringify(itemMatch)}`);
                    
                    // Try one more time with the specific ID
                    const { error: lastAttemptError, data: lastAttemptData } = await supabase
                        .from('cart_items')
                        .delete()
                        .eq('id', itemMatch.id)
                        .select();
                        
                    deletionDetails.attempts.push({
                        type: 'match_delete',
                        id: itemMatch.id,
                        success: !lastAttemptError,
                        error: lastAttemptError?.message,
                        data: lastAttemptData
                    });
                    
                    if (!lastAttemptError) {
                        deleted = true;
                        console.log(`[CartRoutes Remove] Final deletion successful for ID: ${itemMatch.id}`);
                    } else {
                        console.error(`[CartRoutes Remove] Final deletion attempt failed: ${lastAttemptError.message}`);
                    }
                } else {
                    console.log(`[CartRoutes Remove] No matching item found for target ID: ${targetId}`);
                    deletionDetails.attempts.push({
                        type: 'find_match',
                        success: false,
                        message: 'No matching item found'
                    });
                }
            } else {
                console.log(`[CartRoutes Remove] User has no cart items`);
                deletionDetails.attempts.push({
                    type: 'list_items',
                    success: true,
                    message: 'User has no cart items'
                });
            }
        } catch (err) {
            console.error(`[CartRoutes Remove] Error during item lookup: ${err.message}`);
            deletionDetails.attempts.push({
                type: 'item_lookup',
                success: false,
                exception: err.message
            });
        }
    }

    if (deleted) {
        console.log(`[CartRoutes Remove] Successfully deleted item`);
        res.json({ 
            message: 'Item removed successfully',
            details: deletionDetails
        });
    } else {
        // Even if we couldn't delete, return a "success" to the client
        // to avoid showing errors to the user - the cart will refresh anyway
        console.warn(`[CartRoutes Remove] All deletion attempts failed for ID: ${targetId}`);
        res.json({ 
            message: 'Item removal requested',
            warning: 'Item may not have been deleted from database',
            details: deletionDetails
        });
    }
}));

export default router;
