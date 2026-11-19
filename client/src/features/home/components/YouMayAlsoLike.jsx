// client/src/features/home/components/YouMayAlsoLike.jsx
// Full-width multi-vendor product feed with mathematically identical card dimensions

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper
} from '@mui/material';
import ProductCard from '../../products/components/ProductCard';
import { useTheme } from '../../../context/ThemeContext';

export default function YouMayAlsoLike({ products = [] }) {
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="h3" sx={{ fontWeight: 800, color: colorValues.textPrimary }}>
                            You May Also Like
                        </Typography>
                    </Box>

                    {/* Uniform CSS Grid guaranteeing 100% identical column widths and heights */}
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
                        {products.map((item) => (
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
