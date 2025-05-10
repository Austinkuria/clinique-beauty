/**
 * Mock user segments data for development and testing
 */

export const mockSegments = [
    {
        id: 1,
        name: 'High Value Customers',
        conditions: [
            { field: 'totalSpent', operator: 'greaterThan', value: 500 }
        ],
        userCount: 24
    },
    {
        id: 2,
        name: 'Recent Customers',
        conditions: [
            { field: 'lastPurchase', operator: 'lessThan', value: '30days' }
        ],
        userCount: 56
    },
    {
        id: 3,
        name: 'Inactive Users',
        conditions: [
            { field: 'lastLogin', operator: 'greaterThan', value: '90days' }
        ],
        userCount: 18
    }
];

export default mockSegments;
