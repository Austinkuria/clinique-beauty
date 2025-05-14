import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { sellerApi } from '../../../data/sellerApi';

const SellerEdit = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    location: '',
    status: '',
    rejectionReason: ''
  });

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        const data = await sellerApi.getSellerById(sellerId);
        if (!data) {
          setError('Seller not found');
          return;
        }
        
        setFormData({
          businessName: data.businessName || '',
          contactName: data.contactName || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          status: data.status || '',
          rejectionReason: data.rejectionReason || ''
        });
      } catch (err) {
        console.error('Error fetching seller data:', err);
        setError('Failed to load seller data');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Update the verification status if it's changed
      if (formData.status !== 'pending') {
        await sellerApi.updateVerificationStatus(sellerId, formData.status, formData.rejectionReason);
      }
      
      // TODO: Add API call to update other seller fields when that endpoint is ready
      
      setSnackbar({
        open: true,
        message: 'Seller information updated successfully',
        severity: 'success'
      });
      
      // Navigate back to details page after short delay
      setTimeout(() => {
        navigate(`/admin/sellers/${sellerId}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating seller:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update seller information',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/admin/sellers')}
          sx={{ mt: 2 }}
        >
          Back to Sellers
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/admin/sellers/${sellerId}`)}>
          Back to Seller Details
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Edit Seller</Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                label="Contact Person"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                  required
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.status === 'rejected' && (
              <Grid item xs={12}>
                <TextField
                  label="Rejection Reason"
                  name="rejectionReason"
                  value={formData.rejectionReason}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  required
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  onClick={() => navigate(`/admin/sellers/${sellerId}`)}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SellerEdit;
