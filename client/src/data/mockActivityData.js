/**
 * Generate mock user activity data for development and testing
 * @param {string} userId - The user ID to associate with the activities
 * @returns {Array} - An array of activity objects
 */
export const generateMockActivityData = (userId) => {
    const activities = [
        {
            id: 1,
            userId,
            type: 'login',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            details: { ipAddress: '192.168.1.1', device: 'Chrome on Windows' }
        },
        {
            id: 2,
            userId,
            type: 'product_view',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            details: { productId: 'P123', productName: 'Anti-Aging Serum', categoryId: 'skincare' }
        },
        {
            id: 3,
            userId,
            type: 'cart_add',
            timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(), // 32 minutes ago
            details: { productId: 'P123', productName: 'Anti-Aging Serum', quantity: 1 }
        },
        {
            id: 4,
            userId,
            type: 'purchase',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            details: { orderId: 'ORD-1002', total: 124.50, items: 3 }
        },
        {
            id: 5,
            userId,
            type: 'wishlist_add',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            details: { productId: 'P124', productName: 'Moisturizing Cream' }
        },
        {
            id: 6,
            userId,
            type: 'login',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            details: { ipAddress: '192.168.1.1', device: 'Chrome on Windows' }
        },
        {
            id: 7,
            userId,
            type: 'profile_update',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            details: { fields: ['phone', 'address'] }
        },
        {
            id: 8,
            userId,
            type: 'review',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            details: { productId: 'P125', productName: 'Facial Toner', rating: 5 }
        },
        {
            id: 9,
            userId,
            type: 'email_open',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            details: { campaignId: 'C001', subject: 'Summer Sale' }
        },
        {
            id: 10,
            userId,
            type: 'login',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
            details: { ipAddress: '192.168.1.2', device: 'iPhone' }
        },
    ];
    
    return activities;
};

export default generateMockActivityData;
