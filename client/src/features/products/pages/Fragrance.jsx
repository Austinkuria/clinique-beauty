import React, { useState, useContext, useEffect } from 'react'; // Added useEffect
import { Container, Typography, Grid, Box, Paper, CircularProgress, Alert } from '@mui/material'; // Added CircularProgress, Alert
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
// Remove ReviewSection import if not used
// import ReviewSection from '../components/ReviewSection';
import { useCart } from '../../../context/CartContext'; // Keep if ProductCard uses it, otherwise remove
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient'; // Import useApi

// Remove the hardcoded mockProducts array
// const mockProducts = [ ... ];

function Fragrance() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi(); // Get API methods
    const [products, setProducts] = useState([]); // State for fetched products
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [filters, setFilters] = useState({ category: 'All', sort: 'default' });

    useEffect(() => {
        const fetchFragranceProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch products specifically for the 'Fragrance' category
                // Ensure 'Fragrance' matches the category value in your Supabase table
                const data = await api.getProducts('Fragrance');
                setProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching fragrance products:", err);
                setError(err.message || 'Failed to load products.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFragranceProducts();
    }, []); // Empty dependency array to run once on mount

    // Apply filtering and sorting to the fetched products state
    const filteredProducts = products
        .filter((product) => filters.category === 'All' || product.category === filters.category) // Adjust if needed based on data
        .sort((a, b) => {
            if (filters.sort === 'price-low') return a.price - b.price;
            if (filters.sort === 'price-high') return b.price - a.price;
            if (filters.sort === 'rating') return b.rating - a.rating;
            return 0;
        });

    // Extract unique sub-categories from fetched products for the filter bar
    const fragranceSubCategories = ['All', ...new Set(products.map(p => p.category))];

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
                    Fragrance
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
                        categories={fragranceSubCategories.length > 1 ? fragranceSubCategories : ['All', 'Fragrance']} // Adjust as needed
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
                                    No fragrance products found.
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

export default Fragrance;