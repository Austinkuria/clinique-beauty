import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Banner from '../features/home/components/Banner';
import MobileBottomNav from '../components/MobileBottomNav';
import { Box } from '@mui/material';

function MainLayout() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Banner />
            <Navbar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    p: 0,
                    pb: { xs: 8, md: 0 } // Bottom padding to prevent bottom nav from covering content on mobile/tablet
                }}
            >
                <Outlet />
            </Box>
            <Footer />
            <MobileBottomNav />
        </Box>
    );
}

export default MainLayout;
