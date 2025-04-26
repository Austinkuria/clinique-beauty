import React, { useState, useContext, useEffect } from 'react'; // Added useEffect
import { Container, Typography, Grid, Box, Paper, CircularProgress, Alert } from '@mui/material'; // Added CircularProgress, Alert
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient'; // Import useApi

function HairProducts() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi(); // Get API methods
    const [products, setProducts] = useState([]); // State for fetched products
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [filters, setFilters] = useState({ category: 'All', sort: 'default' });

    useEffect(() => {
        const fetchHairProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch products specifically for the 'Hair' category
                // Ensure 'Hair' matches the category value in your Supabase table
                const data = await api.getProducts('Hair'); // Or 'Hair Care' etc. depending on your Supabase data
                setProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching hair products:", err);
                setError(err.message || 'Failed to load products.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHairProducts();
    }, []); // Empty dependency array to run once on mount

    // Apply filtering and sorting to the fetched products state
    const filteredProducts = products
        .filter((product) => filters.category === 'All' || product.category === filters.category) // Adjust if needed
        .sort((a, b) => {
            if (filters.sort === 'price-low') return a.price - b.price;
            if (filters.sort === 'price-high') return b.price - a.price;
            if (filters.sort === 'rating') return b.rating - a.rating;
            return 0;
        });

    // Extract unique sub-categories from fetched products for the filter bar
    const hairSubCategories = ['All', ...new Set(products.map(p => p.category))];

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
                    Hair Products
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
                        // Use dynamic categories from fetched data or define static ones
                        categories={hairSubCategories.length > 1 ? hairSubCategories : ['All', 'Hair']} // Adjust as needed
                        onFilterChange={setFilters}
                        currentFilters={filters}
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
                                    No hair products found.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

export default HairProducts;
