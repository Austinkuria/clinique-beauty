import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Rating } from '@mui/material';
import { ThemeContext } from '../../../context/ThemeContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../../../context/CartContext'; // Import useCart
// Update path to use the general placeholder image
import defaultProductImage from '../../../assets/images/placeholder.webp';

function ProductCard({ product }) {
    const { theme, colorValues } = useContext(ThemeContext);
    // Get addToCart and loading state from CartContext
    const { addToCart: contextAddToCart, loading: cartLoading } = useCart();
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate();

    // Remove the local addToCart function

    const handleAddToCartClick = (e) => {
        // Stop event propagation to prevent navigation when clicking the button
        e.stopPropagation();
        // Call the context's addToCart function, passing the product and quantity 1
        // Assuming product object has all necessary details (id, name, price, image, etc.)
        contextAddToCart(product, 1);
    };

    const handleImageError = (e) => {
        console.log("[ProductCard] Image failed to load, using default image");
        e.target.src = defaultProductImage;
    };

    const handleCardClick = () => {
        // Navigate to the specific product detail page
        navigate(`/product/${product.id}`); // Use /product/:id route
    };

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
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
                    // Use product.image directly, handle error with state
                    image={product.image || defaultProductImage}
                    alt={product.name}
                    onError={handleImageError}
                    sx={{
                        objectFit: 'contain',
                        p: 1,
                        backgroundColor: 'transparent'
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
                            // Use product.rating directly
                            value={product.rating || 0} // Default to 0 if rating is missing
                            precision={0.1}
                            readOnly
                            size="small"
                            sx={{ color: colorValues.primary }}
                        />
                        <Typography variant="body2" sx={{ ml: 1, color: colorValues.textSecondary }}>
                            {/* Display rating value */}
                            ({product.rating || 0})
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colorValues.primary }}>
                        {/* Ensure price is a number before calling toFixed */}
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                    </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ShoppingCartIcon />}
                        // Use the new handler
                        onClick={handleAddToCartClick}
                        // Disable button if cart is loading
                        disabled={cartLoading}
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
                        {/* Show loading state */}
                        {cartLoading ? 'Adding...' : 'Add to Cart'}
                    </Button>
                </CardActions>
            </Card>
        </Box>
    );
}

export default ProductCard;