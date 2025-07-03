import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    CircularProgress, 
    Alert,
    // Add other necessary MUI components
} from '@mui/material';
import { useApi } from '../../../api/apiClient';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  InputAdornment,
  FormControlLabel,
  Switch
} from '@mui/material';
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
    const location = useLocation();
    const navigate = useNavigate();
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // Determine if we're in edit mode based on URL
    const isEditMode = location.pathname.includes('/edit/');
    const isNewMode = location.pathname.includes('/new');
    
    useEffect(() => {
        const fetchCampaign = async () => {
            // Only fetch existing campaign data if we're not creating a new one
            if (!isNewMode && id) {
                setLoading(true);
                try {
                    // In a real app, this would be an API call
                    // const response = await api.getCampaign(id);
                    // setCampaign(response.data);
                    
                    // Mock data for demonstration
                    setCampaign({
                        id: id,
                        name: `Campaign ${id}`,
                        status: 'active',
                        startDate: '2025-06-01',
                        endDate: '2025-07-01',
                        budget: 5000,
                        target: 'All customers',
                        description: 'This is a sample campaign description.',
                        // Add other campaign properties as needed
                    });
                    
                    setError(null);
                } catch (err) {
                    console.error('Error fetching campaign:', err);
                    setError('Failed to load campaign details. Please try again.');
                } finally {
                    setLoading(false);
                }
            } else {
                // For new campaigns, initialize with default values
                setCampaign({
                    name: '',
                    status: 'draft',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                    budget: 1000,
                    target: '',
                    description: '',
                    // Add other default values
                });
                setLoading(false);
            }
        };
        
        fetchCampaign();
    }, [id, isNewMode]);
    
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
          if (isNewMode) {
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/admin/marketing/campaigns')}
                >
                    Back to Campaigns
                </Button>
            </Box>
        );
    }
    
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {isNewMode ? 'Create New Campaign' : isEditMode ? 'Edit Campaign' : 'Campaign Details'}
                </Typography>
                
                <Button 
                    variant="outlined"
                    onClick={() => navigate('/admin/marketing/campaigns')}
                >
                    Back to List
                </Button>
            </Box>
            
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
                            {saving ? <CircularProgress size={24} /> : (isNewMode ? 'Create Campaign' : 'Save Changes')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default CampaignDetail;
