import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { useSellerApi } from '../api/apiClient';

const SellerGuard = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const sellerApi = useSellerApi();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);
  const [sellerStatus, setSellerStatus] = useState(null);

  useEffect(() => {
    const checkSellerAccess = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        console.log('SellerGuard: Checking seller access for user:', user.id);
        
        // Check if user has seller role and status
        const userData = await sellerApi.getUserProfile();
        
        console.log('SellerGuard: User data received:', userData);
        
        setUserRole(userData.role);
        
        // If user is a seller, check their seller status
        if (userData.role === 'seller') {
          try {            const sellerData = await sellerApi.getSellerProfile();
            setSellerStatus(sellerData.status);
            
            console.log('SellerGuard: Seller status:', sellerData.status);
            
            // Only allow access if seller is approved
            if (sellerData.status !== 'approved') {
              setError(`Your seller account is ${sellerData.status}. Please wait for approval or contact support.`);
            }
          } catch (sellerError) {
            console.error('SellerGuard: Error fetching seller profile:', sellerError);
            setError('Unable to verify seller status. Please try again or contact support.');
          }
        } else {
          setError('You do not have seller access. Please apply to become a seller.');
        }
        
      } catch (error) {
        console.error('SellerGuard: Error checking seller access:', error);
        setError('Unable to verify access permissions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkSellerAccess();
  }, [isLoaded, isSignedIn, user, sellerApi]);

  // Show loading spinner while checking authentication and permissions
  if (!isLoaded || loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Verifying seller access...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Show error if user doesn't have seller access or seller not approved
  if (error || (userRole === 'seller' && sellerStatus !== 'approved')) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          maxWidth: 600,
          mx: 'auto',
          p: 3
        }}
      >
        <Alert 
          severity={userRole === 'seller' && sellerStatus === 'pending' ? 'warning' : 'error'} 
          sx={{ mb: 3, width: '100%' }}
        >
          <Typography variant="h6" gutterBottom>
            {userRole === 'seller' && sellerStatus === 'pending' ? 'Account Pending Approval' : 'Access Denied'}
          </Typography>
          <Typography variant="body1">
            {error || 'You do not have permission to access the seller dashboard.'}
          </Typography>
        </Alert>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/'}
          >
            Go to Homepage
          </Button>
          
          {userRole !== 'seller' && (
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/seller/apply'}
            >
              Apply to Become a Seller
            </Button>
          )}
          
          {userRole === 'seller' && sellerStatus !== 'approved' && (
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/seller/status'}
            >
              Check Application Status
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  // Allow access for approved sellers
  if (userRole === 'seller' && sellerStatus === 'approved') {
    return children;
  }

  // Fallback redirect
  return <Navigate to="/" replace />;
};

export default SellerGuard;
