// client/src/features/wishlist/Wishlist.jsx
// Guest-accessible and authenticated Wishlist view aligned with marketplace styling

import React, { useContext, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { FavoriteBorder as HeartIcon, Storefront as StoreIcon } from '@mui/icons-material';
import { useWishlist } from '../../context/WishlistContext';
import { ThemeContext } from '../../context/ThemeContext';
import ProductCard from '../products/components/ProductCard';
import mockProducts from '../../data/mockProducts';

export default function Wishlist() {
    const { wishlist } = useWishlist();
    const { colorValues } = useContext(ThemeContext);

    // Resolve products from current wishlist identifiers
    const wishlistedProducts = useMemo(() => {
        if (!Array.isArray(wishlist) || wishlist.length === 0) return [];
        return mockProducts.filter((p) =>
            wishlist.includes(p.id) ||
            wishlist.includes(p.slug) ||
            wishlist.includes(p.id?.toString())
        );
    }, [wishlist]);

    const isEmpty = wishlistedProducts.length === 0;

    return (
        <Box
            sx={{
                backgroundColor: colorValues.bgDefault,
                color: colorValues.textPrimary,
                py: 4,
                minHeight: '80vh',
                width: '100%'
            }}
        >
            <Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <HeartIcon sx={{ color: colorValues.primary, fontSize: '2rem' }} />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                            My Wishlist
                        </Typography>
                        {!isEmpty && (
                            <Typography variant="body2" sx={{ color: colorValues.textSecondary, fontWeight: 600 }}>
                                ({wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'})
                            </Typography>
                        )}
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/products"
                        startIcon={<StoreIcon />}
                        sx={{
                            color: colorValues.primary,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                        }}
                    >
                        Continue Shopping
                    </Button>
                </Box>

                {isEmpty ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, sm: 6 },
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            backgroundColor: colorValues.bgPaper,
                            my: 4
                        }}
                    >
                        <HeartIcon sx={{ fontSize: 64, color: colorValues.textSecondary, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: colorValues.textPrimary }}>
                            Your wishlist is empty
                        </Typography>
                        <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3, maxWidth: 400, mx: 'auto' }}>
                            Explore our marketplace catalog and tap the heart on any product to save it for later.
                        </Typography>
                        <Button
                            variant="contained"
                            component={RouterLink}
                            to="/products"
                            sx={{
                                backgroundColor: colorValues.primary,
                                color: '#ffffff',
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                py: 1,
                                '&:hover': { backgroundColor: colorValues.primaryDark }
                            }}
                        >
                            Explore Marketplace
                        </Button>
                    </Paper>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(3, 1fr)',
                                md: 'repeat(4, 1fr)',
                                lg: 'repeat(5, 1fr)'
                            },
                            gap: 2,
                            width: '100%'
                        }}
                    >
                        {wishlistedProducts.map((product) => (
                            <Box key={product.id} sx={{ width: '100%', height: '100%' }}>
                                <ProductCard product={product} />
                            </Box>
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
