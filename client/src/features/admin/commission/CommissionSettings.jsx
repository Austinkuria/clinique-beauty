import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CommissionSettings = ({ commissionData, loading, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [settingsForm, setSettingsForm] = useState({
    defaultCommissionRate: 0,
    minimumPayoutAmount: 0,
    payoutSchedule: 'monthly',
    tierBased: false,
    tiers: []
  });
  
  // Initialize form with data when it changes
  React.useEffect(() => {
    if (commissionData && commissionData.settings) {
      setSettingsForm({
        defaultCommissionRate: commissionData.settings.defaultCommissionRate || 0,
        minimumPayoutAmount: commissionData.settings.minimumPayoutAmount || 0,
        payoutSchedule: commissionData.settings.payoutSchedule || 'monthly',
        tierBased: commissionData.settings.tierBased || false,
        tiers: commissionData.settings.tiers || []
      });
    }
  }, [commissionData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsForm({
      ...settingsForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...settingsForm.tiers];
    updatedTiers[index] = {
      ...updatedTiers[index],
      [field]: value
    };
    setSettingsForm({
      ...settingsForm,
      tiers: updatedTiers
    });
  };
  
  const addTier = () => {
    setSettingsForm({
      ...settingsForm,
      tiers: [
        ...settingsForm.tiers,
        { name: `Tier ${settingsForm.tiers.length + 1}`, minSales: 0, rate: 0 }
      ]
    });
  };
  
  const removeTier = (index) => {
    const updatedTiers = [...settingsForm.tiers];
    updatedTiers.splice(index, 1);
    setSettingsForm({
      ...settingsForm,
      tiers: updatedTiers
    });
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUpdate) {
        onUpdate({
          ...commissionData,
          settings: settingsForm
        });
      }
      
      setSuccess(true);
      setEditMode(false);
      
    } catch (err) {
      setError('Failed to update commission settings. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Reset to original settings
    if (commissionData && commissionData.settings) {
      setSettingsForm({
        defaultCommissionRate: commissionData.settings.defaultCommissionRate || 0,
        minimumPayoutAmount: commissionData.settings.minimumPayoutAmount || 0,
        payoutSchedule: commissionData.settings.payoutSchedule || 'monthly',
        tierBased: commissionData.settings.tierBased || false,
        tiers: commissionData.settings.tiers || []
      });
    }
    setEditMode(false);
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 0 }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #eee'
      }}>
        <Typography variant="h6">Commission Settings</Typography>
        {!editMode ? (
          <Button variant="contained" onClick={() => setEditMode(true)}>
            Edit Settings
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleSave} 
              disabled={saving}
              startIcon={saving && <CircularProgress size={20} color="inherit" />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>Commission settings updated successfully!</Alert>}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default Commission Rate (%)"
              type="number"
              name="defaultCommissionRate"
              value={settingsForm.defaultCommissionRate}
              onChange={handleInputChange}
              disabled={!editMode}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="Applied when no specific category rate is set"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum Payout Amount ($)"
              type="number"
              name="minimumPayoutAmount"
              value={settingsForm.minimumPayoutAmount}
              onChange={handleInputChange}
              disabled={!editMode}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Minimum amount required for payout processing"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Payout Schedule</InputLabel>
              <Select
                name="payoutSchedule"
                value={settingsForm.payoutSchedule}
                onChange={handleInputChange}
                disabled={!editMode}
                label="Payout Schedule"
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="tierBased"
                  checked={settingsForm.tierBased}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
              }
              label="Enable Tier-Based Commission Structure"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Commission rates will be based on seller performance tiers
            </Typography>
          </Grid>
          
          {settingsForm.tierBased && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Performance Tiers</Typography>
                {editMode && (
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />} 
                    onClick={addTier}
                    size="small"
                  >
                    Add Tier
                  </Button>
                )}
              </Box>
              
              {settingsForm.tiers.length === 0 ? (
                <Alert severity="info">
                  No tiers defined. {editMode && 'Click "Add Tier" to create performance tiers.'}
                </Alert>
              ) : (
                settingsForm.tiers.map((tier, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1">Tier {index + 1}</Typography>
                        {editMode && (
                          <IconButton 
                            color="error" 
                            onClick={() => removeTier(index)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Tier Name"
                            value={tier.name}
                            onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                            disabled={!editMode}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Minimum Sales ($)"
                            type="number"
                            value={tier.minSales}
                            onChange={(e) => handleTierChange(index, 'minSales', Number(e.target.value))}
                            disabled={!editMode}
                            inputProps={{ min: 0 }}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Commission Rate (%)"
                            type="number"
                            value={tier.rate}
                            onChange={(e) => handleTierChange(index, 'rate', Number(e.target.value))}
                            disabled={!editMode}
                            inputProps={{ min: 0, max: 100, step: 0.1 }}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
};

export default CommissionSettings;
