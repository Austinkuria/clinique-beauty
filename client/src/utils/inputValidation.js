/**
 * Input validation and sanitization utility functions
 */
import DOMPurify from 'dompurify';

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Validates a Kenyan phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(0|\+?254|0?7)\d{8,9}$/;
  return phoneRegex.test(String(phone).replace(/\s/g, ''));
};

/**
 * Validates a name field
 * @param {string} name - The name to validate
 * @returns {boolean} - True if valid
 */
export const validateName = (name) => {
  // Name should be at least 2 characters and contain only letters, spaces, and hyphens
  const nameRegex = /^[A-Za-z\s-]{2,}$/;
  return nameRegex.test(String(name));
};

/**
 * Validates that a field is not empty
 * @param {string} value - The value to validate
 * @returns {boolean} - True if valid
 */
export const validateRequired = (value) => {
  return value && String(value).trim().length > 0;
};

/**
 * Validates a postal code
 * @param {string} postalCode - The postal code to validate
 * @returns {boolean} - True if valid
 */
export const validatePostalCode = (postalCode) => {
  // Kenya postal codes are 5 digits
  return /^\d{5}$/.test(String(postalCode).trim());
};

/**
 * Sanitizes input to prevent XSS attacks
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  return DOMPurify.sanitize(String(input).trim());
};

/**
 * Sanitizes an object's string properties
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized = { ...obj };
  
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    }
  });
  
  return sanitized;
};
