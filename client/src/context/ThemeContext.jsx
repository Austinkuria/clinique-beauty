import React, { createContext, useState, useEffect, useContext } from 'react';
import { createTheme } from '@mui/material/styles';

export const ThemeContext = createContext();

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');
    const [themeVariant, setThemeVariant] = useState('pink'); // New theme variant state

    // Predefined theme variants with their color schemes
    const themeVariants = {
        pink: {
            name: 'Pink Beauty',
            light: {
                primary: '#e91e63',
                primaryLight: '#f48fb1',
                primaryDark: '#c2185b',
                secondary: '#9c27b0',
                secondaryLight: '#ba68c8',
                accent: '#ff4081',
            },
            dark: {
                primary: '#f48fb1',
                primaryLight: '#f8bbd0',
                primaryDark: '#c2185b',
                secondary: '#ce93d8',
                secondaryLight: '#e1bee7',
                accent: '#ff4081',
            }
        },
        purple: {
            name: 'Royal Purple',
            light: {
                primary: '#9c27b0',
                primaryLight: '#ba68c8',
                primaryDark: '#7b1fa2',
                secondary: '#673ab7',
                secondaryLight: '#9575cd',
                accent: '#e040fb',
            },
            dark: {
                primary: '#ce93d8',
                primaryLight: '#e1bee7',
                primaryDark: '#ab47bc',
                secondary: '#b39ddb',
                secondaryLight: '#c5cae9',
                accent: '#e040fb',
            }
        },
        blue: {
            name: 'Ocean Blue',
            light: {
                primary: '#2196f3',
                primaryLight: '#64b5f6',
                primaryDark: '#1976d2',
                secondary: '#03dac6',
                secondaryLight: '#4dd0e1',
                accent: '#40c4ff',
            },
            dark: {
                primary: '#64b5f6',
                primaryLight: '#90caf9',
                primaryDark: '#42a5f5',
                secondary: '#4dd0e1',
                secondaryLight: '#80deea',
                accent: '#40c4ff',
            }
        },
        green: {
            name: 'Nature Green',
            light: {
                primary: '#4caf50',
                primaryLight: '#81c784',
                primaryDark: '#388e3c',
                secondary: '#8bc34a',
                secondaryLight: '#aed581',
                accent: '#64dd17',
            },
            dark: {
                primary: '#81c784',
                primaryLight: '#a5d6a7',
                primaryDark: '#66bb6a',
                secondary: '#aed581',
                secondaryLight: '#c8e6c9',
                accent: '#64dd17',
            }
        },
        orange: {
            name: 'Sunset Orange',
            light: {
                primary: '#ff9800',
                primaryLight: '#ffb74d',
                primaryDark: '#f57c00',
                secondary: '#ff5722',
                secondaryLight: '#ff8a65',
                accent: '#ff6f00',
            },
            dark: {
                primary: '#ffb74d',
                primaryLight: '#ffcc02',
                primaryDark: '#ffa726',
                secondary: '#ff8a65',
                secondaryLight: '#ffab91',
                accent: '#ff6f00',
            }
        }
    };

    // Load saved theme preferences on initialization
    useEffect(() => {
        const savedMode = localStorage.getItem('themeMode');
        const savedVariant = localStorage.getItem('themeVariant');
        
        if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
            setMode(savedMode);
        }
        
        if (savedVariant && themeVariants[savedVariant]) {
            setThemeVariant(savedVariant);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Helper function to convert hex to rgb
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '0, 0, 0';
    };

    // Common color palette for both Tailwind and MUI
    const getColorPalette = (currentMode, variant) => {
        const variantColors = themeVariants[variant][currentMode];
        return {
            [currentMode]: {
                ...variantColors,
                bgDefault: currentMode === 'light' ? '#fafafa' : '#121212',
                bgPaper: currentMode === 'light' ? '#ffffff' : '#1e1e1e',
                textPrimary: currentMode === 'light' ? '#212121' : '#ffffff',
                textSecondary: currentMode === 'light' ? '#757575' : '#b0b0b0',
                navbarBg: currentMode === 'light' ? '#ffffff' : '#1e1e1e',
                buttonHover: currentMode === 'light' ? 
                    `rgba(${hexToRgb(variantColors.primary)}, 0.08)` : 
                    `rgba(${hexToRgb(variantColors.primary)}, 0.15)`,
            }
        };
    };

    const colorPalette = getColorPalette(mode, themeVariant);

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
        localStorage.setItem('themeVariant', themeVariant);
    }, [mode, themeVariant]);

    // Toggle between light and dark modes
    const toggleTheme = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    // Change theme variant
    const changeThemeVariant = (variant) => {
        setThemeVariant(variant);
    };

    // Get current MUI theme
    const muiTheme = getMuiTheme(mode);

    // Provide the current theme object and toggle function
    return (
        <ThemeContext.Provider
            value={{
                theme: mode,
                themeVariant,
                themeVariants,
                colors: tailwindThemes[mode],
                colorValues: colorPalette[mode], // Provide direct color values for MUI styling
                toggleTheme,
                changeThemeVariant,
                muiTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};