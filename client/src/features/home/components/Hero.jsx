import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import heroImage from '../../../assets/images/hero-image.webp';

function Hero() {
    return (
        <Box
            sx={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                minHeight: {
                    xs: '70vh',
                    md: '80vh',
                    lg: '100vh'
                },
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 1
                }
            }}
        >
            <Container
                maxWidth="md"
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    color: 'white'
                }}
            >
                <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        fontSize: {
                            xs: '2.5rem',
                            md: '3.5rem',
                            lg: '4.5rem'
                        },
                        textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                    }}
                >
                    Discover Your Perfect Skincare
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        mb: 4,
                        maxWidth: '750px',
                        mx: 'auto',
                        fontWeight: 300,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}
                >
                    Premium beauty products tailored for you.
                </Typography>
                <Button
                    component={RouterLink}
                    to="/products"
                    variant="contained"
                    size="large"
                    color="primary"
                    sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        transition: 'transform 0.3s',
                        '&:hover': {
                            transform: 'scale(1.05)'
                        }
                    }}
                >
                    Shop Now
                </Button>
            </Container>
        </Box>
    );
}

export default Hero;