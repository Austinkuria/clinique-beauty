// client/src/features/home/components/YouMayAlsoLike.jsx
// Full-width multi-vendor product feed with uniform card geometry and theme-aligned styling

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Paper,
    Chip,
    Rating,
    Stack
} from '@mui/material';
import {
    Verified as VerifiedIcon,
    Storefront as StorefrontIcon,
    ShoppingCart as CartIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { formatCurrency } from '../../../utils/helpers';
import { useCart } from '../../../context/CartContext';
import { useTheme } from '../../../context/ThemeContext';

export default function YouMayAlsoLike({ products = [] }) {
    const { addToCart } = useCart();
    const { colorValues } = useTheme();

    if (!products || products.length === 0) {
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <Typography variant="h5" component="h3" sx={{ fontWeight: 800, color: colorValues.textPrimary }}>
                            You May Also Like
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        {products.map((item, index) => {
                            const isOfficial = index % 3 === 0;
                            const ratingValue = Number(item.rating) || 4.5;
                            const reviews = item.reviews_count || (12 + (index * 7) % 80);

                            return (
                                <Grid item key={item.id} xs={6} sm={4} md={3} lg={2} sx={{ display: 'flex' }}>
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
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.06)'
                                            }
                                        }}
                                    >
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
                                            {/* Vendor Trust Badge */}
                                            <Box sx={{ mb: 0.8 }}>
                                                {isOfficial ? (
                                                    <Chip
                                                        icon={<StorefrontIcon sx={{ fontSize: '0.8rem !important' }} />}
                                                        label="Official Store"
                                                        size="small"
                                                        sx={{
                                                            height: 18,
                                                            fontSize: '0.65rem',
                                                            backgroundColor: 'rgba(234, 88, 12, 0.1)',
                                                            color: colorValues.primary,
                                                            fontWeight: 700,
                                                            borderRadius: 0.5
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<VerifiedIcon sx={{ fontSize: '0.8rem !important' }} />}
                                                        label="Fulfilled by Clinique"
                                                        size="small"
                                                        sx={{
                                                            height: 18,
                                                            fontSize: '0.65rem',
                                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                            color: '#059669',
                                                            fontWeight: 700,
                                                            borderRadius: 0.5
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            {/* Product Title with strict 2-line height clamping */}
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
                                                    mb: 0.8,
                                                    '&:hover': { color: colorValues.primary }
                                                }}
                                            >
                                                {item.name}
                                            </Typography>

                                            {/* Rating and Reviews */}
                                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                                                <Rating value={ratingValue} precision={0.5} size="small" readOnly sx={{ fontSize: '0.85rem' }} />
                                                <Typography variant="caption" sx={{ color: colorValues.textSecondary, fontSize: '0.7rem' }}>
                                                    ({reviews})
                                                </Typography>
                                            </Stack>

                                            {/* Price and Cart Action */}
                                            <Box sx={{ mt: 'auto', pt: 1 }}>
                                                <Typography variant="subtitle1" sx={{ color: colorValues.textPrimary, fontWeight: 800 }}>
                                                    {formatCurrency(item.price)}
                                                </Typography>

                                                <Button
                                                    fullWidth
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<CartIcon sx={{ fontSize: '0.85rem !important' }} />}
                                                    onClick={() => addToCart(item, 1)}
                                                    sx={{
                                                        mt: 1,
                                                        backgroundColor: colorValues.primary,
                                                        color: '#ffffff',
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        fontSize: '0.75rem',
                                                        py: 0.6,
                                                        '&:hover': { backgroundColor: colorValues.primaryDark }
                                                    }}
                                                >
                                                    Add to Cart
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
