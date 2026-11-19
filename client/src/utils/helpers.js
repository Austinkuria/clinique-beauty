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
 * Formats a number as currency (Kenyan Shillings)
 * 
 * @param {number} value The value to format
 * @param {string} currency The currency code (default: 'KES' for Kenyan Shillings)
 * @return {string} The formatted currency string
 */
export function formatCurrency(value, currency = 'KES') {
    const num = Number(value) || 0;
    
    // For Kenyan Shillings, format as KSh X,XXX (without trailing decimal .00 for integer values)
    if (currency === 'KES') {
        const formatted = new Intl.NumberFormat('en-KE', {
            maximumFractionDigits: num % 1 === 0 ? 0 : 2
        }).format(num);
        return `KSh ${formatted}`;
    }
    
    // For other currencies, use standard Intl.NumberFormat
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(num);
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
