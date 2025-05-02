import React, { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeContext } from '../context/ThemeContext';

function ThemedToaster() {
    const { theme, colorValues } = useContext(ThemeContext);

    const toastOptions = {
        style: {
            borderRadius: '8px',
            background: colorValues.bgPaper,
            color: colorValues.textPrimary,
            border: `1px solid ${colorValues.primary}`,
            padding: '12px 16px',
            boxShadow: theme === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            fontSize: '0.95rem',
            maxWidth: '420px',
        },
        success: {
            iconTheme: {
                primary: colorValues.primary,
                secondary: colorValues.bgPaper,
            },
            style: {
                border: `1px solid ${theme === 'light' ? '#4caf50' : '#81c784'}`,
            },
            duration: 3000,
        },
        error: {
            iconTheme: {
                primary: theme === 'light' ? '#d32f2f' : '#ef5350',
                secondary: colorValues.bgPaper,
            },
            style: {
                border: `1px solid ${theme === 'light' ? '#d32f2f' : '#ef5350'}`,
            },
            duration: 4000, // Errors stay visible longer
        },
        loading: {
            iconTheme: {
                primary: colorValues.primary,
                secondary: theme === 'light' ? '#e0e0e0' : '#424242',
            },
            style: {
                border: `1px solid ${colorValues.textSecondary}`,
            },
        },
    };

    return (
        <Toaster
            position="bottom-right"
            toastOptions={toastOptions}
            gutter={12} // Add more space between toasts
            containerStyle={{
                bottom: 40, // Position above the bottom of the page
                right: 20,
            }}
        />
    );
}

export default ThemedToaster;
