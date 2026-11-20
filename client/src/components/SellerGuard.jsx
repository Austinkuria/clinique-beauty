// client/src/components/SellerGuard.jsx
// Security guard: restricts /seller to approved sellers; unauthorized users receive a 404 Not Found response

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSellerApi } from '../data/sellerApi';
import NotFound from '../pages/NotFound';

const SellerGuard = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { getSellerById } = useSellerApi();
  const [loading, setLoading] = useState(true);
  const [isApprovedSeller, setIsApprovedSeller] = useState(false);

  // Check if user has seller role in Clerk metadata or database
  const checkSellerRole = () => {
    if (!user || !isLoaded) {
      return false;
    }
    
    return (
      (user.unsafeMetadata?.role === 'seller') ||
      (user.privateMetadata?.role === 'seller') ||
      (user.publicMetadata?.role === 'seller')
    );
  };

  useEffect(() => {
    let isMounted = true;

    const checkSellerAccess = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn || !user) {
        if (isMounted) {
          setIsApprovedSeller(false);
          setLoading(false);
        }
        return;
      }

      try {
        const hasSellerRoleInClerk = checkSellerRole();
        
        // 1. Verify seller record in Supabase database
        const sellerData = await getSellerById(user.id);
        const isApprovedInSellers = sellerData && (sellerData.status === 'approved' || sellerData.status === 'active');

        // 2. Query user profile from database API if needed
        let isSellerInDb = false;
        if (!hasSellerRoleInClerk && !isApprovedInSellers) {
          try {
            const token = await getToken();
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
            const res = await fetch(`${baseUrl}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const prof = await res.json();
              isSellerInDb = (prof?.role || '').toLowerCase() === 'seller';
            }
          } catch {}
        }

        const isAuthorizedSeller = hasSellerRoleInClerk || isApprovedInSellers || isSellerInDb;

        if (isMounted) {
          if (isAuthorizedSeller) {
            setIsApprovedSeller(true);
            // Sync Clerk's local metadata if missing
            if (user.unsafeMetadata?.role !== 'seller' && typeof user.update === 'function') {
              user.update({ unsafeMetadata: { role: 'seller' } }).catch(() => {});
            }
            localStorage.removeItem('userIsAdmin');
          } else {
            setIsApprovedSeller(false);
          }
        }
      } catch (err) {
        console.warn('Seller access check failed:', err.message);
        if (isMounted) {
          setIsApprovedSeller(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSellerAccess();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, user, getSellerById]);

  // Show neutral loading indicator without leaking route status
  if (!isLoaded || loading) {
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

  // If user is not an approved seller, mask the route behind a 404 Not Found page
  if (!isApprovedSeller) {
    return <NotFound />;
  }

  return children;
};

export default SellerGuard;
