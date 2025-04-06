import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    // Theme definitions
    const themes = {
        light: {
            background: 'bg-gradient-to-r from-pink-50 to-white', // Main background
            navbarBg: 'bg-white', // Navbar background (changed to solid white for better contrast)
            sectionBg: 'bg-white', // Section background
            textPrimary: 'text-gray-900', // Main text
            textSecondary: 'text-gray-600', // Subtext
            navbarTextPrimary: 'text-pink-600', // Navbar primary text (more visible)
            navbarTextSecondary: 'text-gray-700', // Navbar secondary text (darker)
            textHover: 'hover:text-pink-700', // Hover text color (changed to match branding)
            buttonBg: 'bg-pink-600', // Button background
            buttonText: 'text-white', // Button text
            buttonHoverBg: 'hover:bg-pink-700', // Button hover
            accent: 'bg-pink-500', // Accent color (e.g., banners)
            shadow: 'shadow-md', // Default shadow
        },
        dark: {
            background: 'bg-gray-900', // Main background
            navbarBg: 'bg-gray-800', // Navbar background (simplified from gradient)
            sectionBg: 'bg-gray-800', // Section background
            textPrimary: 'text-white', // Main text
            textSecondary: 'text-gray-300', // Subtext
            navbarTextPrimary: 'text-pink-300', // Navbar primary text (brighter in dark mode)
            navbarTextSecondary: 'text-gray-200', // Navbar secondary text (lighter)
            textHover: 'hover:text-pink-400', // Hover text color
            buttonBg: 'bg-pink-500', // Button background
            buttonText: 'text-white', // Button text
            buttonHoverBg: 'hover:bg-pink-600', // Button hover
            accent: 'bg-pink-600', // Accent color (e.g., banners)
            shadow: 'shadow-lg', // Slightly stronger shadow in dark mode
        },
    };

    // Load saved theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    // Save theme to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Toggle between light and dark modes
    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    // Provide the current theme object and toggle function
    return (
        <ThemeContext.Provider
            value={{ theme, colors: themes[theme], toggleTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
};