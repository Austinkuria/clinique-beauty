import React from 'react';
import { toast } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Handles API errors with consistent formatting and user-friendly messages
 */
export const handleApiError = (error, customMessage = null) => {
  const message = customMessage || getErrorMessage(error);
  
  toast.error(message, {
    duration: 5000, // Longer duration for error messages
    id: `error-${Date.now()}`, // Unique ID to prevent duplicates
  });
  
  // Also log to console for debugging
  console.error('API Error:', error);
};

/**
 * Custom Toast component with more detailed error information
 */
export const ErrorToast = ({ error, message }) => {
  const { colorValues } = React.useContext(ThemeContext);
  
  return (
    <Box sx={{ 
      maxWidth: '320px',
      '& a': { color: colorValues.primary }
    }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {message || 'An error occurred'}
      </Typography>
      {error && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: colorValues.textSecondary }}>
          {getErrorMessage(error)}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Extracts a user-friendly message from various error types
 */
export const getErrorMessage = (error) => {
  // Handle different error types
  if (!error) return 'Unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error.response) {
    // Handle API response errors
    switch (error.response.status) {
      case 401: return 'Authentication failed. Please log in again.';
      case 403: return 'You don\'t have permission to access this resource.';
      case 404: return 'The requested resource was not found.';
      case 500: return 'Server error. Please try again later.';
      default: 
        // Try to get message from response
        if (error.response.data && error.response.data.message) {
          return error.response.data.message;
        }
        return `Error ${error.response.status}: ${error.response.statusText || 'Unknown error'}`;
    }
  }
  
  if (error.message) return error.message;
  
  return 'An unexpected error occurred';
};

export default { handleApiError, ErrorToast, getErrorMessage };
