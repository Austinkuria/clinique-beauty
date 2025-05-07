/**
 * Security utilities for API requests
 */
import { sanitizeObject } from '../utils/inputValidation';

/**
 * Creates a secure fetch wrapper that sanitizes request and response data
 * @param {Function} fetchFn - The original fetch function
 * @returns {Function} - Enhanced fetch function
 */
export const createSecureFetch = (fetchFn = fetch) => {
  return async (url, options = {}) => {
    // Clone options to avoid mutating the original
    const secureOptions = { ...options };
    
    // Sanitize request body if it exists
    if (secureOptions.body && typeof secureOptions.body === 'string') {
      try {
        // Parse JSON to sanitize object properties
        const bodyObject = JSON.parse(secureOptions.body);
        const sanitizedBody = sanitizeObject(bodyObject);
        secureOptions.body = JSON.stringify(sanitizedBody);
      } catch (error) {
        // If not valid JSON, leave as is
        console.warn('Could not sanitize request body - not valid JSON');
      }
    }
    
    // Make the request
    const response = await fetchFn(url, secureOptions);
    
    // Clone the response to avoid consuming it
    const clonedResponse = response.clone();
    
    // Try to sanitize the response
    try {
      const contentType = response.headers.get('content-type');
      
      // Only sanitize JSON responses
      if (contentType && contentType.includes('application/json')) {
        const data = await clonedResponse.json();
        const sanitizedData = sanitizeObject(data);
        
        // Create a new response with sanitized data
        return new Response(JSON.stringify(sanitizedData), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    } catch (error) {
      // If we can't sanitize the response, return the original
      console.warn('Could not sanitize response:', error);
    }
    
    // Return original response if we couldn't sanitize
    return response;
  };
};

/**
 * Applies security headers to a fetch request
 * @param {Object} options - Fetch options
 * @returns {Object} - Enhanced options with security headers
 */
export const applySecurityHeaders = (options = {}) => {
  const secureOptions = { ...options };
  secureOptions.headers = {
    ...secureOptions.headers,
    'Content-Security-Policy': "default-src 'self'",
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff'
  };
  
  return secureOptions;
};
