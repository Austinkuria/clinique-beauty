import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAdmin } from '../../../context/AdminContext';

const AdminLayout = () => {
  // Always define all hooks at the top level
  const [open, setOpen] = useState(true);
  const { isAdmin, loading } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle sidebar toggling
  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Check admin status once on initial load
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin-setup', { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  // Only render the layout when finished loading and user is admin
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading admin panel...</p>
      </Box>
    );
  }

  // If user is not admin, return null (the useEffect will handle redirection)
  if (!isAdmin) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header open={open} toggleDrawer={toggleDrawer} />
      <Sidebar open={open} toggleDrawer={toggleDrawer} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? 240 : 64}px)` },
          marginLeft: { sm: `${open ? 240 : 64}px` },
          marginTop: '64px',
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
