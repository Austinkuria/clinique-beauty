import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Button,
  Container,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Cancel,
  Business,
  Email,
  Phone,
  LocationOn,
  AccountBalance
} from '@mui/icons-material';
import { useSellerApi } from '../../../api/apiClient';

const SellerStatus = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();
  const sellerApi = useSellerApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationData, setApplicationData] = useState(null);

  const fetchApplicationStatus = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
        const response = await sellerApi.getSellerStatus();
      setApplicationData(response);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch application status');
      console.error('Error fetching application status:', err);
    } finally {
      setLoading(false);
    }
  }, [sellerApi]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchApplicationStatus();
    }
  }, [isLoaded, isSignedIn, fetchApplicationStatus]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Schedule color="warning" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <Schedule color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'approved':
        return 'Congratulations! Your seller application has been approved. You can now start selling on our platform.';
      case 'pending':
        return 'Your seller application is currently under review. We\'ll notify you once a decision has been made.';
      case 'rejected':
        return 'Unfortunately, your seller application was not approved. Please review the feedback below and consider reapplying.';
      default:
        return 'Application status unknown.';
    }
  };

  if (!isLoaded) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!isSignedIn) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Sign In Required</Typography>
          <Typography>
            You need to be signed in to check your seller application status.
          </Typography>
        </Alert>
        <Button variant="contained" onClick={() => navigate('/auth/login')}>
          Sign In
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Loading application status...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Error</Typography>
          <Typography>{error}</Typography>
        </Alert>
        <Button variant="outlined" onClick={fetchApplicationStatus}>
          Try Again
        </Button>
      </Container>
    );
  }

  if (!applicationData || !applicationData.hasApplied) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>No Seller Application Found</Typography>
          <Typography color="text.secondary" paragraph>
            You haven't submitted a seller application yet.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/seller/apply')}
          >
            Apply to Become a Seller
          </Button>
        </Paper>
      </Container>
    );
  }

  const { status, applicationDate, updateDate, rejectionReason } = applicationData;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Seller Application Status</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getStatusIcon(status)}
          <Chip 
            label={status?.toUpperCase() || 'UNKNOWN'} 
            color={getStatusColor(status)}
            sx={{ ml: 2, fontWeight: 'bold' }}
          />
        </Box>
        
        <Alert severity={getStatusColor(status)} sx={{ mb: 3 }}>
          <Typography variant="body1">
            {getStatusMessage(status)}
          </Typography>
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Application Submitted
            </Typography>
            <Typography variant="body1">
              {applicationDate ? new Date(applicationDate).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
          {updateDate && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {new Date(updateDate).toLocaleDateString()}
              </Typography>
            </Grid>
          )}
        </Grid>

        {rejectionReason && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              Rejection Reason
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {rejectionReason}
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {status === 'approved' && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/seller')}
          >
            Go to Seller Dashboard
          </Button>
        )}
        
        {status === 'rejected' && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/seller/apply')}
          >
            Reapply as Seller
          </Button>
        )}
        
        <Button 
          variant="outlined"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default SellerStatus;
