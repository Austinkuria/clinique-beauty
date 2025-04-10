import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Import the Footer component
import { Box } from '@mui/material';

function MainLayout() {
    return (
        <Box>
            <Navbar />
            <Box sx={{ minHeight: 'calc(100vh - 64px - 200px)' }}>
                <Outlet />
            </Box>
            <Footer /> 
        </Box>
    );
}

export default MainLayout;
