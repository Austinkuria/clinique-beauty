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
                // Try to fetch featured products specifically, if available
                try {
                    const featuredData = await api.getFeaturedProducts();
                    setFeaturedProducts(featuredData);
                } catch {
                    // Fallback to getting all products
                    const allProducts = await api.getProducts();
                    // Select the first 3-6 products as featured based on screen size
                    const featuredCount = window.innerWidth < 600 ? 3 : 6;
                    setFeaturedProducts(allProducts.slice(0, featuredCount));
                }
            } catch (err) {
                console.error("Error fetching featured products:", err);
                setError(err.message || 'Failed to load featured products.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
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
                mt: { xs: -1, sm: -2, md: -4 }, // Responsive top margin
                pt: { xs: 2, sm: 3, md: 5 },   // Responsive internal padding
                pb: { xs: 4, sm: 6, md: 8 },
                bgcolor: 'background.default'
            }}
        >
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
                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
                        {/* Map over featuredProducts state with improved responsive grid sizing */}
                        {featuredProducts.map((product) => (
                            <Grid item key={product.id} xs={12} sm={6} md={4} lg={4} 
                                  sx={{ maxWidth: { xs: '100%', sm: '350px', md: '33.33%' } }}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        maxWidth: '100%',
                                        mx: 'auto', // Center the card
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: {
                                                xs: 'none',
                                                sm: 'translateY(-5px)'
                                            },
                                            boxShadow: {
                                                xs: 2, 
                                                sm: 6
                                            }
                                        }
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            height: { xs: '180px', sm: '200px' },
                                            objectFit: 'cover',
                                            objectPosition: 'center'
                                        }}
                                        // Use product.image, provide fallback
                                        image={product.image || defaultProductImage}
                                        alt={product.name}
                                        onError={handleImageError} // Add error handler
                                    />
                                    <CardContent sx={{ 
                                        flexGrow: 1, 
                                        p: { xs: 1.5, sm: 2 },
                                        pb: { xs: 0.5, sm: 1 } // Reduce bottom padding
                                    }}>
                                        <Typography 
                                            gutterBottom 
                                            variant="h5" 
                                            component="h3"
                                            sx={{ 
                                                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
                                                mb: 1
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
                                                textOverflow: 'ellipsis',
                                                height: { xs: '2.5em', sm: '3em' },
                                                mb: 1
                                            }}
                                        >
                                            {product.description}
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            color="primary" 
                                            sx={{ 
                                                mt: 1,
                                                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' } 
                                            }}
                                        >
                                            {/* Ensure price exists and is a number */}
                                            ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ 
                                        p: { xs: 1.5, sm: 2 },
                                        pt: { xs: 0.5, sm: 1 }, // Reduce top padding
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: { xs: 1, sm: 1 },
                                        justifyContent: 'space-between'
                                    }}>
                                        <Button
                                            size="small"
                                            component={RouterLink}
                                            to={`/product/${product.id}`}
                                            sx={{ 
                                                width: { xs: '100%', sm: '48%' },
                                                py: { xs: 0.5, sm: 0.75 }
                                            }}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="contained"
                                            onClick={() => handleAddToCart(product)}
                                            disabled={addingItems[product.id]}
                                            sx={{ 
                                                width: { xs: '100%', sm: '48%' },
                                                py: { xs: 0.5, sm: 0.75 }
                                            }}
                                        >
                                            {addingItems[product.id] ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
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
                
                {/* "View All Products" button at bottom */}
                {!loading && !error && featuredProducts.length > 0 && (
                    <Box sx={{ mt: { xs: 3, sm: 4, md: 6 }, textAlign: 'center' }}>
                        <Button 
                            component={RouterLink} 
                            to="/products" 
                            variant="outlined" 
                            color="primary"
                            size={isXsScreen ? "medium" : "large"}
                            sx={{ 
                                px: { xs: 3, sm: 4, md: 5 },
                                py: { xs: 1, md: 1.5 }
                            }}
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
