import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Save as SaveIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { marketingApi } from '../../../data/marketingApi';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewCampaign = id === 'new';
  
  const [campaign, setCampaign] = useState({
    name: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    type: 'seasonal',
    target: 'all_customers',
    discountType: 'percentage',
    discountValue: 15,
    status: 'draft',
    products: []
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (isNewCampaign) return;
      
      try {
        setLoading(true);
        const response = await marketingApi.getCampaignById(id);
        setCampaign(response.data);
      } catch (error) {
        setError('Failed to load campaign details');
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, isNewCampaign]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setCampaign(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      let response;
      if (isNewCampaign) {
        response = await marketingApi.createCampaign(campaign);
      } else {
        response = await marketingApi.updateCampaign(id, campaign);
      }
      
      setSuccess(true);
      
      // Redirect to campaign list after successful creation or update
      setTimeout(() => {
        navigate('/admin/marketing/campaigns');
      }, 1500);
    } catch (error) {
      setError('Failed to save campaign');
      console.error('Error saving campaign:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }
    
    try {
      setLoading(true);
      await marketingApi.deleteCampaign(id);
      navigate('/admin/marketing/campaigns');
    } catch (error) {
      setError('Failed to delete campaign');
      console.error('Error deleting campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            onClick={() => navigate('/admin/marketing/campaigns')}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back to Campaigns
          </Button>
          <Typography variant="h4">
            {isNewCampaign ? 'Create New Campaign' : 'Edit Campaign'}
          </Typography>
        </Box>
        
        {!isNewCampaign && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete Campaign
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>Campaign saved successfully!</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                name="name"
                value={campaign.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={campaign.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={new Date(campaign.startDate)}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={new Date(campaign.endDate)}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  name="type"
                  value={campaign.type}
                  onChange={handleChange}
                  label="Campaign Type"
                >
                  <MenuItem value="seasonal">Seasonal</MenuItem>
                  <MenuItem value="holiday">Holiday</MenuItem>
                  <MenuItem value="flash">Flash Sale</MenuItem>
                  <MenuItem value="welcome">Welcome/New Customer</MenuItem>
                  <MenuItem value="loyalty">Loyalty Program</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  name="target"
                  value={campaign.target}
                  onChange={handleChange}
                  label="Target Audience"
                >
                  <MenuItem value="all_customers">All Customers</MenuItem>
                  <MenuItem value="new_customers">New Customers</MenuItem>
                  <MenuItem value="existing_customers">Existing Customers</MenuItem>
                  <MenuItem value="vip_customers">VIP Customers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  name="discountType"
                  value={campaign.discountType}
                  onChange={handleChange}
                  label="Discount Type"
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                  <MenuItem value="bogo">Buy One Get One</MenuItem>
                  <MenuItem value="free_shipping">Free Shipping</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount Value"
                name="discountValue"
                type="number"
                value={campaign.discountValue}
                onChange={handleChange}
                InputProps={{
                  endAdornment: campaign.discountType === 'percentage' ? (
                    <InputAdornment position="end">%</InputAdornment>
                  ) : campaign.discountType === 'fixed' ? (
                    <InputAdornment position="end">$</InputAdornment>
                  ) : null
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={campaign.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="ended">Ended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={campaign.featured}
                    onChange={(e) => {
                      setCampaign(prev => ({
                        ...prev,
                        featured: e.target.checked
                      }));
                    }}
                  />
                }
                label="Featured Campaign"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : (isNewCampaign ? 'Create Campaign' : 'Save Changes')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CampaignDetail;
