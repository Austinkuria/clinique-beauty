// client/src/features/products/ProductList.jsx
// Kilimall-modeled category and product catalog page with persistent left filter sidebar and uniform grid

import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    FormControl,
    Select,
    MenuItem,
    Paper,
    TextField,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider,
    Breadcrumbs,
    Link as MuiLink,
    IconButton
} from '@mui/material';
import {
    FilterList as FilterListIcon,
    NavigateNext as NavigateNextIcon,
    RestartAlt as ResetIcon,
    Category as CategoryIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import ProductCard from './components/ProductCard';
import { ThemeContext } from '../../context/ThemeContext';
import { useCategories } from '../../context/CategoryContext';
import { useApi } from '../../api/apiClient';
import mockProducts from '../../data/mockProducts';

export default function ProductList() {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const { colorValues } = useContext(ThemeContext);
    const { categories } = useCategories();
    const api = useApi();

    const dynamicCategories = useMemo(() => {
        return ['All', ...(categories || []).map((c) => c.name)];
    }, [categories]);

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubcategory, setSelectedSubcategory] = useState('All');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [appliedPriceMin, setAppliedPriceMin] = useState('');
    const [appliedPriceMax, setAppliedPriceMax] = useState('');
    const [shippedFrom, setShippedFrom] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Synchronise selected category with URL parameter
    useEffect(() => {
        if (categoryName) {
            const matched = dynamicCategories.find(
                (c) => c.toLowerCase() === categoryName.toLowerCase()
            );
            if (matched) {
                setSelectedCategory(matched);
            } else {
                // If route category is not in standard list, capitalise it
                const formatted = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
                setSelectedCategory(formatted);
            }
        } else {
            setSelectedCategory('All');
        }
        setSelectedSubcategory('All');
    }, [categoryName, dynamicCategories]);

    // Load products from API or mock fallback
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
                        setProducts(mockProducts);
                    } else {
                        setProducts([]);
                    }
                }
            } catch (err) {
                console.warn('Catalog API failed, using fallback mock data:', err.message);
                if (isMounted) {
                    setProducts(mockProducts);
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

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedSubcategory('All');
        if (category === 'All') {
            navigate('/products');
        } else {
            navigate(`/products/${category.toLowerCase()}`);
        }
    };

    const handleApplyPrice = (e) => {
        e.preventDefault();
        setAppliedPriceMin(priceMin);
        setAppliedPriceMax(priceMax);
    };

    const handleResetFilters = () => {
        setPriceMin('');
        setPriceMax('');
        setAppliedPriceMin('');
        setAppliedPriceMax('');
        setShippedFrom('all');
        setSelectedSubcategory('All');
        setSortBy('default');
    };

    // Extract unique subcategories for the currently selected category
    const availableSubcategories = useMemo(() => {
        const relevant = selectedCategory === 'All'
            ? products
            : products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
        const subs = Array.from(new Set(relevant.map((p) => p.subcategory).filter(Boolean)));
        return ['All', ...subs];
    }, [products, selectedCategory]);

    // Filter and sort products
    const displayedProducts = useMemo(() => {
        return products
            .filter((p) => {
                // Category filter
                if (selectedCategory !== 'All' && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
                    return false;
                }

                // Subcategory filter
                if (selectedSubcategory !== 'All' && p.subcategory?.toLowerCase() !== selectedSubcategory.toLowerCase()) {
                    return false;
                }

                // Price range filter
                const price = Number(p.price) || 0;
                if (appliedPriceMin !== '' && price < Number(appliedPriceMin)) {
                    return false;
                }
                if (appliedPriceMax !== '' && price > Number(appliedPriceMax)) {
                    return false;
                }

                // Shipped from filter
                if (shippedFrom === 'fulfilled' && p.id % 2 === 0) {
                    return false;
                }
                if (shippedFrom === 'official' && p.id % 2 !== 0) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
                if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
                if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
                return 0;
            });
    }, [products, selectedCategory, selectedSubcategory, appliedPriceMin, appliedPriceMax, shippedFrom, sortBy]);

    const activeFilterCount = (appliedPriceMin ? 1 : 0) + (appliedPriceMax ? 1 : 0) + (selectedSubcategory !== 'All' ? 1 : 0) + (shippedFrom !== 'all' ? 1 : 0);

    return (
        <Box
            sx={{
                backgroundColor: colorValues.bgDefault,
                color: colorValues.textPrimary,
                py: 2.5,
                minHeight: '85vh',
                width: '100%'
            }}
        >
            <Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
                {/* Breadcrumbs Header (Kilimall style) */}
                <Box sx={{ mb: 2 }}>
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" sx={{ color: colorValues.textSecondary }} />}
                        aria-label="breadcrumb"
                    >
                        <MuiLink
                            component={RouterLink}
                            to="/"
                            underline="hover"
                            sx={{ color: colorValues.textSecondary, fontSize: '0.875rem', fontWeight: 500 }}
                        >
                            Home
                        </MuiLink>
                        {selectedCategory !== 'All' ? (
                            <MuiLink
                                component={RouterLink}
                                to="/products"
                                underline="hover"
                                sx={{ color: colorValues.textSecondary, fontSize: '0.875rem', fontWeight: 500 }}
                            >
                                Products
                            </MuiLink>
                        ) : null}
                        <Typography sx={{ color: colorValues.primary, fontSize: '0.875rem', fontWeight: 700 }}>
                            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                        </Typography>
                    </Breadcrumbs>
                </Box>

                {/* Two-Column Marketplace Layout */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, alignItems: 'flex-start' }}>
                    {/* Left Column: Persistent Search Filter Sidebar (Kilimall style) */}
                    <Box
                        sx={{
                            width: { xs: '100%', md: 260, lg: 280 },
                            flexShrink: 0
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: colorValues.bgPaper,
                                position: { md: 'sticky' },
                                top: { md: 80 }
                            }}
                        >
                            {/* Search Filter Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FilterListIcon sx={{ color: colorValues.primary, fontSize: '1.2rem' }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Search Filter
                                    </Typography>
                                </Box>
                                {activeFilterCount > 0 && (
                                    <Button
                                        size="small"
                                        onClick={handleResetFilters}
                                        startIcon={<ResetIcon sx={{ fontSize: '0.85rem !important' }} />}
                                        sx={{
                                            fontSize: '0.72rem',
                                            textTransform: 'none',
                                            color: colorValues.primary,
                                            p: 0,
                                            minWidth: 'auto',
                                            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                                        }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Price Range Section (Min - Max with Apply Button) */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.85rem' }}>
                                    Price (KES)
                                </Typography>
                                <Box component="form" onSubmit={handleApplyPrice} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <TextField
                                        placeholder="Min"
                                        size="small"
                                        value={priceMin}
                                        type="number"
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        sx={{
                                            flex: 1,
                                            '& .MuiInputBase-input': { py: 0.8, px: 1, fontSize: '0.8rem' }
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ color: colorValues.textSecondary }}>-</Typography>
                                    <TextField
                                        placeholder="Max"
                                        size="small"
                                        value={priceMax}
                                        type="number"
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        sx={{
                                            flex: 1,
                                            '& .MuiInputBase-input': { py: 0.8, px: 1, fontSize: '0.8rem' }
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            minWidth: 48,
                                            py: 0.8,
                                            px: 1.2,
                                            backgroundColor: colorValues.primary,
                                            color: '#ffffff',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            '&:hover': { backgroundColor: colorValues.primaryDark }
                                        }}
                                    >
                                        Apply
                                    </Button>
                                </Box>
                                {(appliedPriceMin || appliedPriceMax) && (
                                    <Typography variant="caption" sx={{ color: colorValues.primary, mt: 0.5, display: 'block', fontWeight: 600 }}>
                                        Range: KES {appliedPriceMin || '0'} to {appliedPriceMax || 'Any'}
                                    </Typography>
                                )}
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Subcategories / Suggestions Section */}
                            {availableSubcategories.length > 1 && (
                                <>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.85rem' }}>
                                            Suggestions
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {availableSubcategories.map((sub) => {
                                                const isSelected = selectedSubcategory === sub;
                                                return (
                                                    <Box
                                                        key={sub}
                                                        onClick={() => setSelectedSubcategory(sub)}
                                                        sx={{
                                                            py: 0.6,
                                                            px: 1,
                                                            borderRadius: 1,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                                            color: isSelected ? colorValues.primary : colorValues.textPrimary,
                                                            fontWeight: isSelected ? 700 : 500,
                                                            fontSize: '0.82rem',
                                                            transition: 'background-color 0.2s',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                                color: colorValues.primary
                                                            }
                                                        }}
                                                    >
                                                        <span>{sub}</span>
                                                        {isSelected && <CheckIcon sx={{ fontSize: '0.9rem' }} />}
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                </>
                            )}

                            {/* Dynamic Category Switcher */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.85rem' }}>
                                    Categories
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {dynamicCategories.map((cat) => {
                                        const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                                        return (
                                            <Box
                                                key={cat}
                                                onClick={() => handleCategoryClick(cat)}
                                                sx={{
                                                    py: 0.6,
                                                    px: 1,
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                                    color: isSelected ? colorValues.primary : colorValues.textPrimary,
                                                    fontWeight: isSelected ? 700 : 500,
                                                    fontSize: '0.82rem',
                                                    transition: 'background-color 0.2s',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                        color: colorValues.primary
                                                    }
                                                }}
                                            >
                                                <span>{cat}</span>
                                                {isSelected && <CheckIcon sx={{ fontSize: '0.9rem' }} />}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Shipped From Filter (Kilimall style) */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.85rem' }}>
                                    Shipped From
                                </Typography>
                                <RadioGroup
                                    value={shippedFrom}
                                    onChange={(e) => setShippedFrom(e.target.value)}
                                >
                                    <FormControlLabel
                                        value="all"
                                        control={<Radio size="small" sx={{ color: colorValues.primary, '&.Mui-checked': { color: colorValues.primary } }} />}
                                        label={<Typography sx={{ fontSize: '0.8rem' }}>All Sellers</Typography>}
                                    />
                                    <FormControlLabel
                                        value="fulfilled"
                                        control={<Radio size="small" sx={{ color: colorValues.primary, '&.Mui-checked': { color: colorValues.primary } }} />}
                                        label={<Typography sx={{ fontSize: '0.8rem' }}>Fulfilled by Clinique</Typography>}
                                    />
                                    <FormControlLabel
                                        value="official"
                                        control={<Radio size="small" sx={{ color: colorValues.primary, '&.Mui-checked': { color: colorValues.primary } }} />}
                                        label={<Typography sx={{ fontSize: '0.8rem' }}>Official Stores</Typography>}
                                    />
                                </RadioGroup>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Right Column: Catalog Grid & Sorting Bar */}
                    <Box sx={{ flexGrow: 1, width: '100%', minWidth: 0 }}>
                        {/* Feed Header: Results Count and Sort Dropdown */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                px: 2,
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: colorValues.bgPaper,
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: colorValues.textPrimary }}>
                                <Box component="span" sx={{ color: colorValues.primary, fontWeight: 800 }}>
                                    {displayedProducts.length}
                                </Box>{' '}
                                results for{' '}
                                <Box component="span" sx={{ fontStyle: 'italic' }}>
                                    "{selectedCategory === 'All' ? 'All Products' : selectedCategory}"
                                </Box>
                                {selectedSubcategory !== 'All' ? ` > ${selectedSubcategory}` : ''}
                            </Typography>

                            <FormControl size="small" sx={{ minWidth: 170 }}>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    displayEmpty
                                    sx={{
                                        fontSize: '0.82rem',
                                        '& .MuiSelect-select': { py: 0.8 }
                                    }}
                                >
                                    <MenuItem value="default">Sort by: Popular</MenuItem>
                                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                                    <MenuItem value="rating">Customer Rating</MenuItem>
                                </Select>
                            </FormControl>
                        </Paper>

                        {/* Loading / Error / Empty States */}
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Alert severity="error" sx={{ mb: 4 }}>
                                {error}
                            </Alert>
                        ) : displayedProducts.length === 0 ? (
                            <Paper
                                elevation={0}
                                sx={{
                                    textAlign: 'center',
                                    py: 8,
                                    px: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    backgroundColor: colorValues.bgPaper
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: colorValues.textPrimary }}>
                                    No products match your filter selection
                                </Typography>
                                <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 2 }}>
                                    Try clearing price limits or selecting another subcategory.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={handleResetFilters}
                                    sx={{
                                        borderColor: colorValues.primary,
                                        color: colorValues.primary,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </Paper>
                        ) : (
                            /* Uniform 4-Column Marketplace CSS Grid (Kilimall style) */
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: 'repeat(2, 1fr)',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(3, 1fr)',
                                        lg: 'repeat(4, 1fr)'
                                    },
                                    gap: 2,
                                    width: '100%'
                                }}
                            >
                                {displayedProducts.map((product) => (
                                    <Box key={product.id} sx={{ width: '100%', height: '100%' }}>
                                        <ProductCard product={product} />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
