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

export default mockOrders;
