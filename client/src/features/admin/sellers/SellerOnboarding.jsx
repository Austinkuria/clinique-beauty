import React, { useState } from 'react';
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
  ListItemText
} from '@mui/material';

const SellerOnboarding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
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
    termsAccepted: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
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
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData object to handle file uploads
      const data = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'documents') {
          data.append(key, formData[key]);
        }
      });
      
      // Add all documents
      formData.documents.forEach(file => {
        data.append('documents', file);
      });
      
      // Submit to API (stub - you'd need to create this endpoint)
      // await sellerApi.createSeller(data);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Reset form after success
      setFormData({
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
        termsAccepted: false
      });
      
      // Go back to first step
      setActiveStep(0);
      
    } catch (err) {
      setError('Failed to submit seller application. Please try again.');
      console.error(err);
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
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State/Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Postal/ZIP Code"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                required
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Routing Number"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleChange}
                required
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
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Seller Onboarding</Typography>
      <Typography color="text.secondary" paragraph>Complete the form to register a new seller</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>Seller application submitted successfully!</Alert>}
      
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep}>
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
                  color="success"
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
    </Box>
  );
};

export default SellerOnboarding;
