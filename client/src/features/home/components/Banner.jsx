import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../../context/ThemeContext';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function Banner() {
    const [isVisible, setIsVisible] = useState(true);
    const { theme } = useContext(ThemeContext);
    const [currentPromo, setCurrentPromo] = useState(0);

    // Banner promotion messages
    const promos = [
        { text: "FREE SHIPPING on orders over Ksh3,500", link: "/products" },
        { text: "NEW ARRIVALS: Summer Collection 2025", link: "/collections/summer" },
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
        <Box
            sx={{
                width: '100%',
                py: 0.7,
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.3s ease',
                bgcolor: theme === 'light' ? '#ec4899' : '#be185d', // Pink-500 and Pink-700
                color: 'white',
            }}
        >
            <Box
                sx={{
                    maxWidth: 'lg',
                    mx: 'auto',
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box sx={{ animation: 'pulse 2s infinite' }}>
                    <Link
                        to={promos[currentPromo].link}
                        style={{
                            textDecoration: 'none',
                            color: 'white',
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            component="span"
                            sx={{ mr: 1, fontSize: '1rem' }}
                        >
                            ✨
                        </Typography>

                        <Typography
                            component="span"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 500,
                                letterSpacing: 0.5,
                            }}
                        >
                            {promos[currentPromo].text}
                        </Typography>

                        <Box
                            component="span"
                            sx={{
                                ml: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                borderRadius: 1,
                                px: 1,
                                py: 0.2,
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                }
                            }}
                        >
                            SHOP NOW
                            <ArrowForwardIosIcon sx={{ ml: 0.5, fontSize: '0.6rem' }} />
                        </Box>
                    </Link>
                </Box>

                <IconButton
                    size="small"
                    aria-label="close"
                    onClick={() => setIsVisible(false)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        color: 'white',
                        p: '2px',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)'
                        }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
}

export default Banner;
