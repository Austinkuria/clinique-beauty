import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { useSellerApi } from '../data/sellerApi';

const SellerGuard = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const { getSellers } = useSellerApi();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [sellerStatus, setSellerStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSellerAccess = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        console.log('SellerGuard: Checking seller access for user:', user.id);
        
        // Check if user has seller role in Clerk metadata (similar to admin check)
        const userRole = user.unsafeMetadata?.role || 
                        user.publicMetadata?.role || 
                        user.privateMetadata?.role || 
                        null;
        
        console.log('SellerGuard: Seller role check result:', userRole === 'seller');
        
        setUserRole(userRole);
        
        if (userRole !== 'seller') {
          setError('You do not have seller access. Please apply to become a seller.');
          setLoading(false);
          return;
        }

        // If user has seller role, check their seller status in Supabase
        try {
          // Get all sellers and find the one matching this Clerk user
          const allSellers = await getSellers();
          console.log('SellerGuard: All sellers:', allSellers);
          
          const sellerData = allSellers.find(seller => 
            seller.clerk_id === user.id || 
            seller.clerkId === user.id ||
            seller.email === user.primaryEmailAddress?.emailAddress
          );
          
          console.log('SellerGuard: Found seller data:', sellerData);
          
          if (!sellerData) {
            setError('Seller profile not found. Please contact support.');
            setLoading(false);
            return;
          }
          
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
        
      } catch (error) {
        console.error('SellerGuard: Error checking seller access:', error);
        setError('Unable to verify access permissions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkSellerAccess();
  }, [isLoaded, isSignedIn, user, getSellers]);

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
