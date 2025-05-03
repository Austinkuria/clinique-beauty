/**
 * Wraps async route handlers to catch errors and pass them to express error middleware
 * @param {Function} fn - The async route handler function
 * @returns {Function} - Express middleware function that catches errors
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
