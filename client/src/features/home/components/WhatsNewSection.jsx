// client/src/features/home/components/WhatsNewSection.jsx
// Full-width curated new arrivals shelf with uniform card geometry and theme-aligned styling

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../../products/components/ProductCard';
import { useTheme } from '../../../context/ThemeContext';

export default function WhatsNewSection({ products = [] }) {
    const { colorValues } = useTheme();

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <Box sx={{ py: 2.5, backgroundColor: colorValues.bgDefault }}>
            <Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: colorValues.bgPaper
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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

                    {/* Uniform CSS Grid */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(3, 1fr)',
                                md: 'repeat(4, 1fr)',
                                lg: 'repeat(6, 1fr)'
                            },
                            gap: 2,
                            width: '100%'
                        }}
                    >
                        {products.slice(0, 6).map((item) => (
                            <Box key={item.id} sx={{ width: '100%', height: '100%' }}>
                                <ProductCard product={item} />
                            </Box>
                        ))}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
