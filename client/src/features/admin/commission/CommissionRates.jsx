import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Alert,
  Box,
  TextField,
  CircularProgress
} from '@mui/material';
import { commissionApi } from '../../../data/commissionApi';

const CommissionRates = ({ commissionData, loading, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedRates, setUpdatedRates] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize updated rates with current data when commissionData changes
  React.useEffect(() => {
    if (commissionData && commissionData.categoryRates) {
      const initialRates = {};
      commissionData.categoryRates.forEach(category => {
        initialRates[category.id] = category.rate;
      });
      setUpdatedRates(initialRates);
    }
  }, [commissionData]);

  const handleRateChange = (categoryId, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setUpdatedRates({
        ...updatedRates,
        [categoryId]: numValue
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Prepare data for API
      const updatedCategoryRates = Object.entries(updatedRates).map(([id, rate]) => ({
        id,
        rate
      }));
      
      // Simulate API call for now
      // await commissionApi.updateCategoryRates(updatedCategoryRates);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUpdate) {
        onUpdate({
          ...commissionData,
          categoryRates: commissionData.categoryRates.map(category => ({
            ...category,
            rate: updatedRates[category.id] || category.rate
          }))
        });
      }
      
      setSuccess(true);
      setEditMode(false);
      
    } catch (err) {
      setError('Failed to update commission rates. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original rates
    if (commissionData && commissionData.categoryRates) {
      const originalRates = {};
      commissionData.categoryRates.forEach(category => {
        originalRates[category.id] = category.rate;
      });
      setUpdatedRates(originalRates);
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

  if (!commissionData || !commissionData.categoryRates) {
    return <Alert severity="info">No commission data available</Alert>;
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
        <Typography variant="h6">Commission Rates by Category</Typography>
        {!editMode ? (
          <Button variant="contained" onClick={() => setEditMode(true)}>
            Edit Rates
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
        {success && <Alert severity="success" sx={{ mb: 3 }}>Commission rates updated successfully!</Alert>}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Commission Rate (%)</TableCell>
                {editMode && <TableCell>New Rate (%)</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {commissionData.categoryRates.map(category => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.rate}%</TableCell>
                  {editMode && (
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        inputProps={{ min: 0, max: 100, step: 0.1 }}
                        value={updatedRates[category.id] || ''}
                        onChange={(e) => handleRateChange(category.id, e.target.value)}
                        variant="outlined"
                        sx={{ width: '120px' }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default CommissionRates;
