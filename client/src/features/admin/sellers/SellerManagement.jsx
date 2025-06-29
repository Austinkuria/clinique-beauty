import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Box, Grid, Paper, Typography, Tab, Tabs, Alert, Badge
} from '@mui/material';
import { useSellerApi } from '../../../data/sellerApi';
import SellerVerification from './SellerVerification';
import SellerOnboarding from './SellerOnboarding';
import SellerList from './SellerList';

const SellerManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sellers, setSellers] = useState([]); // Initialize as empty array
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const { getSellers, getVerificationRequests } = useSellerApi();

  // Memoize the fetch function to prevent infinite re-renders
  const fetchSellerData = useCallback(async () => {
    if (hasInitialized) return; // Prevent multiple calls
    
    try {
      setLoading(true);
      setHasInitialized(true);
      console.log('Fetching seller data...');
      
      const [sellersData, verificationData] = await Promise.all([
        getSellers(),
        getVerificationRequests()
      ]);
      
      console.log('Sellers data received:', sellersData);
      console.log('Verification data received:', verificationData);
      
      setSellers(Array.isArray(sellersData) ? sellersData : []); // Ensure it's an array
      setPendingVerifications(Array.isArray(verificationData) ? verificationData : []);
      setError(null);
    } catch (err) {
      setError('Failed to load seller data. Please try again.');
      console.error('Error in fetchSellerData:', err);
      // Set empty arrays on error to prevent further issues
      setSellers([]);
      setPendingVerifications([]);
    } finally {
      setLoading(false);
    }
  }, [getSellers, getVerificationRequests, hasInitialized]);

  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  const handleVerificationComplete = useCallback(async () => {
    // Refresh the verification requests
    try {
      const verificationData = await getVerificationRequests();
      setPendingVerifications(Array.isArray(verificationData) ? verificationData : []);
    } catch (err) {
      console.error('Failed to refresh verification requests:', err);
    }
  }, [getVerificationRequests]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Seller Management</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                label="All Sellers" 
                id="tab-0"
                aria-controls="tabpanel-0"
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Verification Requests
                    {pendingVerifications.length > 0 && (
                      <Box 
                        component="span" 
                        sx={{ 
                          ml: 1,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem'
                        }}
                      >
                        {pendingVerifications.length}
                      </Box>
                    )}
                  </Box>
                }
                id="tab-1"
                aria-controls="tabpanel-1"
              />
              <Tab 
                label="Seller Onboarding" 
                id="tab-2"
                aria-controls="tabpanel-2"
              />
            </Tabs>
          </Box>
          
          <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" aria-labelledby="tab-0" sx={{ py: 3 }}>
            {tabValue === 0 && <SellerList sellers={sellers} loading={loading} />}
          </Box>
          
          <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" aria-labelledby="tab-1" sx={{ py: 3 }}>
            {tabValue === 1 && (
              <SellerVerification 
                requests={pendingVerifications} 
                loading={loading}
                onVerificationComplete={handleVerificationComplete}
              />
            )}
          </Box>
          
          <Box role="tabpanel" hidden={tabValue !== 2} id="tabpanel-2" aria-labelledby="tab-2" sx={{ py: 3 }}>
            {tabValue === 2 && <SellerOnboarding />}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SellerManagement;
