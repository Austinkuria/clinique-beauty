import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    // Theme definitions
    const themes = {
        light: {
            background: 'bg-gradient-to-r from-pink-50 to-white', // Main background
            sectionBg: 'bg-white', // Section background
            textPrimary: 'text-gray-900', // Main text
            textSecondary: 'text-gray-600', // Subtext
            textHover: 'hover:text-gray-900', // Added hover text color
            buttonBg: 'bg-pink-600', // Button background
            buttonText: 'text-white', // Button text
            buttonHoverBg: 'hover:bg-pink-700', // Button hover
            accent: 'bg-pink-500', // Accent color (e.g., banners)
            shadow: 'shadow-md', // Default shadow
        },
        dark: {
            background: 'bg-gray-900', // Main background
            sectionBg: 'bg-gray-800', // Section background
            textPrimary: 'text-white', // Main text
            textSecondary: 'text-gray-300', // Subtext
            textHover: 'hover:text-white', // Added hover text color
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