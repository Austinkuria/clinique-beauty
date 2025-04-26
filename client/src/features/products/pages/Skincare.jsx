import React, { useState, useEffect, useContext } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import ProductCard from '../components/ProductCard'; // Assuming ProductCard component exists
import { useApi } from '../../../api/apiClient'; // Import useApi
import { ThemeContext } from '../../../context/ThemeContext';

function Skincare() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const api = useApi();
    const { colorValues } = useContext(ThemeContext);

    useEffect(() => {
        const fetchSkincareProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch products specifically for the 'Skincare' category
                const data = await api.getProducts('Skincare');
                // Ensure data is an array before setting state
                setProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching skincare products:", err);
                setError(err.message || 'Failed to load products.');
                setProducts([]); // Also set to empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchSkincareProducts();
    }, []); // Dependency array changed to []

    return (
        <Box sx={{ backgroundColor: colorValues.bgDefault, color: colorValues.textPrimary, py: 4, minHeight: '80vh' }}>
            <Container>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                    Skincare Essentials
                </Typography>

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
                        {/* Now products is guaranteed to be an array */}
                        {products.length > 0 ? (
                            products.map((product) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                    <ProductCard product={product} />
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