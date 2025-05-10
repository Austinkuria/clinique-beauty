/**
 * Mock orders data for development and testing
 */

export const mockOrders = [
    {
        id: 'ORD-1001',
        customer: 'Emma Watson',
        email: 'emma.watson@example.com',
        date: '2023-09-15',
        total: 89.99,
        status: 'Delivered',
        paymentStatus: 'Paid',
        items: [
            { id: 1, name: 'Moisturizing Cream', quantity: 1, price: 29.99 },
            { id: 2, name: 'Facial Cleanser', quantity: 2, price: 19.99 }
        ]
    },
    {
        id: 'ORD-1002',
        customer: 'John Doe',
        email: 'john.doe@example.com',
        date: '2023-09-14',
        total: 124.50,
        status: 'Processing',
        paymentStatus: 'Paid',
        items: [
            { id: 3, name: 'Anti-Aging Serum', quantity: 1, price: 59.99 },
            { id: 4, name: 'Eye Cream', quantity: 1, price: 34.99 },
            { id: 5, name: 'Lip Balm', quantity: 2, price: 14.99 }
        ]
    },
    {
        id: 'ORD-1003',
        customer: 'Alice Smith',
        email: 'alice.smith@example.com',
        date: '2023-09-14',
        total: 76.25,
        status: 'Shipped',
        paymentStatus: 'Paid',
        items: [
            { id: 6, name: 'Body Lotion', quantity: 1, price: 24.99 },
            { id: 7, name: 'Shower Gel', quantity: 2, price: 18.99 }
        ]
    },
    {
        id: 'ORD-1004',
        customer: 'Robert Brown',
        email: 'robert.brown@example.com',
        date: '2023-09-13',
        total: 212.99,
        status: 'Processing',
        paymentStatus: 'Pending',
        items: [
            { id: 8, name: 'Premium Face Set', quantity: 1, price: 129.99 },
            { id: 9, name: 'Hair Treatment', quantity: 2, price: 41.50 }
        ]
    },
    {
        id: 'ORD-1005',
        customer: 'Jane Cooper',
        email: 'jane.cooper@example.com',
        date: '2023-09-12',
        total: 45.00,
        status: 'Cancelled',
        paymentStatus: 'Refunded',
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
            date: '2023-09-15T10:30:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2023-09-15T10:35:00', 
            status: 'Payment Received', 
            user: 'System', 
            note: 'Payment confirmed via Credit Card'
        },
        { 
            id: 3, 
            date: '2023-09-15T14:20:00', 
            status: 'Processing', 
            user: 'John Smith', 
            note: 'Order verified and sent to fulfillment'
        },
        { 
            id: 4, 
            date: '2023-09-16T09:15:00', 
            status: 'Shipped', 
            user: 'Sarah Johnson', 
            note: 'Order shipped via FedEx, tracking: FDX123456789'
        },
        {
            id: 5,
            date: '2023-09-18T14:30:00',
            status: 'Delivered',
            user: 'System',
            note: 'Package delivered to customer'
        }
    ],
    'ORD-1002': [
        { 
            id: 1, 
            date: '2023-09-14T11:20:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2023-09-14T11:25:00', 
            status: 'Payment Received', 
            user: 'System', 
            note: 'Payment confirmed via PayPal'
        },
        { 
            id: 3, 
            date: '2023-09-14T16:45:00', 
            status: 'Processing', 
            user: 'Michael Brown', 
            note: 'Order verified and sent to fulfillment'
        }
    ],
    'ORD-1003': [
        { 
            id: 1, 
            date: '2023-09-14T09:15:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2023-09-14T09:20:00', 
            status: 'Payment Received', 
            user: 'System', 
            note: 'Payment confirmed via Credit Card'
        },
        { 
            id: 3, 
            date: '2023-09-14T13:10:00', 
            status: 'Processing', 
            user: 'Emily Davis', 
            note: 'Order verified and sent to fulfillment'
        },
        { 
            id: 4, 
            date: '2023-09-15T10:30:00', 
            status: 'Shipped', 
            user: 'Robert Johnson', 
            note: 'Order shipped via UPS, tracking: UPS87654321'
        }
    ],
    'ORD-1004': [
        { 
            id: 1, 
            date: '2023-09-13T15:45:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2023-09-13T15:50:00', 
            status: 'Payment Pending', 
            user: 'System', 
            note: 'Waiting for payment confirmation'
        },
        { 
            id: 3, 
            date: '2023-09-13T16:00:00', 
            status: 'Processing', 
            user: 'James Wilson', 
            note: 'Order being prepared - awaiting payment verification'
        }
    ],
    'ORD-1005': [
        { 
            id: 1, 
            date: '2023-09-12T12:30:00', 
            status: 'Order Placed', 
            user: 'Customer', 
            note: 'Order placed by customer'
        },
        { 
            id: 2, 
            date: '2023-09-12T12:35:00', 
            status: 'Payment Received', 
            user: 'System', 
            note: 'Payment confirmed via Bank Transfer'
        },
        { 
            id: 3, 
            date: '2023-09-12T14:15:00', 
            status: 'Processing', 
            user: 'Emma Taylor', 
            note: 'Order verified and sent to fulfillment'
        },
        { 
            id: 4, 
            date: '2023-09-12T17:20:00', 
            status: 'Cancelled', 
            user: 'David Smith', 
            note: 'Order cancelled per customer request'
        },
        { 
            id: 5, 
            date: '2023-09-12T17:25:00', 
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
    { value: 'fedex', label: 'FedEx' },
    { value: 'dhl', label: 'DHL' },
    { value: 'ups', label: 'UPS' },
    { value: 'posta', label: 'Posta Kenya' },
    { value: 'usps', label: 'USPS' },
    { value: 'aramex', label: 'Aramex' }
];

/**
 * Get order history for a specific order ID
 */
export const getOrderHistory = (orderId) => {
    return mockOrderHistory[orderId] || [];
};

export default mockOrders;
