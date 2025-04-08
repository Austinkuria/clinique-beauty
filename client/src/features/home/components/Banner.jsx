import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function Banner() {
    const [isVisible, setIsVisible] = useState(true);
    const { theme, colors } = useContext(ThemeContext);
    const [currentPromo, setCurrentPromo] = useState(0);

    // Banner promotion messages
    const promos = [
        { text: "FREE SHIPPING on orders over $50", link: "/products" },
        { text: "NEW ARRIVALS: Summer Collection 2023", link: "/collections/summer" },
        { text: "Limited Time: 20% OFF all skincare products", link: "/products/skincare" },
    ];

    // Rotate through promos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPromo(prev => (prev + 1) % promos.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Debugging logs for theme and colors
    useEffect(() => {
        console.log("Banner component mounted with theme:", theme);
        console.log("Colors available:", colors);
        console.log("Accent color class:", colors?.accent);
    }, [theme, colors]);

    if (!isVisible) return null;

    console.log("Theme context values:", { theme, colors }); // Debugging log

    // Try applying the color class directly for debugging
    const bannerStyle = {
        backgroundColor: theme === 'light' ? '#ec4899' : '#be185d' // Pink-500 and Pink-700 hex values
    };

    return (
        <div
            className={`relative w-full py-2 text-center transition-all duration-300`}
            style={bannerStyle}
            data-theme-mode={theme}
            data-accent-class={colors?.accent}
        >
            <div className="container mx-auto px-4 flex items-center justify-center">
                <div className="animate-pulse">
                    <Link
                        to={promos[currentPromo].link}
                        className={`font-medium hover:underline inline-flex items-center text-white`}
                    >
                        <span className="mr-2 text-lg md:text-xl">✨</span>
                        <span className="text-sm sm:text-base md:text-lg font-semibold tracking-wide">
                            {promos[currentPromo].text}
                        </span>
                        <span className="ml-2 text-xs font-bold hidden sm:inline-block bg-white bg-opacity-20 
                                       px-2 py-1 rounded transition-all hover:bg-opacity-30 
                                       flex items-center">
                            SHOP NOW
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </span>
                    </Link>
                </div>

                <IconButton
                    size="small"
                    aria-label="close"
                    onClick={() => setIsVisible(false)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        color: 'white',
                        padding: '4px',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>
        </div>
    );
}

export default Banner;
