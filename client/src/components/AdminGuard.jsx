import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAdmin } from '../context/AdminContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const AdminGuard = ({ children }) => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      console.log("Access denied: User is not an admin");
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin-setup', { replace: true }); // Make sure we use '/admin-setup' not '/admin/setup'
    }
  }, [isAdmin, loading, navigate]);

  // Show loading while checking admin status
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verifying admin access...
        </Typography>
      </Box>
    );
  }

  // Only render children if user is admin
  return isAdmin ? children : null;
};

export default AdminGuard;
