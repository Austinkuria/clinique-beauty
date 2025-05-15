import { validateRequired, sanitizeObject } from './inputValidation';

/**
 * Validates the form data for creating an A/B test
 * @param {Object} formData - The test data to validate
 * @returns {Object} - Object with isValid flag and errors object
 */
export const validateABTest = (formData) => {
  const errors = {};
  
  // Required fields validation
  if (!validateRequired(formData.name)) {
    errors.name = 'Test name is required';
  }
  
  if (!validateRequired(formData.description)) {
    errors.description = 'Description is required';
  }
  
  if (!validateRequired(formData.startDate)) {
    errors.startDate = 'Start date is required';
  }
  
  if (!validateRequired(formData.endDate)) {
    errors.endDate = 'End date is required';
  }
  
  // Date validation
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end <= start) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  // Variants validation
  if (!formData.variants || formData.variants.length < 2) {
    errors.variants = 'At least 2 variants are required';
  } else {
    // Check if all variants have names
    const variantErrors = [];
    let totalAllocation = 0;
    
    formData.variants.forEach((variant, index) => {
      const variantError = {};
      
      if (!validateRequired(variant.name)) {
        variantError.name = 'Variant name is required';
      }
      
      if (!variant.trafficAllocation || isNaN(variant.trafficAllocation) || variant.trafficAllocation <= 0) {
        variantError.trafficAllocation = 'Valid traffic allocation is required';
      } else {
        totalAllocation += Number(variant.trafficAllocation);
      }
      
      if (Object.keys(variantError).length > 0) {
        variantErrors[index] = variantError;
      }
    });
    
    // Check if total allocation is approximately 100%
    if (Math.abs(totalAllocation - 100) > 1) {
      errors.totalAllocation = 'Total traffic allocation must equal 100%';
    }
    
    if (variantErrors.length > 0) {
      errors.variantErrors = variantErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Prepares the test data for submission by sanitizing inputs and formatting
 * @param {Object} formData - The raw form data
 * @returns {Object} - Sanitized and formatted test data ready for submission
 */
export const prepareTestData = (formData) => {
  // First sanitize all string inputs to prevent XSS
  const sanitized = sanitizeObject(formData);
  
  // Format the data as needed for the API
  return {
    ...sanitized,
    variants: sanitized.variants.map(variant => ({
      ...variant,
      trafficAllocation: Number(variant.trafficAllocation)
    })),
    // Convert dates to ISO strings if they aren't already
    startDate: new Date(sanitized.startDate).toISOString(),
    endDate: new Date(sanitized.endDate).toISOString(),
    // Set initial status to draft
    status: 'draft'
  };
};
