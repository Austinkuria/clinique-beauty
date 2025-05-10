/**
 * Mock review data for development and testing
 * Keys are product IDs, values are arrays of review objects
 */

export const mockReviewsData = {
    1: [
        { id: 1, user: 'Alice', rating: 5, comment: 'Absolutely love this moisturizer! My skin feels so hydrated.' },
        { id: 2, user: 'Bob', rating: 4, comment: 'Great product, works well for sensitive skin.' },
    ],
    5: [
        { id: 3, user: 'Charlie', rating: 4, comment: 'Good foundation, provides nice coverage.' },
    ],
    8: [
        { id: 4, user: 'Diana', rating: 5, comment: 'The best eyeshadow palette I\'ve ever used! Colors are vibrant and blend well.' },
        { id: 5, user: 'Edward', rating: 3, comment: 'Nice colors but has some fallout. Decent for the price.' }
    ],
    13: [
        { id: 6, user: 'Fiona', rating: 4, comment: 'My hair feels so soft after using this shampoo!' },
    ],
    // Add more mock reviews for other product IDs as needed
};

export default mockReviewsData;
