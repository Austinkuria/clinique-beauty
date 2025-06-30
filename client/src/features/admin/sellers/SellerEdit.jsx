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
  Snackbar,
  FormHelperText
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useSellerApi } from '../../../data/sellerApi';
import { 
  validateEmail, 
  validatePhone, 
  validateRequired, 
  sanitizeInput,
  sanitizeObject
} from '../../../utils/inputValidation';

const SellerEdit = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { getSellerById, updateSeller } = useSellerApi();
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
  
  // Form validation state
  const [errors, setErrors] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    status: '',
    rejectionReason: ''
  });
  
  // Original data state to track changes
  const [originalData, setOriginalData] = useState(null);

  // Load seller data
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        const data = await getSellerById(sellerId);
        if (!data) {
          setError('Seller not found');
          return;
        }
        
        // Set form data
        const formattedData = {
          businessName: data.businessName || '',
          contactName: data.contactName || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          status: data.status || '',
          rejectionReason: data.rejectionReason || ''
        };
        
        setFormData(formattedData);
        setOriginalData(formattedData); // Store original data for comparison
      } catch (err) {
        console.error('Error fetching seller data:', err);
        setError('Failed to load seller data');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId, getSellerById]);

  // Validate form field using shared validation utilities
  const validateField = (name, value) => {
    switch (name) {
      case 'businessName':
        return validateRequired(value) ? '' : 'Business name is required';
      case 'contactName':
        return validateRequired(value) ? '' : 'Contact name is required';
      case 'email':
        return validateEmail(value) ? '' : 'Please enter a valid email address';
      case 'phone':
        // Allow empty phone, but validate if provided
        return !value || validatePhone(value) ? '' : 'Please enter a valid phone number';
      case 'status':
        return validateRequired(value) ? '' : 'Status is required';
      case 'rejectionReason':
        return (validateRequired(value) || formData.status !== 'rejected') 
          ? '' 
          : 'Rejection reason is required when status is rejected';
      default:
        return '';
    }
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {
      businessName: validateField('businessName', formData.businessName),
      contactName: validateField('contactName', formData.contactName),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      status: validateField('status', formData.status),
      rejectionReason: validateField('rejectionReason', formData.rejectionReason)
    };
    
    setErrors(newErrors);
    
    // Form is valid if no error messages exist
    return !Object.values(newErrors).some(error => error);
  };

  // Handle input change with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input using the shared utility
    const sanitizedValue = sanitizeInput(value);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Validate the field
    const errorMessage = validateField(name, sanitizedValue);
    
    // Update errors state
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
    
    // Special case: validate rejection reason when status changes
    if (name === 'status') {
      const rejectionError = sanitizedValue === 'rejected' && !formData.rejectionReason.trim() 
        ? 'Rejection reason is required when status is rejected' 
        : '';
        
      setErrors(prev => ({
        ...prev,
        rejectionReason: rejectionError
      }));
    }
  };

  // Check if form has been modified
  const hasChanges = () => {
    if (!originalData) return false;
    
    return Object.keys(formData).some(key => {
      // Skip rejectionReason comparison if status is not rejected
      if (key === 'rejectionReason' && formData.status !== 'rejected') {
        return false;
      }
      return formData[key] !== originalData[key];
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the validation errors before saving',
        severity: 'error'
      });
      return;
    }
    
    // Check for actual changes
    if (!hasChanges()) {
      setSnackbar({
        open: true,
        message: 'No changes to save',
        severity: 'info'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      console.log('Submitting form data with authentication via Clerk hook');
      
      // Sanitize the entire form data object before submission
      const sanitizedFormData = sanitizeObject(formData);
      
      console.log(`Updating seller ${sellerId} information and status from ${originalData.status} to ${sanitizedFormData.status}`);
      
      const result = await updateSeller(
        sellerId, 
        sanitizedFormData
      );
      
      console.log('Update result:', result);
      
      setSnackbar({
        open: true,
        message: `Seller information updated successfully`,
        severity: 'success'
      });
      
      // Update original data to reflect the changes
      setOriginalData({...sanitizedFormData});
      
      // Navigate back to details page after short delay
      setTimeout(() => {
        navigate(`/admin/sellers/${sellerId}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating seller:', err);
      
      // Show a more specific error message
      let errorMessage = 'Failed to update seller information';
      if (err.message === 'Authentication required for this operation') {
        errorMessage = 'You need to be logged in as an admin to update seller status. Please try logging in again.';
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMessage = `Error: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel confirmation
  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        navigate(`/admin/sellers/${sellerId}`);
      }
    } else {
      navigate(`/admin/sellers/${sellerId}`);
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
            {/* First column of inputs */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                error={!!errors.businessName}
                helperText={errors.businessName}
                disabled={saving}
                inputProps={{ 
                  maxLength: 100,
                  'data-testid': 'business-name-input'
                }}
              />
              
              <TextField
                label="Contact Person"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                error={!!errors.contactName}
                helperText={errors.contactName}
                disabled={saving}
                inputProps={{ 
                  maxLength: 100,
                  'data-testid': 'contact-name-input'
                }}
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
                error={!!errors.email}
                helperText={errors.email}
                disabled={saving}
                inputProps={{ 
                  maxLength: 255,
                  'data-testid': 'email-input'
                }}
              />
            </Grid>
            
            {/* Second column of inputs */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!errors.phone}
                helperText={errors.phone || "Format: +254XXXXXXXXX"}
                disabled={saving}
                inputProps={{ 
                  maxLength: 20,
                  'data-testid': 'phone-input'
                }}
              />
              
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                disabled={saving}
                inputProps={{ 
                  maxLength: 200,
                  'data-testid': 'location-input'
                }}
              />
              
              <FormControl 
                fullWidth 
                margin="normal" 
                error={!!errors.status}
                disabled={saving}
                required
              >
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                  inputProps={{ 'data-testid': 'status-select' }}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* Rejection reason field - placed in a new row that spans the entire width */}
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
                  error={!!errors.rejectionReason}
                  helperText={errors.rejectionReason || "Please provide a clear reason for rejection"}
                  disabled={saving}
                  inputProps={{ 
                    maxLength: 1000,
                    'data-testid': 'rejection-reason-input'
                  }}
                />
              </Grid>
            )}
          </Grid>
          
          {/* Action buttons - placed OUTSIDE the Grid container to ensure they're at the bottom */}
          <Box sx={{ 
            mt: 4, 
            display: 'flex', 
            justifyContent: 'flex-end',
            borderTop: '1px solid #e0e0e0',
            paddingTop: 3
          }}>
            <Button
              type="button"
              onClick={handleCancel}
              sx={{ mr: 2 }}
              disabled={saving}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={saving || (!hasChanges())}
              data-testid="save-button"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        data-testid="snackbar"
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
