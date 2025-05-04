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
    CircularProgress // Import CircularProgress for loading state
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

    useEffect(() => {
        const fetchFeatured = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch all products (or modify API if you have a specific 'featured' endpoint)
                const allProducts = await api.getProducts();
                // Select the first 3 products as featured (or implement other logic)
                setFeaturedProducts(allProducts.slice(0, 3));
            } catch (err) {
                console.error("Error fetching featured products:", err);
                setError(err.message || 'Failed to load featured products.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, [api]); // Dependency array includes api

    // Remove the hardcoded addToCart function, use context's directly

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
                mt: { xs: -2, md: -4 }, // Negative top margin to reduce space
                pt: { xs: 3, md: 5 },   // Add some padding inside to maintain internal spacing
                py: 8,
                bgcolor: 'background.default'
            }}
        >
            <Container>
                <Typography
                    variant="h3"
                    component="h2"
                    align="center"
                    sx={{
                        mb: 6,
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            width: '60px',
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
                    <Grid container spacing={4}>
                        {/* Map over featuredProducts state */}
                        {featuredProducts.map((product) => (
                            <Grid item key={product.id} xs={12} sm={6} md={4}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: 6
                                        }
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        // Use product.image, provide fallback
                                        image={product.image || defaultProductImage}
                                        alt={product.name}
                                        onError={handleImageError} // Add error handler
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h5" component="h3">
                                            {product.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap> {/* Use noWrap to prevent long descriptions */}
                                            {product.description}
                                        </Typography>
                                        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                            {/* Ensure price exists and is a number */}
                                            ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="medium"
                                            component={RouterLink}
                                            // Link to the correct product detail page URL structure
                                            to={`/product/${product.id}`}
                                            fullWidth
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            size="medium"
                                            color="primary"
                                            variant="contained"
                                            fullWidth
                                            onClick={() => handleAddToCart(product)}
                                            disabled={addingItems[product.id]} // Disable only if THIS product is being added
                                        >
                                            {addingItems[product.id] ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                                                    Adding...
                                                </Box>
                                            ) : (
                                                'Add to Cart'
                                            )}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                 {!loading && !error && featuredProducts.length === 0 && (
                    <Typography align="center" sx={{ my: 4 }}>
                        No featured products available at the moment.
                    </Typography>
                )}
            </Container>
        </Box>
    );
}

export default FeaturedProducts;
