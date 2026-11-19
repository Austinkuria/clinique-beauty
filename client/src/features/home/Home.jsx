// client/src/features/home/Home.jsx
// Centralised dynamic homepage orchestrating marketplace hero, flash sales, category hubs, and feeds

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
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
