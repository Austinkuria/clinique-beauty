import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Banner from '../features/home/components/Banner';
import { Box } from '@mui/material';

function MainLayout() {
    return (
        <Box>
            <Banner />
            <Navbar />
            <Box sx={{ minHeight: 'calc(100vh - 64px - 200px)' }}>
                <Outlet />
            </Box>
            <Footer /> 
        </Box>
    );
}

export default MainLayout;
