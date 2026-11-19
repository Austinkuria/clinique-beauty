// client/src/features/products/ProductList.jsx
// Centralised product listing page supporting all categories, filtering, and sorting

import React, { useState, useContext, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Box,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from './components/ProductCard';
import { ThemeContext } from '../../context/ThemeContext';
import { useApi } from '../../api/apiClient';
import mockProducts from '../../data/mockProducts';

const CATEGORIES = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Hair'];

export default function ProductList() {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const { colorValues } = useContext(ThemeContext);
    const api = useApi();

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubcategory, setSelectedSubcategory] = useState('All');
    const [sortBy, setSortBy] = useState('default');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialise category from URL param if available
    useEffect(() => {
        if (categoryName) {
            const matched = CATEGORIES.find(
                (c) => c.toLowerCase() === categoryName.toLowerCase()
            );
            if (matched) {
                setSelectedCategory(matched);
            }
        } else {
            setSelectedCategory('All');
        }
    }, [categoryName]);

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const categoryParam = selectedCategory === 'All' ? null : selectedCategory;
                const data = await api.getProducts(categoryParam);
                if (isMounted) {
                    if (Array.isArray(data) && data.length > 0) {
                        setProducts(data);
                    } else if (Array.isArray(mockProducts)) {
                        // Fallback to mock products if database table has no rows
                        const filtered = selectedCategory === 'All'
                            ? mockProducts
                            : mockProducts.filter(
                                  (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
                              );
                        setProducts(filtered);
                    } else {
                        setProducts([]);
                    }
                }
            } catch (err) {
                console.warn('Failed to load products from API, using fallback catalog:', err.message);
                if (isMounted) {
                    const filtered = selectedCategory === 'All'
                        ? mockProducts
                        : mockProducts.filter(
                              (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
                          );
                    setProducts(filtered);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, [selectedCategory, api]);

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategory(newValue);
        setSelectedSubcategory('All');
        if (newValue === 'All') {
            navigate('/products');
        } else {
            navigate(`/products/${newValue.toLowerCase()}`);
        }
    };

    // Extract unique subcategories from the loaded products
    const availableSubcategories = [
        'All',
        ...new Set(
            products
                .map((p) => p.subcategory)
                .filter((sub) => Boolean(sub) && sub !== 'All')
        )
    ];

    // Filter and sort products
    const displayedProducts = products
        .filter((p) => {
            if (selectedSubcategory === 'All') return true;
            return p.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase();
        })
        .sort((a, b) => {
            if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
            if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            return 0;
        });

    return (
        <Box
            sx={{
                backgroundColor: colorValues.bgDefault,
                color: colorValues.textPrimary,
                py: 4,
                minHeight: '80vh'
            }}
        >
            <Container maxWidth="xl">
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        mb: 1,
                        color: colorValues.textPrimary
                    }}
                >
                    {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        textAlign: 'center',
                        color: colorValues.textSecondary,
                        mb: 3
                    }}
                >
                    Explore premium beauty, skincare, fragrance, and hair essentials from verified sellers.
                </Typography>

                {/* Category Navigation Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        {CATEGORIES.map((cat) => (
                            <Tab
                                key={cat}
                                label={cat}
                                value={cat}
                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '1rem' }}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Subcategory Chips and Sorting Control */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        mb: 4
                    }}
                >
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {availableSubcategories.map((sub) => (
                            <Chip
                                key={sub}
                                label={sub}
                                clickable
                                color={selectedSubcategory === sub ? 'primary' : 'default'}
                                variant={selectedSubcategory === sub ? 'filled' : 'outlined'}
                                onClick={() => setSelectedSubcategory(sub)}
                                sx={{ fontWeight: 500 }}
                            />
                        ))}
                    </Stack>

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel id="sort-select-label">Sort By</InputLabel>
                        <Select
                            labelId="sort-select-label"
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <MenuItem value="default">Featured</MenuItem>
                            <MenuItem value="price-low">Price: Low to High</MenuItem>
                            <MenuItem value="price-high">Price: High to Low</MenuItem>
                            <MenuItem value="rating">Highest Rated</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Main Content Area */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                ) : displayedProducts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No products found in this selection.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {displayedProducts.map((product) => (
                            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
