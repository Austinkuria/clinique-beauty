import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function Banner() {
    const [isVisible, setIsVisible] = useState(true);
    const { theme } = useContext(ThemeContext);
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

    if (!isVisible) return null;

    return (
        <div className={`relative w-full py-2 text-center transition-all duration-300 ${theme === 'light' ? 'bg-pink-600 text-white' : 'bg-pink-800 text-pink-100'
            }`}>
            <div className="container mx-auto px-4 flex items-center justify-center">
                <div className="animate-fade-in-down">
                    <Link
                        to={promos[currentPromo].link}
                        className="font-medium hover:underline inline-flex items-center"
                    >
                        <span className="mr-2">✨</span>
                        {promos[currentPromo].text}
                        <span className="ml-2 text-xs font-bold">SHOP NOW →</span>
                    </Link>
                </div>

                <IconButton
                    size="small"
                    aria-label="close"
                    onClick={() => setIsVisible(false)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        color: 'inherit',
                        padding: '4px'
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>
        </div>
    );
}

export default Banner;
