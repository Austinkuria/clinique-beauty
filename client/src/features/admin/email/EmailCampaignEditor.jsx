import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, Tabs, Tab, Divider, CircularProgress, Alert, Autocomplete,
  Chip, IconButton, Card, CardActionArea, CardMedia, CardContent, Dialog,
  DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Preview as PreviewIcon,
  ArrowBack as BackIcon,
  AddPhotoAlternate as ImageIcon,
  Link as LinkIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { emailCampaigns, emailTemplates, emailSegments } from '../../../data/mockEmailCampaignData';
import { format } from 'date-fns';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EmailCampaignEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== 'create';
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  
  const [campaignData, setCampaignData] = useState({
    id: '',
    name: '',
    subject: '',
    status: 'draft',
    recipients: {
      segmentType: 'segment',
      segmentId: '',
      segmentName: '',
      count: 0
    },
    content: {
      template: '',
      header: '',
      body: '',
      featuredProducts: [],
      cta: {
        text: 'Shop Now',
        url: ''
      }
    }
  });
  
  const [previewUrl, setPreviewUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  
  useEffect(() => {
    if (isEditMode) {
      // Fetch campaign data
      setTimeout(() => {
        const campaign = emailCampaigns.find(c => c.id === id);
        if (campaign) {
          setCampaignData(campaign);
          setError(null);
        } else {
          setError('Campaign not found');
        }
        setLoading(false);
      }, 800);
    }
  }, [id, isEditMode]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleContentChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };
  
  const handleCtaChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        cta: {
          ...prev.content.cta,
          [field]: value
        }
      }
    }));
  };
  
  const handleRecipientChange = (segmentId) => {
    const segment = emailSegments.find(s => s.id === segmentId);
    if (segment) {
      setCampaignData(prev => ({
        ...prev,
        recipients: {
          segmentType: 'segment',
          segmentId: segment.id,
          segmentName: segment.name,
          count: segment.count
        }
      }));
    }
  };
  
  const handleTemplateSelect = (templateId) => {
    setCampaignData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        template: templateId
      }
    }));
    setShowTemplateDialog(false);
  };
  
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Validate required fields
      if (!campaignData.name) {
        setError('Campaign name is required');
        setSaving(false);
        return;
      }
      
      if (!campaignData.subject) {
        setError('Email subject is required');
        setSaving(false);
        return;
      }
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setSaving(false);
      
      // Navigate back to list after save
      setTimeout(() => {
        navigate('/admin/email-marketing');
      }, 1500);
      
    } catch (err) {
      setError('Failed to save campaign');
      setSaving(false);
    }
  };
  
  const handleScheduleSend = () => {
    setShowScheduleDialog(true);
  };
  
  const confirmSchedule = async () => {
    try {
      setSaving(true);
      
      // Validate scheduled date is in the future
      if (scheduledDate <= new Date()) {
        setError('Scheduled date must be in the future');
        setSaving(false);
        return;
      }
      
      // In a real app, this would schedule via API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCampaignData(prev => ({
        ...prev,
        status: 'scheduled',
        scheduledDate: scheduledDate.toISOString()
      }));
      
      setSuccess(true);
      setSaving(false);
      setShowScheduleDialog(false);
      
      setTimeout(() => {
        navigate('/admin/email-marketing');
      }, 1500);
      
    } catch (err) {
      setError('Failed to schedule campaign');
      setSaving(false);
    }
  };
  
  const handleSendNow = async () => {
    if (window.confirm('Are you sure you want to send this campaign now?')) {
      try {
        setSaving(true);
        
        // In a real app, this would send via API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setCampaignData(prev => ({
          ...prev,
          status: 'sent',
          sentDate: new Date().toISOString()
        }));
        
        setSuccess(true);
        setSaving(false);
        
        setTimeout(() => {
          navigate('/admin/email-marketing');
        }, 1500);
        
      } catch (err) {
        setError('Failed to send campaign');
        setSaving(false);
      }
    }
  };
  
  const handlePreview = () => {
    // In a real app, this would generate an actual preview URL
    setPreviewUrl(`/admin/email-marketing/preview/${campaignData.id || 'new'}`);
    window.open(previewUrl, '_blank');
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/admin/email-marketing')} sx={{ mr: 1 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">
            {isEditMode ? 'Edit Campaign' : 'Create Email Campaign'}
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
            sx={{ mr: 1 }}
          >
            Preview
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveDraft}
            disabled={saving}
            sx={{ mr: 1 }}
          >
            Save Draft
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ScheduleIcon />}
            onClick={handleScheduleSend}
            disabled={saving}
            sx={{ mr: 1 }}
          >
            Schedule
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleSendNow}
            disabled={saving}
          >
            Send Now
          </Button>
        </Box>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>Campaign saved successfully!</Alert>}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Content" />
          <Tab label="Recipients" />
          <Tab label="Settings" />
        </Tabs>
        
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={campaignData.name}
                onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Subject"
                value={campaignData.subject}
                onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Email Template: {campaignData.content.template ? 
                    emailTemplates.find(t => t.id === campaignData.content.template)?.name || campaignData.content.template 
                    : 'None Selected'}
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowTemplateDialog(true)}
                >
                  {campaignData.content.template ? 'Change Template' : 'Select Template'}
                </Button>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Header"
                value={campaignData.content.header}
                onChange={(e) => handleContentChange('header', e.target.value)}
                placeholder="Main headline of your email"
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Email Body</Typography>
              <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
                <IconButton size="small"><BoldIcon fontSize="small" /></IconButton>
                <IconButton size="small"><ItalicIcon fontSize="small" /></IconButton>
                <IconButton size="small"><UnderlineIcon fontSize="small" /></IconButton>
                <IconButton size="small"><LinkIcon fontSize="small" /></IconButton>
                <IconButton size="small"><ImageIcon fontSize="small" /></IconButton>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={campaignData.content.body}
                onChange={(e) => handleContentChange('body', e.target.value)}
                placeholder="Write your email content here..."
                helperText="You can use {customer_name} as a placeholder for personalization"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Call to Action</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Button Text"
                    value={campaignData.content.cta.text}
                    onChange={(e) => handleCtaChange('text', e.target.value)}
                    placeholder="e.g., Shop Now"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Button URL"
                    value={campaignData.content.cta.url}
                    onChange={(e) => handleCtaChange('url', e.target.value)}
                    placeholder="https://www.example.com/page"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>Email Recipients</Typography>
            <RadioGroup
              value="segment"
              name="recipient-type"
            >
              <FormControlLabel 
                value="segment" 
                control={<Radio />} 
                label="Customer Segment" 
              />
            </RadioGroup>
          </Box>
          
          <Box mb={3}>
            <Autocomplete
              value={emailSegments.find(s => s.id === campaignData.recipients.segmentId) || null}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleRecipientChange(newValue.id);
                }
              }}
              options={emailSegments}
              getOptionLabel={(option) => `${option.name} (${option.count} recipients)`}
              renderInput={(params) => (
                <TextField {...params} label="Select Customer Segment" fullWidth />
              )}
            />
            
            {campaignData.recipients.count > 0 && (
              <Typography variant="body2" color="textSecondary" mt={1}>
                This campaign will be sent to approximately {campaignData.recipients.count} recipients.
              </Typography>
            )}
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            For automated campaigns like Welcome emails or Abandoned Cart reminders, recipients are determined dynamically when the trigger event occurs.
          </Alert>
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>Campaign Settings</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  value={campaignData.automationType || 'regular'}
                  onChange={(e) => setCampaignData({ 
                    ...campaignData, 
                    automationType: e.target.value === 'regular' ? null : e.target.value 
                  })}
                  label="Campaign Type"
                >
                  <MenuItem value="regular">Regular Campaign</MenuItem>
                  <MenuItem value="welcome_series">Welcome Series</MenuItem>
                  <MenuItem value="abandoned_cart">Abandoned Cart</MenuItem>
                  <MenuItem value="post_purchase">Post-Purchase</MenuItem>
                  <MenuItem value="re_engagement">Re-engagement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {campaignData.automationType && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Trigger Event</InputLabel>
                  <Select
                    value={campaignData.triggeredOn || ''}
                    onChange={(e) => setCampaignData({ ...campaignData, triggeredOn: e.target.value })}
                    label="Trigger Event"
                  >
                    <MenuItem value="signup">Customer Sign Up</MenuItem>
                    <MenuItem value="cart_abandonment">Cart Abandonment</MenuItem>
                    <MenuItem value="purchase">Purchase Completed</MenuItem>
                    <MenuItem value="product_view">Product Viewed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {campaignData.automationType === 'abandoned_cart' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Delay After Trigger</InputLabel>
                  <Select
                    value={campaignData.triggerDelay || '1_hour'}
                    onChange={(e) => setCampaignData({ ...campaignData, triggerDelay: e.target.value })}
                    label="Delay After Trigger"
                  >
                    <MenuItem value="1_hour">1 Hour</MenuItem>
                    <MenuItem value="3_hours">3 Hours</MenuItem>
                    <MenuItem value="12_hours">12 Hours</MenuItem>
                    <MenuItem value="24_hours">24 Hours</MenuItem>
                    <MenuItem value="48_hours">48 Hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Advanced settings like sender information, tracking options, and delivery optimizations are configured at the account level.
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Template Selection Dialog */}
      <Dialog 
        open={showTemplateDialog} 
        onClose={() => setShowTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Email Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {emailTemplates.map(template => (
              <Grid item key={template.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    border: campaignData.content.template === template.id ? 
                      '2px solid #1976d2' : 'none'
                  }}
                >
                  <CardActionArea onClick={() => handleTemplateSelect(template.id)}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={template.thumbnail || `https://via.placeholder.com/400x200?text=${template.name}`}
                      alt={template.name}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {template.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Schedule Dialog */}
      <Dialog 
        open={showScheduleDialog} 
        onClose={() => setShowScheduleDialog(false)}
      >
        <DialogTitle>Schedule Campaign</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph sx={{ mt: 1 }}>
            Select when you want this campaign to be sent:
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Schedule Date and Time"
              value={scheduledDate}
              onChange={(newValue) => setScheduledDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              minDateTime={new Date()}
            />
          </LocalizationProvider>
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Campaign will be automatically sent on {format(scheduledDate, "MMMM d, yyyy 'at' h:mm a")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmSchedule} 
            variant="contained" 
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Schedule Campaign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailCampaignEditor;
