import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Rating } from '@mui/material';
import { ThemeContext } from '../../../context/ThemeContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../../../context/CartContext';
// Update path to use the general placeholder image
import defaultProductImage from '../../../assets/images/placeholder.webp';

function ProductCard({ product }) {
    const { theme, colorValues } = useContext(ThemeContext);
    const { cartItems, setCartItems } = useCart();
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate();

    const addToCart = (e, product) => {
        // Stop event propagation to prevent navigation when clicking the button
        e.stopPropagation();

        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);
        if (existingItemIndex >= 0) {
            const newCartItems = [...cartItems];
            newCartItems[existingItemIndex].quantity = (newCartItems[existingItemIndex].quantity || 1) + 1;
            setCartItems(newCartItems);
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
    };

    const handleCardClick = () => {
        navigate(`/products/${product.id}`);
    };

    return (
        <Card
            onClick={handleCardClick}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                cursor: 'pointer',
                '&:hover': {
                    '& .product-title': {
                        color: colorValues.primary
                    }
                },
                transition: 'transform 0.2s',
            }}
        >
            <CardMedia
                component="img"
                height="200"
                image={imageError ? defaultProductImage : product.image}
                alt={product.name}
                onError={() => setImageError(true)}
                sx={{
                    borderRadius: '8px',
                    objectFit: 'cover',
                }}
            />
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography
                    variant="h6"
                    className="product-title"
                    sx={{
                        fontWeight: 500,
                        mb: 1,
                        color: colorValues.textPrimary,
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}
                >
                    {product.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating
                        value={product.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                        sx={{ color: colorValues.primary }}
                    />
                    <Typography variant="body2" sx={{ ml: 1, color: colorValues.textSecondary }}>
                        ({product.rating})
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colorValues.primary }}>
                    ${product.price.toFixed(2)}
                </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={(e) => addToCart(e, product)}
                    sx={{
                        backgroundColor: colorValues.primary,
                        color: '#ffffff',
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: theme === 'dark' ? '0 4px 6px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
                        '&:hover': {
                            backgroundColor: colorValues.primaryDark,
                            boxShadow: theme === 'dark' ? '0 6px 8px rgba(0,0,0,0.5)' : '0 4px 6px rgba(0,0,0,0.2)',
                        },
                        py: 1,
                        zIndex: 2, // Ensure button is above card for clicks
                    }}
                >
                    Add to Cart
                </Button>
            </CardActions>
        </Card>
    );
}

export default ProductCard;