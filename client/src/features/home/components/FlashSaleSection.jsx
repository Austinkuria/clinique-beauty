// client/src/features/home/components/FlashSaleSection.jsx
// Full-width Flash Sale section with uniform card dimensions and theme-aligned color scheme

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    LinearProgress,
    Chip,
    Paper,
    Stack
} from '@mui/material';
import {
    FlashOn as FlashIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useTheme } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/helpers';

export default function FlashSaleSection({ flashSale }) {
    const { addToCart } = useCart();
    const { colorValues } = useTheme();
    const [timeLeft, setTimeLeft] = useState({ hours: '02', minutes: '45', seconds: '18' });

    const endsAt = flashSale?.endsAt;
    const items = flashSale?.items || [];

    useEffect(() => {
        if (!endsAt) return;

        const updateTimer = () => {
            const difference = new Date(endsAt).getTime() - new Date().getTime();
            if (difference <= 0) {
                setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
                return;
            }

            const totalHours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({
                hours: String(totalHours).padStart(2, '0'),
                minutes: String(minutes).padStart(2, '0'),
                seconds: String(seconds).padStart(2, '0')
            });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endsAt]);

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <Box sx={{ py: 3, backgroundColor: colorValues.bgDefault }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 3 },
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: colorValues.bgPaper
                    }}
                >
                    {/* Flash Sale Header Bar */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            pb: 2,
                            mb: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: colorValues.primary,
                                    color: '#ffffff'
                                }}
                            >
                                <FlashIcon fontSize="small" />
                            </Box>
                            <Typography variant="h5" component="h3" sx={{ fontWeight: 800, color: colorValues.textPrimary }}>
                                Flash Sale
                            </Typography>

                            {/* Live Countdown Timer Digits */}
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: { xs: 0, sm: 2 } }}>
                                <Typography variant="caption" sx={{ color: colorValues.textSecondary, fontWeight: 600, mr: 0.5 }}>
                                    Ends in:
                                </Typography>
                                <Box sx={{ backgroundColor: colorValues.primary, color: '#ffffff', px: 1, py: 0.4, borderRadius: 1, fontWeight: 700, fontSize: '0.85rem' }}>
                                    {timeLeft.hours}
                                </Box>
                                <Typography sx={{ fontWeight: 700, color: colorValues.textPrimary }}>:</Typography>
                                <Box sx={{ backgroundColor: colorValues.primary, color: '#ffffff', px: 1, py: 0.4, borderRadius: 1, fontWeight: 700, fontSize: '0.85rem' }}>
                                    {timeLeft.minutes}
                                </Box>
                                <Typography sx={{ fontWeight: 700, color: colorValues.textPrimary }}>:</Typography>
                                <Box sx={{ backgroundColor: colorValues.primary, color: '#ffffff', px: 1, py: 0.4, borderRadius: 1, fontWeight: 700, fontSize: '0.85rem' }}>
                                    {timeLeft.seconds}
                                </Box>
                            </Stack>
                        </Stack>

                        <Button
                            component={RouterLink}
                            to="/products"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                color: colorValues.primary,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                            }}
                        >
                            View More
                        </Button>
                    </Box>

                    {/* Uniform Dimension Deals Grid */}
                    <Grid container spacing={2}>
                        {items.slice(0, 6).map((item) => {
                            const claimed = item.claimedPercent || 65;
                            const discount = item.discountPercent || 25;
                            const displayPrice = item.salePrice || item.price;
                            const original = item.originalPrice || Math.round(Number(item.price) * 1.3);

                            return (
                                <Grid item key={item.id} xs={6} sm={4} md={2} sx={{ display: 'flex' }}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            backgroundColor: colorValues.bgPaper,
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                                            }
                                        }}
                                    >
                                        {/* Discount Badge */}
                                        <Chip
                                            label={`-${discount}%`}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                backgroundColor: colorValues.primary,
                                                color: '#ffffff',
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                height: 22,
                                                zIndex: 2
                                            }}
                                        />

                                        <CardMedia
                                            component="img"
                                            image={item.image}
                                            alt={item.name}
                                            sx={{
                                                height: 180,
                                                width: '100%',
                                                objectFit: 'cover',
                                                backgroundColor: colorValues.bgDefault
                                            }}
                                        />

                                        <CardContent
                                            sx={{
                                                p: 1.5,
                                                flexGrow: 1,
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                component={RouterLink}
                                                to={`/product/${item.id}`}
                                                sx={{
                                                    color: colorValues.textPrimary,
                                                    textDecoration: 'none',
                                                    fontWeight: 600,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    minHeight: 40,
                                                    maxHeight: 40,
                                                    lineHeight: 1.3,
                                                    mb: 1,
                                                    '&:hover': { color: colorValues.primary }
                                                }}
                                            >
                                                {item.name}
                                            </Typography>

                                            <Box sx={{ mt: 'auto', pt: 1 }}>
                                                {/* Deal Price */}
                                                <Typography variant="subtitle1" sx={{ color: colorValues.primary, fontWeight: 800, lineHeight: 1.1 }}>
                                                    {formatCurrency(displayPrice)}
                                                </Typography>

                                                {/* Strike-through original price */}
                                                <Typography variant="caption" sx={{ color: colorValues.textSecondary, textDecoration: 'line-through' }}>
                                                    {formatCurrency(original)}
                                                </Typography>

                                                {/* Stock Claim Progress Meter */}
                                                <Box sx={{ mt: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={claimed}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: 'rgba(0,0,0,0.06)',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: colorValues.primary
                                                            }
                                                        }}
                                                    />
                                                    <Typography variant="caption" sx={{ color: colorValues.textSecondary, fontSize: '0.7rem', fontWeight: 600, mt: 0.5, display: 'block' }}>
                                                        {claimed}% claimed
                                                    </Typography>
                                                </Box>

                                                <Button
                                                    fullWidth
                                                    size="small"
                                                    variant="contained"
                                                    onClick={() => addToCart(item, 1)}
                                                    sx={{
                                                        mt: 1.5,
                                                        backgroundColor: colorValues.primary,
                                                        color: '#ffffff',
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        fontSize: '0.75rem',
                                                        py: 0.6,
                                                        '&:hover': { backgroundColor: colorValues.primaryDark }
                                                    }}
                                                >
                                                    Claim Deal
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
}
