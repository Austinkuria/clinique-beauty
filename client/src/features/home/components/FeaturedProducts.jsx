import React from 'react';
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
    Box
} from '@mui/material';
import { useCart } from '../../../context/CartContext';
import moisturizer from '../../../assets/images/products/moisturizer.webp';
import cleanser from '../../../assets/images/products/cleanser.webp';
import serum from '../../../assets/images/products/serum.webp';

function FeaturedProducts() {
    const { cartItems, setCartItems } = useCart();

    const products = [
        {
            id: 1,
            name: 'Moisturizer',
            price: 29.99,
            image: moisturizer,
            stock: 50, // Added stock
            description: 'Deeply hydrating formula for all skin types'
        },
        {
            id: 2,
            name: 'Cleanser',
            price: 19.99,
            image: cleanser,
            stock: 35, // Added stock
            description: 'Gentle daily cleanser that removes impurities'
        },
        {
            id: 3,
            name: 'Serum',
            price: 39.99,
            image: serum,
            stock: 25, // Added stock
            description: '2 in 1 Collagen Face Serum Anti Aging Collagen Serum'
        }
    ];

    const addToCart = (product) => {
        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

        if (existingItemIndex >= 0) {
            // Item already exists, update quantity
            const newCartItems = [...cartItems];
            newCartItems[existingItemIndex].quantity += 1;
            setCartItems(newCartItems);
        } else {
            // Add new item with quantity 1
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
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

                <Grid container spacing={4}>
                    {products.map((product) => (
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
                                    image={product.image}
                                    alt={product.name}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h5" component="h3">
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {product.description}
                                    </Typography>
                                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                        ${product.price.toFixed(2)}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="medium"
                                        component={RouterLink}
                                        to={`/products/${product.id}`}
                                        fullWidth
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        size="medium"
                                        color="primary"
                                        variant="contained"
                                        fullWidth
                                        onClick={() => addToCart(product)}
                                    >
                                        Add to Cart
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

export default FeaturedProducts;
