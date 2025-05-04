import { api } from '../../api/apiClient';

/**
 * Validates the cart before checkout to ensure all items have sufficient stock
 * @returns {Promise<{ valid: boolean, issues: Array<Object> }>}
 */
export const validateCartForCheckout = async () => {
    try {
        // Fetch the latest cart
        const cartItems = await api.getCart();
        
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return { valid: false, issues: [{ type: 'empty', message: 'Your cart is empty' }] };
        }
        
        // Check each item for stock issues
        const issues = [];
        
        for (const item of cartItems) {
            // Skip items without stock information
            if (item.stock === undefined) continue;
            
            if (item.quantity > item.stock) {
                issues.push({
                    type: 'stock',
                    itemId: item.id || item.product_id,
                    name: item.name || 'Product',
                    requestedQuantity: item.quantity,
                    availableStock: item.stock,
                    message: `Not enough stock for ${item.name}. Only ${item.stock} available.`
                });
            }
        }
        
        // If we found issues, try to auto-correct them
        if (issues.length > 0) {
            console.log('[validateCartForCheckout] Found stock issues:', issues);
            
            // Attempt to fix each issue
            for (const issue of issues) {
                if (issue.type === 'stock' && issue.itemId && issue.availableStock > 0) {
                    try {
                        // Update the item quantity to match available stock
                        await api.updateCartItemQuantity({
                            itemId: issue.itemId,
                            quantity: issue.availableStock
                        });
                        
                        // Mark this issue as auto-fixed
                        issue.autoFixed = true;
                        issue.message = `Quantity for ${issue.name} was automatically adjusted to ${issue.availableStock} due to stock limitations.`;
                    } catch (updateError) {
                        console.error(`[validateCartForCheckout] Failed to auto-fix stock issue for ${issue.name}:`, updateError);
                        issue.autoFixed = false;
                    }
                }
            }
            
            // Re-fetch the cart after fixes
            const updatedCart = await api.getCart();
            
            // Return the results with information about what was fixed
            return { 
                valid: issues.every(issue => issue.autoFixed), 
                issues,
                cart: updatedCart
            };
        }
        
        // No issues found
        return { valid: true, issues: [] };
    } catch (error) {
        console.error('[validateCartForCheckout] Error validating cart:', error);
        return { 
            valid: false, 
            issues: [{ type: 'error', message: error.message || 'Failed to validate cart' }]
        };
    }
};

/**
 * Calculates estimated shipping for cart items
 * @returns {Promise<{ shippingMethods: Array<Object> }>}
 */
export const calculateShipping = async () => {
    // This could call an API endpoint in the future,
    // but for now we'll return static options
    return {
        shippingMethods: [
            { id: 'standard', name: 'Standard Shipping', price: 0, estimatedDays: '5-7' },
            { id: 'express', name: 'Express Shipping', price: 1299, estimatedDays: '2-3' },
            { id: 'overnight', name: 'Overnight Shipping', price: 2499, estimatedDays: '1' }
        ]
    };
};

/**
 * Prepare checkout by validating the cart and getting shipping options
 * @returns {Promise<Object>}
 */
export const prepareCheckout = async () => {
    // First validate the cart
    const validationResult = await validateCartForCheckout();
    
    if (!validationResult.valid) {
        return validationResult; // Return early with validation issues
    }
    
    // Calculate shipping options
    const shippingOptions = await calculateShipping();
    
    // Return everything needed for checkout
    return {
        valid: true,
        ...shippingOptions,
        cart: validationResult.cart || await api.getCart()
    };
};

/**
 * Create a checkout session (this would integrate with your payment processor)
 */
export const createCheckoutSession = async (checkoutData) => {
    // This would call your payment provider's API
    // For now, simulate a successful response
    return {
        success: true,
        checkoutUrl: '#/checkout-confirmation',
        sessionId: 'sim_' + Math.random().toString(36).substring(2, 15)
    };
};

export default {
    validateCartForCheckout,
    calculateShipping,
    prepareCheckout,
    createCheckoutSession
};
