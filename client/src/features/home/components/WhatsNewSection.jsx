// client/src/features/home/components/WhatsNewSection.jsx
// Full-width curated new arrivals shelf with uniform card layout and theme-aligned styling

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Paper,
    Chip
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { formatCurrency } from '../../../utils/helpers';
import { useCart } from '../../../context/CartContext';
import { useTheme } from '../../../context/ThemeContext';

export default function WhatsNewSection({ products = [] }) {
    const { addToCart } = useCart();
    const { colorValues } = useTheme();

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <Box sx={{ py: 3, backgroundColor: colorValues.bgDefault }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 3 },
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: colorValues.bgPaper
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                        <Typography variant="h5" component="h3" sx={{ fontWeight: 800, color: colorValues.textPrimary }}>
                            What's New
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/products"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                color: colorValues.primary,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                            }}
                        >
                            View More
                        </Button>
                    </Box>

                    <Grid container spacing={2}>
                        {products.slice(0, 6).map((item) => (
                            <Grid item key={item.id} xs={6} sm={4} md={2} sx={{ display: 'flex' }}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        backgroundColor: colorValues.bgPaper,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 6px 14px rgba(0,0,0,0.06)'
                                        }
                                    }}
                                >
                                    <Chip
                                        label="New"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            backgroundColor: colorValues.primary,
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            height: 20,
                                            zIndex: 2
                                        }}
                                    />

                                    <CardMedia
                                        component="img"
                                        image={item.image}
                                        alt={item.name}
                                        sx={{
                                            height: 180,
                                            width: '100%',
                                            objectFit: 'cover',
                                            backgroundColor: colorValues.bgDefault
                                        }}
                                    />

                                    <CardContent
                                        sx={{
                                            p: 1.5,
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            component={RouterLink}
                                            to={`/product/${item.id}`}
                                            sx={{
                                                color: colorValues.textPrimary,
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                minHeight: 40,
                                                maxHeight: 40,
                                                lineHeight: 1.3,
                                                mb: 1,
                                                '&:hover': { color: colorValues.primary }
                                            }}
                                        >
                                            {item.name}
                                        </Typography>

                                        <Box sx={{ mt: 'auto', pt: 1 }}>
                                            <Typography variant="subtitle1" sx={{ color: colorValues.textPrimary, fontWeight: 800 }}>
                                                {formatCurrency(item.price)}
                                            </Typography>
                                            <Button
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                onClick={() => addToCart(item, 1)}
                                                sx={{
                                                    mt: 1,
                                                    color: colorValues.primary,
                                                    borderColor: colorValues.primary,
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: '0.75rem',
                                                    py: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: colorValues.buttonHover,
                                                        borderColor: colorValues.primaryDark
                                                    }
                                                }}
                                            >
                                                Add to Cart
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
}
