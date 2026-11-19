// client/src/components/AdminGuard.jsx
// Security guard: restricts /admin to authorized administrators; non-admins receive a 404 Not Found response

import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { CircularProgress, Box, Typography } from '@mui/material';
import NotFound from '../pages/NotFound';

const AdminGuard = ({ children }) => {
  const { isAdmin, loading } = useAdmin();

  // Show neutral loading indicator while resolving credentials without leaking route significance
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  // If user is not an administrator, mask the route behind a 404 Not Found page
  if (!isAdmin) {
    return <NotFound />;
  }

  return children;
};

export default AdminGuard;
