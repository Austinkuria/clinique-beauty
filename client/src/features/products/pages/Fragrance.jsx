import React, { useState, useContext, useEffect } from 'react';
import { Container, Typography, Grid, Box, Paper, CircularProgress, Alert } from '@mui/material';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'; // Import is used for motion.div components

function Fragrance() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Initialize filters with subcategory 'All'
    const [filters, setFilters] = useState({ subcategory: 'All', sort: 'default' });
    
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    useEffect(() => {
        const fetchFragranceProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch products specifically for the 'Fragrance' category
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
    const fragranceSubCategories = ['All', ...new Set(products.map(p => p.subcategory).filter(Boolean))];

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
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
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
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
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
                            categories={fragranceSubCategories} // Pass subcategories
                            onFilterChange={setFilters}
                            currentFilters={filters}
                            categoryLabel="Type" // Pass the desired label
                        />
                    </Paper>
                </motion.div>

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

                {/* Product Grid with Staggered Animation */}
                {!loading && !error && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Grid container spacing={3}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                        <motion.div variants={itemVariants}>
                                            <Paper
                                                elevation={theme === 'dark' ? 3 : 1}
                                                sx={{
                                                    backgroundColor: colorValues.bgPaper,
                                                    borderRadius: 2,
                                                    height: '100%'
                                                    // Remove transition styles as they're handled by Framer Motion
                                                }}
                                            >
                                                <ProductCard product={product} />
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <motion.div variants={itemVariants}>
                                        <Typography sx={{ textAlign: 'center', color: colorValues.textSecondary, mt: 4 }}>
                                            No fragrance products found.
                                        </Typography>
                                    </motion.div>
                                </Grid>
                            )}
                        </Grid>
                    </motion.div>
                )}
            </Container>
        </Box>
    );
}

export default Fragrance;