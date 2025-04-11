import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import heroImage from '../../../assets/images/hero-image.webp';

function Hero() {
    return (
        <Box
            sx={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: {
                    xs: 'center',
                    md: 'center 30%'
                },
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
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly darker overlay
                    zIndex: 1
                },
                marginBottom: 4
            }}
        >
            <Container
                maxWidth="md"
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    color: 'white',
                    pt: { xs: 2, md: 8 }
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <Chip
                        label="NEW COLLECTION"
                        color="secondary"
                        sx={{
                            mb: 3,
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            py: 0.5,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
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
                            textShadow: '2px 2px 4px rgba(0,0,0,0.4)'
                        }}
                    >
                        Welcome to Clinique Beauty
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 1,
                            fontStyle: 'italic',
                            letterSpacing: '0.5px'
                        }}
                    >
                        Where Beauty Meets Science
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                >
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
                        Discover our premium beauty products crafted with the finest ingredients
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="center"
                    >
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
                                },
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                            }}
                        >
                            Shop Now
                        </Button>

                        <Button
                            component={RouterLink}
                            to="/about"
                            variant="outlined"
                            size="large"
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                borderColor: 'white',
                                color: 'white',
                                borderWidth: 2,
                                transition: 'all 0.3s',
                                '&:hover': {
                                    borderColor: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    transform: 'scale(1.05)'
                                }
                            }}
                        >
                            Learn More
                        </Button>
                    </Stack>
                </motion.div>
            </Container>
        </Box>
    );
}

export default Hero;