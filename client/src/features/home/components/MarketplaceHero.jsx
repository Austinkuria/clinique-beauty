// client/src/features/home/components/MarketplaceHero.jsx
// Full-width multi-vendor hero with dynamic category taxonomy and edge-to-edge layout

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    List,
    ListItem,
    ListItemButton,
    Typography,
    Button,
    Paper,
    Chip,
    IconButton
} from '@mui/material';
import {
    ArrowBackIosNew as PrevIcon,
    ArrowForwardIos as NextIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useCategories } from '../../../context/CategoryContext';
import { useTheme } from '../../../context/ThemeContext';

export default function MarketplaceHero({ banners = [], sidePromos = [] }) {
    const { categories } = useCategories();
    const { colorValues } = useTheme();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto rotate banners every 5 seconds
    useEffect(() => {
        if (!banners || banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners]);

    const activeBanner = banners[currentSlide] || banners[0];

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const HERO_HEIGHT = 420;

    return (
        <Box sx={{ py: 1.5, backgroundColor: colorValues.bgDefault, width: '100%' }}>
            <Container maxWidth={false} sx={{ px: { xs: 1, sm: 1.5, md: 2 }, width: '100%' }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: sidePromos.length > 0 ? '220px 1fr' : '220px 1fr',
                            lg: sidePromos.length > 0 ? '240px 1fr 280px' : '240px 1fr'
                        },
                        gap: 1.5,
                        width: '100%',
                        alignItems: 'stretch'
                    }}
                >
                    {/* Left Category Navigation Sidebar (Clean typography without redundant icons) */}
                    <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%', height: HERO_HEIGHT }}>
                        <Paper
                            elevation={0}
                            sx={{
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: colorValues.bgPaper,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5, backgroundColor: colorValues.primary, color: '#ffffff' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.82rem' }}>
                                    All Categories
                                </Typography>
                            </Box>
                            <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                {(categories || []).map((cat) => (
                                    <ListItem key={cat.id || cat.name} disablePadding divider>
                                        <ListItemButton
                                            component={RouterLink}
                                            to={`/products/${cat.slug || cat.name.toLowerCase()}`}
                                            sx={{
                                                py: 1.2,
                                                px: 2,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                    color: colorValues.primary
                                                }
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    color: 'inherit'
                                                }}
                                            >
                                                {cat.name}
                                            </Typography>
                                            <ChevronRightIcon sx={{ fontSize: '0.95rem', color: colorValues.textSecondary }} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Box>

                    {/* Central Hero Carousel (Takes 1fr, expanding to push side promos flush to the right) */}
                    <Box sx={{ width: '100%', height: HERO_HEIGHT, minWidth: 0 }}>
                        {activeBanner && (
                            <Paper
                                elevation={0}
                                sx={{
                                    position: 'relative',
                                    height: '100%',
                                    width: '100%',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundImage: `url(${activeBanner.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {/* Solid translucent dark overlay for typography contrast */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: 'rgba(15, 23, 42, 0.6)'
                                    }}
                                />

                                <Box sx={{ position: 'relative', zIndex: 2, px: { xs: 3, md: 5 }, maxWidth: 640, color: '#ffffff' }}>
                                    {activeBanner.badge && (
                                        <Chip
                                            label={activeBanner.badge}
                                            size="small"
                                            sx={{
                                                backgroundColor: colorValues.primary,
                                                color: '#ffffff',
                                                fontWeight: 800,
                                                mb: 1.5,
                                                textTransform: 'uppercase',
                                                fontSize: '0.72rem'
                                            }}
                                        />
                                    )}
                                    <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.2, fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' } }}>
                                        {activeBanner.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 3, color: '#e2e8f0', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                                        {activeBanner.subtitle}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        component={RouterLink}
                                        to={activeBanner.link || '/products'}
                                        sx={{
                                            backgroundColor: colorValues.primary,
                                            color: '#ffffff',
                                            px: 3.5,
                                            py: 1.1,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            borderRadius: 1,
                                            '&:hover': {
                                                backgroundColor: colorValues.primaryDark
                                            }
                                        }}
                                    >
                                        {activeBanner.ctaText || 'Shop Now'}
                                    </Button>
                                </Box>

                                {/* Carousel Navigation Controls */}
                                {banners.length > 1 && (
                                    <>
                                        <IconButton
                                            onClick={handlePrev}
                                            aria-label="Previous Slide"
                                            sx={{
                                                position: 'absolute',
                                                left: 14,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                                                color: '#ffffff',
                                                '&:hover': { backgroundColor: '#0f172a' }
                                            }}
                                            size="small"
                                        >
                                            <PrevIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={handleNext}
                                            aria-label="Next Slide"
                                            sx={{
                                                position: 'absolute',
                                                right: 14,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                                                color: '#ffffff',
                                                '&:hover': { backgroundColor: '#0f172a' }
                                            }}
                                            size="small"
                                        >
                                            <NextIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </Paper>
                        )}
                    </Box>

                    {/* Right Hand Promotional Side Tiles (Pushed flush to the right edge) */}
                    {sidePromos.length > 0 && (
                        <Box
                            sx={{
                                display: { xs: 'none', lg: 'flex' },
                                flexDirection: 'column',
                                gap: 1.5,
                                width: '100%',
                                height: HERO_HEIGHT
                            }}
                        >
                            {sidePromos.map((promo) => (
                                <Paper
                                    key={promo.id}
                                    elevation={0}
                                    component={RouterLink}
                                    to={promo.link}
                                    sx={{
                                        flex: 1,
                                        height: (HERO_HEIGHT - 12) / 2,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        textDecoration: 'none',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        backgroundImage: `url(${promo.image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        p: 2,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor: 'rgba(15, 23, 42, 0.55)'
                                        }}
                                    />
                                    <Box sx={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                backgroundColor: colorValues.primary,
                                                color: '#ffffff',
                                                px: 1,
                                                py: 0.3,
                                                borderRadius: 0.5,
                                                fontWeight: 700,
                                                fontSize: '0.72rem'
                                            }}
                                        >
                                            {promo.tag}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0.8, color: '#ffffff', lineHeight: 1.2 }}>
                                            {promo.title}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    );
}
