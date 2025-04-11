import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Box,
    Button,
    Card,
    CardMedia,
    Rating,
    Tabs,
    Tab,
    Paper,
    TextField,
    Divider,
} from '@mui/material';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import { useCart } from '../../context/CartContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '@clerk/clerk-react';

// Mock product data (replace with API call later)
const mockProducts = {
    5: {
        id: 5,
        name: 'Matte Lipstick',
        price: 15.99,
        image: '/images/makeup/lipstick.jpg',
        rating: 4.3,
        category: 'Lipstick',
        description: 'A long-lasting matte lipstick with rich pigmentation and a smooth finish.',
        images: [
            '/images/makeup/lipstick.jpg',
            '/images/makeup/lipstick-alt1.jpg',
            '/images/makeup/lipstick-alt2.jpg',
        ],
        reviews: [
            { user: 'Jane D.', rating: 4.5, comment: 'Love the color, stays on all day!', date: '2025-04-01' },
            { user: 'Sarah K.', rating: 4.0, comment: 'Great product but dries a bit fast.', date: '2025-03-28' },
        ],
    },
    6: {
        id: 6,
        name: 'Liquid Foundation',
        price: 29.99,
        image: '/images/makeup/foundation.jpg',
        rating: 4.6,
        category: 'Foundation',
        description: 'A lightweight, full-coverage foundation with a natural finish.',
        images: [
            '/images/makeup/foundation.jpg',
            '/images/makeup/foundation-alt1.jpg',
            '/images/makeup/foundation-alt2.jpg',
        ],
        reviews: [
            { user: 'Emily R.', rating: 4.8, comment: 'Perfect match for my skin tone!', date: '2025-04-10' },
        ],
    },
    // Add more products as needed
};

function ProductDetail() {
    const { id } = useParams(); // Get product ID from URL
    const { theme, colorValues } = useContext(ThemeContext);
    const { cartItems, setCartItems } = useCart();
    const { isSignedIn } = useAuth();
    const [selectedImage, setSelectedImage] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(0);

    // Fetch product (mock for now, replace with API later)
    const product = mockProducts[id] || {};

    useEffect(() => {
        // Future API call: fetch(`/api/products/${id}`).then(res => setProduct(res.data));
    }, [id]);

    const addToCart = () => {
        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);
        if (existingItemIndex >= 0) {
            const newCartItems = [...cartItems];
            newCartItems[existingItemIndex].quantity = (newCartItems[existingItemIndex].quantity || 1) + 1;
            setCartItems(newCartItems);
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleReviewSubmit = () => {
        if (!isSignedIn) {
            alert('Please sign in to leave a review.');
            return;
        }
        if (reviewRating && reviewText) {
            // Future: Send to API (e.g., POST /api/reviews)
            console.log('Review submitted:', { rating: reviewRating, comment: reviewText });
            setReviewText('');
            setReviewRating(0);
        }
    };

    if (!product.id) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h5" color="error">
                    Product not found
                </Typography>
            </Container>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: colorValues.bgDefault,
                color: colorValues.textPrimary,
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Image Gallery */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 2, boxShadow: theme === 'dark' ? 3 : 1 }}>
                            <CardMedia
                                component="img"
                                image={product.images[selectedImage]}
                                alt={product.name}
                                sx={{ height: 400, objectFit: 'cover' }}
                            />
                            <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                                {product.images.map((img, index) => (
                                    <CardMedia
                                        key={index}
                                        component="img"
                                        image={img}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            objectFit: 'cover',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            border:
                                                selectedImage === index
                                                    ? `2px solid ${colorValues.primary}`
                                                    : '1px solid #ddd',
                                        }}
                                        onClick={() => setSelectedImage(index)}
                                    />
                                ))}
                            </Box>
                        </Card>
                    </Grid>

                    {/* Product Info */}
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 600, color: colorValues.textPrimary, mb: 2 }}
                        >
                            {product.name}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{ color: colorValues.textSecondary, mb: 1 }}
                        >
                            {product.category}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating
                                value={product.rating}
                                precision={0.1}
                                readOnly
                                sx={{ color: colorValues.primary }}
                            />
                            <Typography
                                variant="body2"
                                sx={{ ml: 1, color: colorValues.textSecondary }}
                            >
                                ({product.rating} - {product.reviews.length} reviews)
                            </Typography>
                        </Box>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, color: colorValues.primary, mb: 2 }}
                        >
                            ${product.price.toFixed(2)}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ color: colorValues.textPrimary, mb: 3 }}
                        >
                            {product.description}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<ShoppingCartIcon />}
                            onClick={addToCart}
                            sx={{
                                backgroundColor: colorValues.primary,
                                color: '#ffffff',
                                borderRadius: '50px',
                                textTransform: 'none',
                                fontWeight: 500,
                                py: 1.5,
                                px: 4,
                                '&:hover': {
                                    backgroundColor: colorValues.primaryDark,
                                    boxShadow: theme === 'dark' ? 6 : 4,
                                },
                            }}
                        >
                            Add to Cart
                        </Button>
                    </Grid>

                    {/* Tabs for Description and Reviews */}
                    <Grid item xs={12}>
                        <Paper
                            elevation={theme === 'dark' ? 3 : 1}
                            sx={{ p: 3, mt: 4, backgroundColor: colorValues.bgPaper, borderRadius: 2 }}
                        >
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                sx={{ mb: 2 }}
                                TabIndicatorProps={{
                                    style: { backgroundColor: colorValues.primary },
                                }}
                            >
                                <Tab label="Description" sx={{ color: colorValues.textPrimary }} />
                                <Tab label="Reviews" sx={{ color: colorValues.textPrimary }} />
                            </Tabs>
                            {tabValue === 0 && (
                                <Typography variant="body1" sx={{ color: colorValues.textPrimary }}>
                                    {product.description}
                                    {/* Add more detailed description here if available */}
                                </Typography>
                            )}
                            {tabValue === 1 && (
                                <Box>
                                    {product.reviews.map((review, index) => (
                                        <Box key={index} sx={{ mb: 3 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ fontWeight: 500, color: colorValues.textPrimary }}
                                            >
                                                {review.user}
                                            </Typography>
                                            <Rating
                                                value={review.rating}
                                                readOnly
                                                size="small"
                                                sx={{ color: colorValues.primary }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{ color: colorValues.textSecondary }}
                                            >
                                                {review.comment}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: colorValues.textSecondary }}
                                            >
                                                {review.date}
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                        </Box>
                                    ))}
                                    {isSignedIn && (
                                        <Box sx={{ mt: 4 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{ color: colorValues.textPrimary, mb: 2 }}
                                            >
                                                Leave a Review
                                            </Typography>
                                            <Rating
                                                value={reviewRating}
                                                onChange={(e, newValue) => setReviewRating(newValue)}
                                                sx={{ color: colorValues.primary, mb: 2 }}
                                            />
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                placeholder="Write your review here..."
                                                sx={{
                                                    mb: 2,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        backgroundColor:
                                                            theme === 'dark' ? '#424242' : '#f5f5f5',
                                                    },
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={handleReviewSubmit}
                                                sx={{
                                                    backgroundColor: colorValues.primary,
                                                    color: '#ffffff',
                                                    '&:hover': {
                                                        backgroundColor: colorValues.primaryDark,
                                                    },
                                                }}
                                            >
                                                Submit Review
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default ProductDetail;