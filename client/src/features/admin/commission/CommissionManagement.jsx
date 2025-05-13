import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Grid, Paper, Typography, Tab, Tabs,
  Card, CardContent, CircularProgress, Alert
} from '@mui/material';
import CommissionRates from './CommissionRates';
import CommissionSettings from './CommissionSettings';
import CommissionHistory from './CommissionHistory';
import { commissionApi } from '../../../data/commissionApi';

const CommissionManagement = () => {
  const [commissionData, setCommissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchCommissionData = async () => {
      try {
        setLoading(true);
        const data = await commissionApi.getCommissionStructure();
        setCommissionData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load commission data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionData();
  }, []);

  const handleCommissionUpdate = async (updatedData) => {
    try {
      setLoading(true);
      // This would need to be implemented properly based on what's being updated
      const data = await commissionApi.updateCommissionTiers(updatedData);
      setCommissionData(data);
      setError(null);
    } catch (err) {
      setError('Failed to update commission structure. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Commission Management</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>Commission Overview</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">Average Commission Rate</Typography>
                <Typography variant="h4">
                  {loading ? <CircularProgress size={24} /> : 
                    commissionData ? `${commissionData.averageRate}%` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">Commission Paid (Month)</Typography>
                <Typography variant="h4">
                  {loading ? <CircularProgress size={24} /> : 
                    commissionData ? `$${commissionData.monthlyPaid.toLocaleString()}` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">Active Sellers</Typography>
                <Typography variant="h4">
                  {loading ? <CircularProgress size={24} /> : 
                    commissionData ? commissionData.activeSellers.toLocaleString() : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Commission Rates" />
            <Tab label="Commission Settings" />
            <Tab label="Commission History" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 3 }}>
          {tabValue === 0 && (
            <CommissionRates 
              commissionData={commissionData} 
              loading={loading}
              onUpdate={handleCommissionUpdate}
            />
          )}
          {tabValue === 1 && (
            <CommissionSettings 
              commissionData={commissionData} 
              loading={loading}
              onUpdate={handleCommissionUpdate}
            />
          )}
          {tabValue === 2 && (
            <CommissionHistory />
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default CommissionManagement;
