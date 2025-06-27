import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Container
} from '@mui/material';
import { useSellerApi } from '../../../api/apiClient';
import { ThemeContext } from '../../../context/ThemeContext';

const SellerApply = () => {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const sellerApi = useSellerApi();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [hasCheckedExisting, setHasCheckedExisting] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    registrationNumber: '',
    taxId: '',
    documents: [],
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolder: '',
    termsAccepted: false,
    categories: []
  });

  // Prefill user data when available
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setFormData(prev => ({
        ...prev,
        contactName: user.fullName || '',
        email: user.primaryEmailAddress?.emailAddress || ''
      }));
    }
  }, [isLoaded, isSignedIn, user]);

  // Check for existing application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (isLoaded && isSignedIn && !hasCheckedExisting) {
        setCheckingExisting(true);
        setHasCheckedExisting(true);
        
        try {
          const response = await sellerApi.getSellerStatus();
          console.log('[Apply] Checking existing application:', response);
          
          // Check if user has any application (pending, approved, or rejected)
          // The server returns { success: true, hasApplied: true, status: "pending", ... }
          if (response && response.success && response.hasApplied && response.status) {
            console.log('[Apply] Found existing application with status:', response.status);
            
            // Redirect to status page for any existing application
            navigate('/seller/status', { 
              replace: true,
              state: { 
                message: `You already have a seller application with status: ${response.status}. Check your details below.`
              }
            });
            return;
          }
        } catch (error) {
          // If error getting status (likely no application exists), continue with form
          console.log('[Apply] No existing application found or error occurred:', error.message);
        } finally {
          setCheckingExisting(false);
        }
      }
    };

    checkExistingApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, hasCheckedExisting]); // Only run when these specific values change

  const validateStep = (step) => {
    const errors = {};
    
    switch(step) {
      case 0:
        if (!formData.businessName.trim()) errors.businessName = 'Business name is required';
        if (!formData.businessType) errors.businessType = 'Business type is required';
        break;
      case 1:
        if (!formData.contactName.trim()) errors.contactName = 'Contact name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
        if (!formData.phone.trim()) errors.phone = 'Phone number is required';
        if (!formData.address.trim()) errors.address = 'Address is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.country.trim()) errors.country = 'Country is required';
        break;
      case 2:
        if (!formData.bankName.trim()) errors.bankName = 'Bank name is required';
        if (!formData.accountHolder.trim()) errors.accountHolder = 'Account holder name is required';
        if (!formData.accountNumber.trim()) errors.accountNumber = 'Account number is required';
        if (!formData.termsAccepted) errors.termsAccepted = 'You must accept the terms and conditions';
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (name === 'categories') {
      setFormData({
        ...formData,
        categories: typeof value === 'string' ? value.split(',') : value
      });
      return;
    }
    
    if (type === 'file') {
      setFormData({
        ...formData,
        documents: [...formData.documents, ...Array.from(files)]
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };
  
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData object to handle file uploads
      const data = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'documents' && key !== 'categories') {
          data.append(key, formData[key]);
        }
      });
      
      // Add categories as JSON
      data.append('categories', JSON.stringify(formData.categories));
      
      // Add all documents
      formData.documents.forEach((file, index) => {
        data.append(`document_${index}`, file);
      });
      
      // Submit seller application
      await sellerApi.applyAsSeller(data);
      
      setSuccess(true);
      
      // Reset form and go back to first step after short delay
      setTimeout(() => {
        navigate('/seller/status');
      }, 3000);
      
    } catch (err) {
      console.error('Seller application error:', err);
      
      // Handle specific error cases
      if (err.message?.includes('already exists') || err.message?.includes('already have')) {
        // If application already exists, redirect to status page
        setError('You already have a pending seller application. Redirecting to status page...');
        setTimeout(() => {
          navigate('/seller/status');
        }, 2000);
      } else {
        setError(err.message || 'Failed to submit seller application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Business Information', 'Contact Details', 'Payment Information'];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                error={!!formErrors.businessName}
                helperText={formErrors.businessName}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formErrors.businessType}>
                <InputLabel>Business Type</InputLabel>
                <Select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  label="Business Type"
                >
                  <MenuItem value="">Select type...</MenuItem>
                  <MenuItem value="Individual">Individual</MenuItem>
                  <MenuItem value="LLC">LLC</MenuItem>
                  <MenuItem value="Corporation">Corporation</MenuItem>
                  <MenuItem value="Partnership">Partnership</MenuItem>
                </Select>
                {formErrors.businessType && (
                  <Typography variant="caption" color="error">
                    {formErrors.businessType}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Product Categories</InputLabel>
                <Select
                  name="categories"
                  multiple
                  value={formData.categories}
                  onChange={handleChange}
                  label="Product Categories"
                >
                  <MenuItem value="Skincare">Skincare</MenuItem>
                  <MenuItem value="Makeup">Makeup</MenuItem>
                  <MenuItem value="Fragrance">Fragrance</MenuItem>
                  <MenuItem value="Hair">Hair Care</MenuItem>
                  <MenuItem value="Bath">Bath & Body</MenuItem>
                  <MenuItem value="Tools">Beauty Tools</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Registration Number"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax ID"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Person Name"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                error={!!formErrors.contactName}
                helperText={formErrors.contactName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                error={!!formErrors.address}
                helperText={formErrors.address}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                error={!!formErrors.city}
                helperText={formErrors.city}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State/Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Postal/ZIP Code"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                error={!!formErrors.country}
                helperText={formErrors.country}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
              >
                Upload Documents
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleChange}
                  name="documents"
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Please upload business registration, ID proof, and other relevant documents.
              </Typography>
            </Grid>
            {formData.documents.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Selected Documents:</Typography>
                <List dense>
                  {formData.documents.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={file.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                error={!!formErrors.bankName}
                helperText={formErrors.bankName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Holder Name"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleChange}
                required
                error={!!formErrors.accountHolder}
                helperText={formErrors.accountHolder}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                error={!!formErrors.accountNumber}
                helperText={formErrors.accountNumber}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Routing Number"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                  />
                }
                label="I accept the terms and conditions for seller registration"
              />
              {formErrors.termsAccepted && (
                <Typography variant="caption" color="error" display="block">
                  {formErrors.termsAccepted}
                </Typography>
              )}
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  if (!isLoaded || (isSignedIn && checkingExisting)) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 5 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            {checkingExisting ? 'Checking existing application...' : 'Loading...'}
          </Typography>
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
            You need to be signed in to apply as a seller. Please sign in and try again.
          </Typography>
        </Alert>
        <Button variant="contained" onClick={() => navigate('/auth/login')}>
          Sign In
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Become a Seller</Typography>
      <Typography color="text.secondary" paragraph>
        Complete this form to apply to become a seller on Clinique Beauty Marketplace
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Your seller application has been submitted successfully! We'll review your application and get back to you soon.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            You'll be redirected to the status page in a few seconds...
          </Typography>
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading || !formData.termsAccepted}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Processing...' : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default SellerApply;
