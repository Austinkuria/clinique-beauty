import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useUser } from '@clerk/clerk-react';
import { useSellerApi } from '../../../data/sellerApi';

const SellerSettings = () => {
  const { user } = useUser();
  const { getSellers, updateSeller } = useSellerApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [sellerData, setSellerData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    location: '',
    description: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailMessages: true,
    emailMarketing: false,
    pushOrders: true,
    pushMessages: true
  });

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const sellers = await getSellers();
        const currentSeller = sellers.find(seller => 
          seller.clerk_id === user?.id || 
          seller.email === user?.primaryEmailAddress?.emailAddress
        );

        if (currentSeller) {
          setSellerData({
            businessName: currentSeller.business_name || currentSeller.businessName || '',
            contactName: currentSeller.contact_name || currentSeller.contactName || '',
            email: currentSeller.email || '',
            phone: currentSeller.phone || '',
            location: currentSeller.location || '',
            description: currentSeller.description || '',
            website: currentSeller.website || '',
            socialMedia: {
              facebook: currentSeller.facebook || '',
              instagram: currentSeller.instagram || '',
              twitter: currentSeller.twitter || ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load seller information',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSellerData();
    }
  }, [user, getSellers]);

  const handleInputChange = (field, value) => {
    setSellerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setSellerData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleNotificationChange = (setting, value) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Find current seller ID
      const sellers = await getSellers();
      const currentSeller = sellers.find(seller => 
        seller.clerk_id === user?.id || 
        seller.email === user?.primaryEmailAddress?.emailAddress
      );

      if (currentSeller) {
        await updateSeller(currentSeller.id, {
          business_name: sellerData.businessName,
          contact_name: sellerData.contactName,
          email: sellerData.email,
          phone: sellerData.phone,
          location: sellerData.location,
          description: sellerData.description,
          website: sellerData.website,
          facebook: sellerData.socialMedia.facebook,
          instagram: sellerData.socialMedia.instagram,
          twitter: sellerData.socialMedia.twitter
        });

        setSnackbar({
          open: true,
          message: 'Settings saved successfully',
          severity: 'success'
        });
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset form data to original values
    // You might want to refetch the data here
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Seller Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Business Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              avatar={<BusinessIcon />}
              title="Business Information"
              action={
                !editMode ? (
                  <IconButton onClick={() => setEditMode(true)}>
                    <EditIcon />
                  </IconButton>
                ) : (
                  <Box>
                    <IconButton onClick={handleSave} disabled={saving}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={handleCancel}>
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    value={sellerData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    value={sellerData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={sellerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={sellerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={sellerData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Business Description"
                    value={sellerData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={sellerData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardHeader
              title="Social Media"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    value={sellerData.socialMedia.facebook}
                    onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    value={sellerData.socialMedia.instagram}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    value={sellerData.socialMedia.twitter}
                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={<NotificationsIcon />}
              title="Notification Preferences"
            />
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Email Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailOrders}
                    onChange={(e) => handleNotificationChange('emailOrders', e.target.checked)}
                  />
                }
                label="New Orders"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailMessages}
                    onChange={(e) => handleNotificationChange('emailMessages', e.target.checked)}
                  />
                }
                label="Customer Messages"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailMarketing}
                    onChange={(e) => handleNotificationChange('emailMarketing', e.target.checked)}
                  />
                }
                label="Marketing Updates"
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Push Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.pushOrders}
                    onChange={(e) => handleNotificationChange('pushOrders', e.target.checked)}
                  />
                }
                label="New Orders"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.pushMessages}
                    onChange={(e) => handleNotificationChange('pushMessages', e.target.checked)}
                  />
                }
                label="Customer Messages"
              />
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardHeader
              avatar={<SecurityIcon />}
              title="Account Security"
            />
            <CardContent>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => {
                  // Handle password change
                  setSnackbar({
                    open: true,
                    message: 'Password change functionality coming soon',
                    severity: 'info'
                  });
                }}
              >
                Change Password
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  // Handle 2FA setup
                  setSnackbar({
                    open: true,
                    message: 'Two-factor authentication coming soon',
                    severity: 'info'
                  });
                }}
              >
                Setup Two-Factor Auth
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SellerSettings;
