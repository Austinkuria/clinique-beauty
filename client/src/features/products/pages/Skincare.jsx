import React, { useState, useContext, useEffect } from 'react';
import { Container, Typography, Grid, Box, Paper, CircularProgress, Alert } from '@mui/material';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient';

function Skincare() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Initialize filters with subcategory 'All'
    const [filters, setFilters] = useState({ subcategory: 'All', sort: 'default' });

    useEffect(() => {
        const fetchSkincareProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch products for the main 'Skincare' category
                const data = await api.getProducts('Skincare');
                setProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching skincare products:", err);
                setError(err.message || 'Failed to load products.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSkincareProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Change dependency array to empty

    // Apply filtering based on subcategory and sorting
    const filteredProducts = products
        .filter((product) => filters.subcategory === 'All' || product.subcategory === filters.subcategory) // Filter by subcategory
        .sort((a, b) => {
            if (filters.sort === 'price-low') return a.price - b.price;
            if (filters.sort === 'price-high') return b.price - a.price;
            if (filters.sort === 'rating') return b.rating - a.rating;
            return 0; // Default sort (usually by ID or fetch order)
        });

    // Extract unique sub-categories from fetched products for the filter bar
    const skincareSubCategories = ['All', ...new Set(products.map(p => p.subcategory).filter(Boolean))]; // Filter out null/undefined

    return (
        <Box sx={{ backgroundColor: colorValues.bgDefault, color: colorValues.textPrimary, py: 4, minHeight: '80vh' }}>
            <Container>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                    Skincare Essentials
                </Typography>

                {/* Filter Bar */}
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{ padding: 2, marginBottom: 4, backgroundColor: colorValues.bgPaper, borderRadius: 2 }}
                >
                    <FilterBar
                        categories={skincareSubCategories} // Pass subcategories
                        onFilterChange={setFilters}
                        currentFilters={filters}
                        categoryLabel="Type" // Pass the desired label
                    />
                </Paper>

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

                {!loading && !error && (
                    <Grid container spacing={3}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                    {/* Wrap ProductCard in Paper for consistent styling */}
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
                                    No skincare products found.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

export default Skincare;