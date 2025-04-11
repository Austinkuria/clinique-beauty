import React, { createContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');

    // Common color palette for both Tailwind and MUI
    const colorPalette = {
        light: {
            primary: '#e91e63',          // Main pink
            primaryLight: '#f48fb1',      // Lighter pink
            primaryDark: '#c2185b',       // Darker pink
            secondary: '#9c27b0',        // Purple
            secondaryLight: '#ba68c8',    // Lighter purple
            bgDefault: '#fafafa',        // Light background
            bgPaper: '#ffffff',          // White paper background
            textPrimary: '#212121',      // Nearly black text
            textSecondary: '#757575',    // Dark gray text
            navbarBg: '#ffffff',         // White navbar
            buttonHover: 'rgba(233,30,99,0.08)', // Pink hover with opacity
        },
        dark: {
            primary: '#f48fb1',          // Lighter pink for dark mode
            primaryLight: '#f8bbd0',      // Even lighter pink
            primaryDark: '#c2185b',      // Darker pink
            secondary: '#ce93d8',        // Light purple
            secondaryLight: '#e1bee7',   // Even lighter purple
            bgDefault: '#121212',        // Dark background
            bgPaper: '#1e1e1e',          // Slightly lighter dark paper
            textPrimary: '#ffffff',      // White text
            textSecondary: '#b0b0b0',    // Light gray text
            navbarBg: '#1e1e1e',         // Dark navbar
            buttonHover: 'rgba(244,143,177,0.15)', // Pink hover with opacity
        }
    };

    // Tailwind theme definitions
    const tailwindThemes = {
        light: {
            background: 'bg-gradient-to-r from-pink-50 to-white',
            navbarBg: 'bg-white',
            sectionBg: 'bg-white',
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
            // Footer specific styles
            footerBg: 'bg-gray-50',
            footerText: 'text-gray-700',
            footerHeading: 'text-pink-600 font-semibold',
            footerLink: 'text-gray-600',
            footerLinkHover: 'hover:text-pink-500',
            footerBorder: 'border-gray-200',
            footerSocial: 'text-pink-500 hover:text-pink-700',
            footerInput: 'bg-white border border-gray-300 focus:ring-pink-500 focus:border-pink-500',
            footerButton: 'bg-pink-600 hover:bg-pink-700 text-white',
        },
        dark: {
            background: 'bg-gray-900',
            navbarBg: 'bg-gray-800',
            sectionBg: 'bg-gray-800',
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
            // Footer specific styles
            footerBg: 'bg-gray-800',
            footerText: 'text-gray-300',
            footerHeading: 'text-pink-300 font-semibold',
            footerLink: 'text-gray-400',
            footerLinkHover: 'hover:text-pink-300',
            footerBorder: 'border-gray-700',
            footerSocial: 'text-pink-400 hover:text-pink-300',
            footerInput: 'bg-gray-700 border border-gray-600 focus:ring-pink-400 focus:border-pink-400 text-white',
            footerButton: 'bg-pink-500 hover:bg-pink-600 text-white',
        },
    };

    // MUI theme creator based on current mode
    const getMuiTheme = (currentMode) => createTheme({
        palette: {
            mode: currentMode,
            primary: {
                main: colorPalette[currentMode].primary,
                light: colorPalette[currentMode].primaryLight,
                dark: colorPalette[currentMode].primaryDark,
            },
            secondary: {
                main: colorPalette[currentMode].secondary,
                light: colorPalette[currentMode].secondaryLight,
                dark: currentMode === 'light' ? '#7b1fa2' : '#8e24aa',
            },
            background: {
                default: colorPalette[currentMode].bgDefault,
                paper: colorPalette[currentMode].bgPaper,
            },
            text: {
                primary: colorPalette[currentMode].textPrimary,
                secondary: colorPalette[currentMode].textSecondary,
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
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: colorPalette[currentMode].navbarBg,
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: colorPalette[currentMode].textPrimary,
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
                colorValues: colorPalette[mode], // Provide direct color values for MUI styling
                toggleTheme,
                muiTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};