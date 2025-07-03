/**
 * Mock orders data for development and testing
 */

export const mockOrders = [
    {
        id: 'ORD-1001',
        customer: 'Wanjiku Kamau',
        email: 'wanjiku.kamau@gmail.com',
        date: '2025-09-15',
        total: 89.99,
        status: 'Delivered',
        paymentStatus: 'Paid',
        phone: '+254 712 345 678',
        location: 'Nairobi, Kenya',
        items: [
            { id: 1, name: 'Moisturizing Cream', quantity: 1, price: 29.99 },
            { id: 2, name: 'Facial Cleanser', quantity: 2, price: 19.99 }
        ]
    },
    {
        id: 'ORD-1002',
        customer: 'Omondi Otieno',
        email: 'omondi.otieno@yahoo.com',
        date: '2025-09-14',
        total: 124.50,
        status: 'Processing',
        paymentStatus: 'Paid',
        phone: '+254 723 456 789',
        location: 'Kisumu, Kenya',
        items: [
            { id: 3, name: 'Anti-Aging Serum', quantity: 1, price: 59.99 },
            { id: 4, name: 'Eye Cream', quantity: 1, price: 34.99 },
            { id: 5, name: 'Lip Balm', quantity: 2, price: 14.99 }
        ]
    },
    {
        id: 'ORD-1003',
        customer: 'Njeri Mwangi',
        email: 'njeri.mwangi@gmail.com',
        date: '2025-09-14',
        total: 76.25,
        status: 'Shipped',
        paymentStatus: 'Paid',
        phone: '+254 735 567 890',
        location: 'Mombasa, Kenya',
        items: [
            { id: 6, name: 'Body Lotion', quantity: 1, price: 24.99 },
            { id: 7, name: 'Shower Gel', quantity: 2, price: 18.99 }
        ]
    },
    {
        id: 'ORD-1004',
        customer: 'Kimani Njoroge',
        email: 'kimani.njoroge@outlook.com',
        date: '2025-09-13',
        total: 212.99,
        status: 'Processing',
        paymentStatus: 'Pending',
        phone: '+254 701 234 567',
        location: 'Nakuru, Kenya',
        items: [
            { id: 8, name: 'Premium Face Set', quantity: 1, price: 129.99 },
            { id: 9, name: 'Hair Treatment', quantity: 2, price: 41.50 }
        ]
    },
    {
        id: 'ORD-1005',
        customer: 'Akinyi Ochieng',
        email: 'akinyi.ochieng@gmail.com',
        date: '2025-09-12',
        total: 45.00,
        status: 'Cancelled',
        paymentStatus: 'Refunded',
        phone: '+254 756 789 012',
        location: 'Eldoret, Kenya',
        items: [
            { id: 10, name: 'Hand Cream', quantity: 3, price: 15.00 }
        ]
    }
];

/**
 * Mock order history data
 */
export const mockOrderHistory = {
    'ORD-1001': [
        { 
            id: 1, 
            date: '2025-09-15T10:30:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2025-09-15T10:35:00', 
            status: 'Payment Received', 
            user: 'System', 
            note: 'Payment confirmed via M-Pesa'
        },
        { 
            id: 3, 
            date: '2025-09-15T14:20:00', 
            status: 'Processing', 
            user: 'David Mutua', 
            note: 'Order verified and sent to fulfillment'
        },
        { 
            id: 4, 
            date: '2025-09-16T09:15:00', 
            status: 'Shipped', 
            user: 'Faith Mwende', 
            note: 'Order shipped via Sendy, tracking: SENDY123456789'
        },
        {
            id: 5,
            date: '2025-09-18T14:30:00',
            status: 'Delivered',
            user: 'System',
            note: 'Package delivered to customer'
        }
    ],
    'ORD-1002': [
        { 
            id: 1, 
            date: '2025-09-14T11:20:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2025-09-14T11:25:00', 
            status: 'Payment Received', 
            user: 'System', 
            note: 'Payment confirmed via PayPal'
        },
        { 
            id: 3, 
            date: '2025-09-14T16:45:00', 
            status: 'Processing', 
            user: 'Michael Brown', 
            note: 'Order verified and sent to fulfillment'
        }
    ],
    'ORD-1003': [
        { 
            id: 1, 
            date: '2025-09-14T09:15:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2025-09-14T09:20:00', 
            status: 'Payment Received', 
            user: 'System', 
            note: 'Payment confirmed via Credit Card'
        },
        { 
            id: 3, 
            date: '2025-09-14T13:10:00', 
            status: 'Processing', 
            user: 'Emily Davis', 
            note: 'Order verified and sent to fulfillment'
        },
        { 
            id: 4, 
            date: '2025-09-15T10:30:00', 
            status: 'Shipped', 
            user: 'Robert Johnson', 
            note: 'Order shipped via UPS, tracking: UPS87654321'
        }
    ],
    'ORD-1004': [
        { 
            id: 1, 
            date: '2025-09-13T15:45:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2025-09-13T15:50:00', 
            status: 'Payment Pending', 
            user: 'System', 
            note: 'Waiting for payment confirmation'
        },
        { 
            id: 3, 
            date: '2025-09-13T16:00:00', 
            status: 'Processing', 
            user: 'James Wilson', 
            note: 'Order being prepared - awaiting payment verification'
        }
    ],
    'ORD-1005': [
        { 
            id: 1, 
            date: '2025-09-12T12:30:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2025-09-12T12:35:00', 
            status: 'Payment Received', 
            user: 'System', 
            note: 'Payment confirmed via Bank Transfer'
        },
        { 
            id: 3, 
            date: '2025-09-12T14:15:00', 
            status: 'Processing', 
            user: 'Emma Taylor', 
            note: 'Order verified and sent to fulfillment'
        },
        { 
            id: 4, 
            date: '2025-09-12T17:20:00', 
            status: 'Cancelled', 
            user: 'David Smith', 
            note: 'Order cancelled per customer request'
        },
        { 
            id: 5, 
            date: '2025-09-12T17:25:00', 
            status: 'Refund Initiated', 
            user: 'System', 
            note: 'Refund processed successfully'
        }
    ]
};

