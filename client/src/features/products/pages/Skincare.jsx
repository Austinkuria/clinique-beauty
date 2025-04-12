import React, { useState, useContext } from 'react';
import { Container, Typography, Grid, Box, Paper } from '@mui/material';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import { useCart } from '../../../context/CartContext';
import { ThemeContext } from '../../../context/ThemeContext';
import mockProductsData from '../../../data/mockProducts';

function Skincare() {
    const { addToCart } = useCart();
    const { theme, colorValues } = useContext(ThemeContext);
    const [filters, setFilters] = useState({ category: 'All', sort: 'default' });

    // Filter only skincare products (IDs 1-4)
    const skincareProducts = mockProductsData.filter(product => product.id >= 1 && product.id <= 4);

    const filteredProducts = skincareProducts
        .filter((product) => filters.category === 'All' || product.category === filters.category)
        .sort((a, b) => {
            if (filters.sort === 'price-low') return a.price - b.price;
            if (filters.sort === 'price-high') return b.price - a.price;
            if (filters.sort === 'rating') return b.rating - a.rating;
            return 0;
        });

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: colorValues.bgDefault,
                color: colorValues.textPrimary,
                paddingTop: 3,
                paddingBottom: 3
            }}
        >
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600,
                        marginBottom: 3,
                        textAlign: 'center',
                        width: '100%',
                        color: theme === 'dark' ? colorValues.primary : colorValues.primaryDark,
                        padding: '12px 0',
                        borderBottom: `2px solid ${colorValues.primaryLight}`,
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                >
                    Skincare
                </Typography>

                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        padding: 2,
                        marginBottom: 4,
                        backgroundColor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <FilterBar
                        categories={['All', 'Moisturizers', 'Cleansers', 'Sunscreens', 'Serums']}
                        onFilterChange={setFilters}
                        currentFilters={filters}
                    />
                </Paper>

                <Grid container spacing={3}>
                    {filteredProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                            <Paper
                                elevation={theme === 'dark' ? 3 : 1}
                                sx={{
                                    backgroundColor: colorValues.bgPaper,
                                    borderRadius: 2,
                                    height: '100%',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: theme === 'dark' ? 8 : 4
                                    }
                                }}
                            >
                                <ProductCard product={product} />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        padding: 3,
                        marginTop: 6,
                        backgroundColor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <ReviewSection />
                </Paper>
            </Container>
        </Box>
    );
}

export default Skincare;