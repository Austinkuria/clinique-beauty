/**
 * Global error handling middleware for Express
 * This catches errors thrown in route handlers and formats them into consistent responses
 */
export const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err.message);
    
    // Get status code from the error or default to 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Format error response
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        // Include more details if available
        errors: err.errors || undefined,
        code: err.code || undefined
    });
};

// Create a utility function to wrap async handlers
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
