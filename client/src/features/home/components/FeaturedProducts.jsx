import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Box,
    CircularProgress, // Import CircularProgress for loading state
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useCart } from '../../../context/CartContext';
import { useApi } from '../../../api/apiClient'; // Import useApi
import defaultProductImage from '../../../assets/images/placeholder.webp'; // Import a fallback image

function FeaturedProducts() {
    const { addToCart } = useCart(); // Use addToCart from context
    const api = useApi(); // Get API methods
    const [featuredProducts, setFeaturedProducts] = useState([]); // State for products
    const [loading, setLoading] = useState(true); // State for loading
    const [error, setError] = useState(null); // State for errors
    const [addingItems, setAddingItems] = useState({}); // Track which items are being added
    const theme = useTheme();
    const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchFeatured = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simplified fetching approach
                const allProducts = await api.getProducts();
                const featuredCount = Math.min(allProducts.length, 8);
                setFeaturedProducts(allProducts.slice(0, featuredCount));
            } catch (err) {
                console.error("Error fetching featured products:", err);
                setError(err.message || 'Failed to load featured products.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
        
        // Remove the resize listener to prevent unnecessary re-fetches
    }, [api]); // Dependency array includes api

    // Handle image errors
    const handleImageError = (e) => {
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = defaultProductImage;
    };

    const handleAddToCart = (product) => {
        // Set this specific product as being added
        setAddingItems(prev => ({
            ...prev,
            [product.id]: true
        }));
        
        // Call the context's addToCart function
        addToCart(product, 1)
            .finally(() => {
                // Reset loading state after operation completes
                setTimeout(() => {
                    setAddingItems(prev => ({
                        ...prev,
                        [product.id]: false
                    }));
                }, 500); // Small delay to prevent UI flicker
            });
    };

    return (
        <Box
            sx={{
                pt: { xs: 4, sm: 5, md: 6 },
                pb: { xs: 4, sm: 6, md: 8 },
                bgcolor: 'background.default',
                width: '100%',
            }}
        >
            {/* Use a fixed-width container without custom padding */}
            <Container maxWidth="lg">
                <Typography
                    variant="h3"
                    component="h2"
                    align="center"
                    sx={{
                        mb: { xs: 3, sm: 4, md: 6 },
                        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            width: { xs: '40px', sm: '50px', md: '60px' },
                            height: '3px',
                            bgcolor: 'primary.main',
                            bottom: -2,
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }
                    }}
                >
                    Featured Products
                </Typography>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Typography color="error" align="center" sx={{ my: 4 }}>
                        Error: {error}
                    </Typography>
                )}

                {!loading && !error && (
                    <Grid 
                        container 
                        spacing={2}
                        alignItems="stretch"
                        sx={{ 
                            width: '100%', 
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr', // 1 card per row on extra small screens
                                sm: 'repeat(2, 1fr)', // 2 cards per row on small screens
                                md: 'repeat(3, 1fr)', // Changed to 3 cards per row on medium screens
                                lg: 'repeat(4, 1fr)' // 4 cards only on large screens
                            },
                            gap: '24px 16px', // Increased gap for better spacing
                            mb: 4 // Increased margin bottom for spacing
                        }}
                    >
                        {featuredProducts.map((product) => (
                            <Card
                                key={product.id}
                                elevation={2}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    mb: 2.5, // Increased margin bottom for each card
                                    // Simple hover effect
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 4
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    sx={{
                                        height: 150,
                                        objectFit: 'cover'
                                    }}
                                    image={product.image || defaultProductImage}
                                    alt={product.name}
                                    onError={handleImageError}
                                />
                                <CardContent sx={{ 
                                    flexGrow: 1, 
                                    p: 1.25, // Reduce padding even more
                                    '&:last-child': { pb: 1.25 } // Override MUI's default
                                }}>
                                    <Typography 
                                        variant="subtitle1" 
                                        component="h3"
                                        sx={{ 
                                            fontWeight: 600, 
                                            mb: 0.5,
                                            fontSize: '0.9rem', // Even smaller title
                                            lineHeight: 1.3
                                        }}
                                    >
                                        {product.name}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontSize: '0.8rem', // Smaller text
                                            lineHeight: 1.4
                                        }}
                                    >
                                        {product.description}
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        color="primary" 
                                        sx={{ mt: 2 }}
                                    >
                                        Ksh {typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                    <Button 
                                        size="small" 
                                        component={RouterLink} 
                                        to={`/product/${product.id}`}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        size="small"
                                        color="primary"
                                        variant="contained"
                                        onClick={() => handleAddToCart(product)}
                                        disabled={addingItems[product.id]}
                                    >
                                        {addingItems[product.id] ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                                Adding...
                                            </Box>
                                        ) : (
                                            'Add to Cart'
                                        )}
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Grid>
                )}
                {!loading && !error && featuredProducts.length === 0 && (
                    <Typography align="center" sx={{ my: 4 }}>
                        No featured products available at the moment.
                    </Typography>
                )}
                
                {/* "View All Products" button at bottom */}
                {!loading && !error && featuredProducts.length > 0 && (
                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <Button 
                            component={RouterLink} 
                            to="/products" 
                            variant="outlined" 
                            color="primary"
                            size={isXsScreen ? "medium" : "large"}
                        >
                            View All Products
                        </Button>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default FeaturedProducts;
