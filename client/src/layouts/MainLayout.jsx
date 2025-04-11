import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Banner from '../features/home/components/Banner';
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
                    // Remove fixed height calculation which might be causing spacing issues
                    // Let content determine its own height
                    width: '100%',
                    p: 0 // Ensure no padding is affecting the Hero component
                }}
            >
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
}

export default MainLayout;
