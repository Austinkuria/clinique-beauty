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

function FeaturedProducts() {
    const products = [
        {
            id: 1,
            name: 'Moisturizer',
            price: 29.99,
            image: '/assets/images/products/moisturizer.jpg',
            description: 'Deeply hydrating formula for all skin types'
        },
        {
            id: 2,
            name: 'Cleanser',
            price: 19.99,
            image: '/assets/images/products/cleanser.jpg',
            description: 'Gentle daily cleanser that removes impurities'
        },
        {
            id: 3,
            name: 'Serum',
            price: 39.99,
            image: '/assets/images/products/serum.jpg',
            description: 'Advanced anti-aging formula with peptides'
        }
    ];

    return (
        <Box sx={{ py: 8, bgcolor: 'background.default' }}>
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
