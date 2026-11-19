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
    Stack,
    IconButton
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/helpers';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import defaultProductImage from '../../../assets/images/placeholder.webp';

function ProductCard({ product }) {
    const { colorValues } = useContext(ThemeContext);
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const navigate = useNavigate();

    if (!product) return null;

    const inWishlist = isInWishlist(product.id) || (product.slug && isInWishlist(product.slug));

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        toggleWishlist(product.id || product.slug);
    };

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        setIsAddingToCart(true);
        addToCart(product, 1).finally(() => {
            setTimeout(() => {
                setIsAddingToCart(false);
            }, 500);
        });
    };

    const handleBuyNowClick = (e) => {
        e.stopPropagation();
        setIsBuying(true);
        addToCart(product, 1).finally(() => {
            setIsBuying(false);
            navigate('/checkout');
        });
    };

    const handleImageError = (e) => {
        e.currentTarget.src = defaultProductImage;
    };

    const productIdentifier = product.slug || product.id;

    const handleCardClick = () => {
        navigate(`/product/${productIdentifier}`);
    };

    const numericId = typeof product.id === 'number'
        ? product.id
        : (typeof product.id === 'string' && !isNaN(Number(product.id)))
            ? Number(product.id)
            : Math.abs(String(product.slug || product.uuid || product.name || '1').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));

    const isOfficial = numericId % 2 === 0;
    const ratingValue = (!isNaN(Number(product.rating)) && Number(product.rating) > 0) ? Number(product.rating) : 4.5;
    const reviewCount = (!isNaN(Number(product.reviews_count)) && Number(product.reviews_count) > 0)
        ? Number(product.reviews_count)
        : (10 + (numericId * 7) % 85);

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
                position: 'relative',
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

                {/* Wishlist Button */}
                <IconButton
                    onClick={handleWishlistClick}
                    size="small"
                    aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        color: inWishlist ? colorValues.primary : '#64748b',
                        zIndex: 3,
                        p: 0.6,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                        '&:hover': {
                            backgroundColor: '#ffffff',
                            transform: 'scale(1.1)',
                            color: colorValues.primary
                        },
                        transition: 'transform 0.15s ease'
                    }}
                >
                    {inWishlist ? (
                        <FavoriteIcon sx={{ fontSize: '1.1rem', color: colorValues.primary }} />
                    ) : (
                        <FavoriteBorderIcon sx={{ fontSize: '1.1rem' }} />
                    )}
                </IconButton>
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column' }}>
                {/* Vendor Trust Badge */}
                <Box sx={{ mb: 0.8 }}>
                    {isOfficial ? (
                        <Chip
                            label="Official Store"
                            size="small"
                            sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                backgroundColor: 'rgba(234, 88, 12, 0.12)',
                                color: colorValues.primary,
                                fontWeight: 700,
                                borderRadius: 0.5
                            }}
                        />
                    ) : (
                        <Chip
                            label="Fulfilled by Clinique"
                            size="small"
                            sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
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

            <CardActions sx={{ p: 1.5, pt: 0, gap: 1, display: 'flex' }}>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={!isAddingToCart && <ShoppingCartIcon sx={{ fontSize: '0.8rem !important' }} />}
                    onClick={handleAddToCartClick}
                    disabled={isAddingToCart || isBuying}
                    sx={{
                        flex: 1,
                        borderColor: colorValues.primary,
                        color: colorValues.primary,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        py: 0.6,
                        px: 0.5,
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            borderColor: colorValues.primaryDark,
                            backgroundColor: 'rgba(233, 30, 99, 0.04)'
                        }
                    }}
                >
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleBuyNowClick}
                    disabled={isAddingToCart || isBuying}
                    sx={{
                        flex: 1,
                        backgroundColor: colorValues.primary,
                        color: '#ffffff',
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        py: 0.6,
                        px: 0.5,
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            backgroundColor: colorValues.primaryDark
                        }
                    }}
                >
                    {isBuying ? 'Redirecting...' : 'Buy Now'}
                </Button>
            </CardActions>
        </Card>
    );
}

export default ProductCard;
