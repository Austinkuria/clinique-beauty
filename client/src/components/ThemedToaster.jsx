import React, { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeContext } from '../context/ThemeContext';

function ThemedToaster() {
    const { theme, colorValues } = useContext(ThemeContext);

    const toastOptions = {
        style: {
            borderRadius: '8px',
            background: colorValues.bgPaper, // Use paper background from theme
            color: colorValues.textPrimary, // Use primary text color from theme
            border: `1px solid ${colorValues.primary}`, // Use primary color for border
            padding: '12px 16px',
            boxShadow: theme === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        success: {
            iconTheme: {
                primary: colorValues.primary, // Color for success icon
                secondary: colorValues.bgPaper,
            },
        },
        error: {
            iconTheme: {
                primary: theme === 'light' ? '#d32f2f' : '#ef5350', // Material UI error colors
                secondary: colorValues.bgPaper,
            },
        },
        // Add styles for loading
        loading: {
            iconTheme: {
                primary: colorValues.primary, // Use primary color for loading spinner
                secondary: theme === 'light' ? '#e0e0e0' : '#424242', // Use a neutral secondary color
            },
        },
    };

    return (
        <Toaster
            position="bottom-right"
            toastOptions={toastOptions}
        />
    );
}

export default ThemedToaster;
