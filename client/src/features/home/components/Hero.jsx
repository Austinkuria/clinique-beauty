import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container, Chip, Stack } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import heroImage from '../../../assets/images/hero-image.webp';

function Hero() {
    // Track if initial animation is complete
    const [animationComplete, setAnimationComplete] = useState(false);

    // Define animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
                onComplete: () => setAnimationComplete(true)
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "tween",
                ease: "easeOut",
                duration: 0.6
            }
        }
    };

    const chipVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "tween",
                ease: "easeOut",
                duration: 0.5
            }
        },
        hover: {
            scale: 1.03,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            transition: { duration: 0.2 }
        }
    };

    const buttonVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                delay: 0.8
            }
        },
        hover: {
            scale: 1.03,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
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
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    color: 'white',
                    pt: { xs: 2, md: 8 },
                    minHeight: { xs: '300px', md: '400px' }
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        variants={chipVariants}
                        whileHover={animationComplete ? "hover" : undefined}
                    >
                        <RouterLink to="/products/collections/limited-edition" style={{ textDecoration: 'none' }}>
                            <Chip
                                label="LIMITED EDITION"
                                color="secondary"
                                clickable
                                sx={{
                                    mb: 3,
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    py: 0.5,
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                }}
                            />
                        </RouterLink>
                    </motion.div>
                </AnimatePresence>

                <Box sx={{ mb: 2 }}>
                    <motion.div
                        variants={itemVariants}
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
                </Box>

                <Box sx={{ mb: 2 }}>
                    <motion.div
                        variants={itemVariants}
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
                </Box>

                <Box sx={{ mb: 4 }}>
                    <motion.div
                        variants={itemVariants}
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
                </Box>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="center"
                    sx={{
                        mt: 4,
                        position: 'relative',
                        // Fix height to prevent shifting
                        height: { xs: 'auto', sm: '60px' },
                        // Add padding to ensure consistent space
                        pb: { xs: 4, sm: 0 }
                    }}
                >
                    <Box sx={{
                        position: 'relative',
                        display: 'inline-block',
                        // Set fixed dimensions to prevent layout shifting
                        width: { xs: '100%', sm: 'auto' },
                        height: { xs: 'auto', sm: '100%' }
                    }}>
                        <motion.div
                            variants={buttonVariants}
                            whileHover={animationComplete ? "hover" : undefined}
                            whileTap={animationComplete ? { scale: 0.95 } : undefined}
                            style={{
                                display: 'inline-block',
                                transformOrigin: 'center'
                            }}
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
                                        transform: 'none' // Remove MUI hover to let Framer Motion handle it
                                    },
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                }}
                            >
                                Shop Now
                            </Button>
                        </motion.div>
                    </Box>

                    <Box sx={{
                        position: 'relative',
                        display: 'inline-block',
                        // Set fixed dimensions to prevent layout shifting
                        width: { xs: '100%', sm: 'auto' },
                        height: { xs: 'auto', sm: '100%' }
                    }}>
                        <motion.div
                            variants={buttonVariants}
                            whileHover={animationComplete ? "hover" : undefined}
                            whileTap={animationComplete ? { scale: 0.95 } : undefined}
                            style={{
                                display: 'inline-block',
                                transformOrigin: 'center'
                            }}
                        >
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
                                        transform: 'none' // Remove MUI hover to let Framer Motion handle it
                                    }
                                }}
                            >
                                Learn More
                            </Button>
                        </motion.div>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export default Hero;