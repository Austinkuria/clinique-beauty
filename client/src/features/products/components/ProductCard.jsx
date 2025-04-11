import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Rating } from '@mui/material';
import { ThemeContext } from '../../../context/ThemeContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../../../context/CartContext';

function ProductCard({ product }) {
    const { theme, colorValues } = useContext(ThemeContext);
    const { cartItems, setCartItems } = useCart();

    const addToCart = (product) => {
        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);
        if (existingItemIndex >= 0) {
            const newCartItems = [...cartItems];
            newCartItems[existingItemIndex].quantity = (newCartItems[existingItemIndex].quantity || 1) + 1;
            setCartItems(newCartItems);
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
            }}
        >
            <CardMedia
                component={RouterLink}
                to={`/products/${product.id}`}
                height="200"
                image={product.image}
                alt={product.name}
                sx={{
                    borderRadius: '8px',
                    objectFit: 'cover',
                }}
            />
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to={`/products/${product.id}`}
                    sx={{
                        fontWeight: 500,
                        mb: 1,
                        color: colorValues.textPrimary,
                        textDecoration: 'none',
                        '&:hover': { color: colorValues.primary },
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
                    onClick={() => addToCart(product)}
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
                    }}
                >
                    Add to Cart
                </Button>
            </CardActions>
        </Card>
    );
}

export default ProductCard;