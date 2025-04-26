import React, { useState, useContext, useEffect } from 'react';
import { Container, Typography, Grid, Box, Paper, CircularProgress, Alert } from '@mui/material';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient';

function Makeup() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Initialize filters with subcategory 'All'
    const [filters, setFilters] = useState({ subcategory: 'All', sort: 'default' });

    useEffect(() => {
        const fetchMakeupProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch products specifically for the 'Makeup' category
                const data = await api.getProducts('Makeup');
                setProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching makeup products:", err);
                setError(err.message || 'Failed to load products.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMakeupProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Change dependency array to empty

    // Apply filtering based on subcategory and sorting
    const filteredProducts = products
        .filter((product) => filters.subcategory === 'All' || product.subcategory === filters.subcategory) // Filter by subcategory
        .sort((a, b) => {
            if (filters.sort === 'price-low') return a.price - b.price;
            if (filters.sort === 'price-high') return b.price - a.price;
            if (filters.sort === 'rating') return b.rating - a.rating;
            return 0;
        });

    // Extract unique sub-categories from fetched products for the filter bar
    const makeupSubCategories = ['All', ...new Set(products.map(p => p.subcategory).filter(Boolean))];

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
                    Makeup
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
                        categories={makeupSubCategories} // Pass subcategories
                        onFilterChange={setFilters}
                        currentFilters={filters}
                        categoryLabel="Type" // Pass the desired label
                    />
                </Paper>

                {/* Loading and Error Handling */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && (
                    <Alert severity="error" sx={{ my: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Product Grid */}
                {!loading && !error && (
                    <Grid container spacing={3}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
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
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography sx={{ textAlign: 'center', color: colorValues.textSecondary, mt: 4 }}>
                                    No makeup products found.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                )}

                {/* Remove ReviewSection if not needed */}
                {/* <Paper ... > <ReviewSection /> </Paper> */}
            </Container>
        </Box>
    );
}

export default Makeup;