/**
 * List of available shipping carriers
 */
export const shippingCarriers = [
    { value: 'sendy', label: 'Sendy (Kenya)' },
    { value: 'g4s', label: 'G4S Kenya' },
    { value: 'wells', label: 'Wells Fargo Kenya' },
    { value: 'posta', label: 'Posta Kenya' },
    { value: 'glovo', label: 'Glovo Kenya' },
    { value: 'pickup', label: 'Pick-up Mtaani' },
    { value: 'jumia', label: 'Jumia Logistics' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'dhl', label: 'DHL' },
    { value: 'ups', label: 'UPS' },
    { value: 'aramex', label: 'Aramex' },
    { value: 'usps', label: 'USPS' }
];

/**
 * Mock returns data
 */
export const mockReturns = [
    {
        id: 'RET-001',
        orderId: 'ORD-1001',
        customer: 'Wanjiku Kamau',
        reason: 'Wrong product shade',
        status: 'Pending',
        dateRequested: '2025-09-20',
        phone: '+254 712 345 678',
        location: 'Nairobi, Kenya',
        items: [
            { id: 1, name: 'Moisturizing Cream', quantity: 1, price: 29.99 }
        ],
        total: 29.99
    },
    {
        id: 'RET-002',
        orderId: 'ORD-1003',
        customer: 'Njeri Mwangi',
        reason: 'Damaged product',
        status: 'Approved',
        dateRequested: '2025-09-19',
        phone: '+254 735 567 890',
        location: 'Mombasa, Kenya',
        items: [
            { id: 7, name: 'Shower Gel', quantity: 1, price: 18.99 }
        ],
        total: 18.99
    },
    {
        id: 'RET-003',
        orderId: 'ORD-1002',
        customer: 'Omondi Otieno',
        reason: 'Changed mind',
        status: 'Completed',
        dateRequested: '2025-09-18',
        dateProcessed: '2025-09-21',
        phone: '+254 723 456 789',
        location: 'Kisumu, Kenya',
        items: [
            { id: 4, name: 'Eye Cream', quantity: 1, price: 34.99 }
        ],
        total: 34.99,
        refundAmount: 34.99
    }
];

/**
 * Mock order issues data
 */
export const mockIssues = [
    {
        id: 'ISS-001',
        orderId: 'ORD-1001',
        customer: 'Wanjiku Kamau',
        type: 'Delivery Delay',
        status: 'Open',
        priority: 'Medium',
        dateReported: '2025-09-21',
        description: 'Package stuck in Westlands distribution center',
        location: 'Nairobi, Kenya'
    },
    {
        id: 'ISS-002',
        orderId: 'ORD-1004',
        customer: 'Kimani Njoroge',
        type: 'Wrong Items',
        status: 'In Progress',
        priority: 'High',
        dateReported: '2025-09-20',
        description: 'Received dark shade instead of light shade of foundation',
        location: 'Nakuru, Kenya'
    },
    {
        id: 'ISS-003',
        orderId: 'ORD-1003',
        customer: 'Njeri Mwangi',
        type: 'Payment Issue',
        status: 'Resolved',
        priority: 'Low',
        dateReported: '2025-09-19',
        dateResolved: '2025-09-20',
        description: 'Double charged on M-Pesa',
        resolution: 'Refund processed via M-Pesa',
        location: 'Mombasa, Kenya'
    }
];

/**
 * Get order history for a specific order ID
 */
export const getOrderHistory = (orderId) => {
    return mockOrderHistory[orderId] || [];
};

export default mockOrders;
