import React, { useContext, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Rating,
    Chip,
    CircularProgress,
    Stack
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    Verified as VerifiedIcon,
    Storefront as StorefrontIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/helpers';
import { useCart } from '../../../context/CartContext';
import defaultProductImage from '../../../assets/images/placeholder.webp';

function ProductCard({ product }) {
    const { colorValues } = useContext(ThemeContext);
    const { addToCart } = useCart();
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const navigate = useNavigate();

    if (!product) return null;

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        setIsAddingToCart(true);
        addToCart(product, 1).finally(() => {
            setTimeout(() => {
                setIsAddingToCart(false);
            }, 500);
        });
    };

    const handleImageError = (e) => {
        e.currentTarget.src = defaultProductImage;
    };

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    const isOfficial = product.id % 2 === 0;
    const ratingValue = Number(product.rating) || 4.5;
    const reviewCount = product.reviews_count || (10 + (product.id * 7) % 85);

    return (
        <Card
            onClick={handleCardClick}
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
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
                    '& .product-title': {
                        color: colorValues.primary
                    }
                }
            }}
        >
            <Box sx={{ position: 'relative', width: '100%', pt: '100%', backgroundColor: colorValues.bgDefault }}>
                <CardMedia
                    component="img"
                    image={product.image || defaultProductImage}
                    alt={product.name}
                    onError={handleImageError}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column' }}>
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

                {/* Clamped Product Title with strict 2-line height */}
                <Typography
                    variant="subtitle2"
                    className="product-title"
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        lineHeight: 1.3,
                        mb: 0.8,
                        color: colorValues.textPrimary,
                        minHeight: 38,
                        maxHeight: 38,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        transition: 'color 0.2s'
                    }}
                >
                    {product.name}
                </Typography>

                {/* Rating Stars and Count */}
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                    <Rating
                        value={ratingValue}
                        precision={0.1}
                        readOnly
                        size="small"
                        sx={{ fontSize: '0.85rem', color: colorValues.primary }}
                    />
                    <Typography variant="caption" sx={{ color: colorValues.textSecondary, fontSize: '0.72rem' }}>
                        ({reviewCount})
                    </Typography>
                </Stack>

                {/* Price */}
                <Box sx={{ mt: 'auto', pt: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: colorValues.primary, fontSize: '1.05rem' }}>
                        {formatCurrency(product.price)}
                    </Typography>
                </Box>
            </CardContent>

            <CardActions sx={{ p: 1.5, pt: 0 }}>
                <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    startIcon={!isAddingToCart && <ShoppingCartIcon sx={{ fontSize: '0.85rem !important' }} />}
                    onClick={handleAddToCartClick}
                    disabled={isAddingToCart}
                    sx={{
                        backgroundColor: colorValues.primary,
                        color: '#ffffff',
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        py: 0.7,
                        '&:hover': {
                            backgroundColor: colorValues.primaryDark
                        }
                    }}
                >
                    {isAddingToCart ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={16} sx={{ color: '#ffffff', mr: 1 }} />
                            Adding...
                        </Box>
                    ) : (
                        'Add to Cart'
                    )}
                </Button>
            </CardActions>
        </Card>
    );
}

export default ProductCard;
