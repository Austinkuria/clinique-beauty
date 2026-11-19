// client/src/features/home/Home.jsx
// Centralised dynamic homepage orchestrating marketplace hero, flash sales, category hubs, and feeds

import React, { useState, useEffect } from 'react';
import { Box, Container, Skeleton } from '@mui/material';
import MarketplaceHero from './components/MarketplaceHero';
import FlashSaleSection from './components/FlashSaleSection';
import HotCategories from './components/HotCategories';
import WhatsNewSection from './components/WhatsNewSection';
import YouMayAlsoLike from './components/YouMayAlsoLike';
import { fetchHomepageData } from './homeApi';
import { useTheme } from '../../context/ThemeContext';

function Home() {
    const { colorValues } = useTheme();
    const [homepageData, setHomepageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadFeed() {
            setLoading(true);
            try {
                const data = await fetchHomepageData();
                if (isMounted) {
                    setHomepageData(data);
                }
            } catch (err) {
                console.error('Failed to load homepage feed:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadFeed();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading && !homepageData) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: colorValues.bgDefault, py: 2 }}>
                <Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
                    {/* Hero Zone Skeleton */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr 280px' }, gap: 2, mb: 4, height: { xs: 260, md: 440 } }}>
                        <Skeleton variant="rectangular" sx={{ borderRadius: 2, height: '100%', display: { xs: 'none', md: 'block' } }} />
                        <Skeleton variant="rectangular" sx={{ borderRadius: 2, height: '100%' }} />
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2, height: '100%' }}>
                            <Skeleton variant="rectangular" sx={{ borderRadius: 2, flex: 1 }} />
                            <Skeleton variant="rectangular" sx={{ borderRadius: 2, flex: 1 }} />
                        </Box>
                    </Box>

                    {/* Flash Sale Shelf Skeleton */}
                    <Skeleton variant="text" width={220} height={36} sx={{ mb: 2 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, mb: 4 }}>
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
                        ))}
                    </Box>

                    {/* Products Grid Skeleton */}
                    <Skeleton variant="text" width={260} height={36} sx={{ mb: 2 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
                        ))}
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: colorValues.bgDefault }}>
            {/* 1. Hero Zone: Category Sidebar, Promo Carousel, and Quick Deals */}
            <MarketplaceHero
                banners={homepageData?.heroBanners}
                sidePromos={homepageData?.sidePromoBanners}
            />

            {/* 2. Flash Sale Section with Countdown Timer and Claim Meters */}
            <FlashSaleSection flashSale={homepageData?.flashSale} />

            {/* 3. Hot Categories Visual Navigation Tiles */}
            <HotCategories categories={homepageData?.hotCategories} />

            {/* 4. What's New / Recent Uploads Shelf */}
            <WhatsNewSection products={homepageData?.newArrivals} />

            {/* 5. You May Also Like / Multi-vendor Algorithmic Grid with Seller Badges */}
            <YouMayAlsoLike products={homepageData?.recommended} />
        </Box>
    );
}

export default Home;
