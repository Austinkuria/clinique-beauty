import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Edit as EditIcon,
  BusinessCenter as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { sellerApi } from '../../../data/sellerApi';

const SellerDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        setLoading(true);
        const data = await sellerApi.getSellerById(sellerId);
        setSeller(data);
      } catch (err) {
        console.error('Error fetching seller details:', err);
        setError('Failed to load seller details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [sellerId]);

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" color="success" />;
      case 'pending':
        return <Chip label="Pending Review" color="warning" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" />;
      default:
        return <Chip label={status} />;
    }
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

  if (!seller) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Seller not found</Alert>
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/admin/sellers')}>
          Back to Sellers
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<EditIcon />}
          onClick={() => navigate(`/admin/sellers/${sellerId}/edit`)}
        >
          Edit Seller
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            {seller.businessName}
          </Typography>
          {getStatusChip(seller.status)}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>Contact Person:</strong> {seller.contactName}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>Email:</strong> {seller.email}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>Phone:</strong> {seller.phone || 'Not provided'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>Location:</strong> {seller.location || 'Not provided'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>Registration Date:</strong> {new Date(seller.registrationDate).toLocaleDateString()}
              </Typography>
            </Box>

            {seller.verificationDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <strong>Verification Date:</strong> {new Date(seller.verificationDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {seller.rejectionReason && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">
              <Typography variant="subtitle1">Rejection Reason:</Typography>
              <Typography variant="body2">{seller.rejectionReason}</Typography>
            </Alert>
          </Box>
        )}

        {seller.productCategories && Array.isArray(seller.productCategories) && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Product Categories:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {seller.productCategories.map((category, index) => (
                <Chip key={index} label={category} size="small" />
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SellerDetail;
