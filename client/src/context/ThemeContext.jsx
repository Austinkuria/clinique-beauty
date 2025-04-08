import React, { createContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');

    // Simplified Tailwind theme definitions
    const tailwindThemes = {
        light: {
            background: 'theme-bg-light',
            navbarBg: 'theme-navbar-light',
            sectionBg: 'theme-section-light',
            textPrimary: 'text-gray-900',
            textSecondary: 'text-gray-600',
            navbarTextPrimary: 'text-pink-600',
            navbarTextSecondary: 'text-gray-700',
            textHover: 'hover:text-pink-700',
            buttonBg: 'bg-pink-600',
            buttonText: 'text-white',
            buttonHoverBg: 'hover:bg-pink-700',
            accent: 'bg-pink-500',
            shadow: 'shadow-md',
        },
        dark: {
            background: 'theme-bg-dark',
            navbarBg: 'theme-navbar-dark',
            sectionBg: 'theme-section-dark',
            textPrimary: 'text-white',
            textSecondary: 'text-gray-300',
            navbarTextPrimary: 'text-pink-300',
            navbarTextSecondary: 'text-gray-200',
            textHover: 'hover:text-pink-400',
            buttonBg: 'bg-pink-500',
            buttonText: 'text-white',
            buttonHoverBg: 'hover:bg-pink-600',
            accent: 'bg-pink-600',
            shadow: 'shadow-lg',
        },
    };

    // MUI theme creator based on current mode
    const getMuiTheme = (currentMode) => createTheme({
        palette: {
            mode: currentMode,
            primary: {
                main: currentMode === 'light' ? '#e91e63' : '#f48fb1',
                light: '#f48fb1',
                dark: '#c2185b',
            },
            secondary: {
                main: currentMode === 'light' ? '#9c27b0' : '#ce93d8',
                light: '#ba68c8',
                dark: '#7b1fa2',
            },
            background: {
                default: currentMode === 'light' ? '#fafafa' : '#121212',
                paper: currentMode === 'light' ? '#ffffff' : '#1e1e1e',
            },
        },
        typography: {
            fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
            h1: { fontWeight: 600 },
            h2: { fontWeight: 500 },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '50px',
                        textTransform: 'none',
                    },
                },
            },
        },
    });

    // Load saved theme from localStorage
    useEffect(() => {
        const savedMode = localStorage.getItem('themeMode') || 'light';
        setMode(savedMode);
    }, []);

    // Save theme to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    // Toggle between light and dark modes
    const toggleTheme = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    // Get current MUI theme
    const muiTheme = getMuiTheme(mode);

    // Provide the current theme object and toggle function
    return (
        <ThemeContext.Provider
            value={{
                theme: mode,
                colors: tailwindThemes[mode],
                toggleTheme,
                muiTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};