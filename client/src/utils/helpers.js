/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param {Function} func The function to debounce
 * @param {number} wait The number of milliseconds to delay
 * @return {Function} The debounced function
 */
export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Formats a number as a currency string
 * 
 * @param {number} value The value to format
 * @param {string} currency The currency code (default: 'USD')
 * @return {string} The formatted currency string
 */
export function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(value);
}

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 * 
 * @param {string} text The text to truncate
 * @param {number} maxLength The maximum length (default: 50)
 * @return {string} The truncated text
 */
export function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}
