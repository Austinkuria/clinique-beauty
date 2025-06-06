import React, { useState } from 'react';
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Grid, Autocomplete, Alert, Collapse, InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon,
  Check as CheckIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { STOCK_MOVEMENT_TYPES, products, adjustmentHistory } from '../../../data/mockInventoryData';

// Transform products data for the adjustment tool
const formattedProducts = products.map(product => ({
  id: product.id,
  name: product.name,
  sku: `SKU-${product.id.toString().padStart(3, '0')}`,
  currentStock: product.stockLevel
}));

const reasonOptions = [
  'Inventory count adjustment',
  'Damaged goods',
  'Lost goods',
  'Theft',
  'Product expiration',
  'Sample/Tester use',
  'Customer return (restocked)',
  'Found additional stock',
  'System error correction',
  'Other (please specify)'
];

const StockAdjustmentTool = ({ open, onClose, onSave }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState(STOCK_MOVEMENT_TYPES.ADJUSTMENT);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState(adjustmentHistory);
  const [quantityError, setQuantityError] = useState('');
  
  // Handle quantity change with validation
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    
    // Validate: only allow positive integers
    if (value === '' || /^[0-9]\d*$/.test(value)) {
      setQuantity(value);
      setQuantityError('');
    } else {
      setQuantityError('Please enter a valid positive number');
    }
  };
  
  const handleSubmit = () => {
    if (!selectedProduct || !quantity || !reason) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Validation: Quantity cannot be zero
    if (parseInt(quantity) === 0) {
      setQuantityError('Quantity cannot be zero');
      return;
    }
    
    // Validation: Current stock can't go below zero
    const effectiveQuantity = adjustmentType === STOCK_MOVEMENT_TYPES.DAMAGED || 
                            adjustmentType === STOCK_MOVEMENT_TYPES.ADJUSTMENT ? 
                            -Math.abs(parseInt(quantity)) : Math.abs(parseInt(quantity));
                            
    if (selectedProduct.currentStock + effectiveQuantity < 0) {
      setQuantityError(`Adjustment would result in negative stock (${selectedProduct.currentStock + effectiveQuantity})`);
      return;
    }
    
    // Create new adjustment record
    const newAdjustment = {
      id: `ADJ-${Date.now().toString().substr(-6)}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: adjustmentType,
      quantity: effectiveQuantity,
      reason: reason === 'Other (please specify)' ? customReason : reason,
      user: 'Current User',
      notes: notes
    };
    
    // Update mock history (in a real app, would save to database)
    setHistoryData([newAdjustment, ...historyData]);
    
    // Show success message
    toast.success(`Stock adjustment recorded for ${selectedProduct.name}`);
    
    // Reset form
    resetForm();
    
    // Call parent callback if provided
    if (onSave) {
      onSave(newAdjustment);
    }
  };
  
  const resetForm = () => {
    setSelectedProduct(null);
    setAdjustmentType(STOCK_MOVEMENT_TYPES.ADJUSTMENT);
    setQuantity('');
    setReason('');
    setNotes('');
    setCustomReason('');
    setQuantityError('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  
  // Helper function to format adjustment quantity for display
  const formatQuantity = (adjustmentType, quantity) => {
    if (quantity > 0) return `+${quantity}`;
    return quantity;
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Stock Adjustment</Typography>
          <Button 
            startIcon={<HistoryIcon />} 
            onClick={toggleHistory} 
            color="primary"
          >
            {showHistory ? 'Hide History' : 'Show Adjustment History'}
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Adjustment History */}
        <Collapse in={showHistory}>
          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>Adjustment History (Audit Log)</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Date/Time</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.id}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.productName}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell align="right" sx={{
                        color: record.quantity > 0 ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}>
                        {formatQuantity(record.type, record.quantity)}
                      </TableCell>
                      <TableCell>{record.reason}</TableCell>
                      <TableCell>{record.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Collapse>
        
        {/* Adjustment Form */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Use this form to adjust inventory quantities due to damages, counts, returns, or other non-sale inventory changes.
              All adjustments are logged for audit purposes.
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Autocomplete
              id="product-select"
              options={formattedProducts}
              getOptionLabel={(option) => `${option.name} (SKU: ${option.sku})`}
              value={selectedProduct}
              onChange={(event, newValue) => {
                setSelectedProduct(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Product *" fullWidth />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="adjustment-type-label">Adjustment Type *</InputLabel>
              <Select
                labelId="adjustment-type-label"
                id="adjustment-type"
                value={adjustmentType}
                label="Adjustment Type *"
                onChange={(e) => setAdjustmentType(e.target.value)}
              >
                <MenuItem value={STOCK_MOVEMENT_TYPES.ADJUSTMENT}>Inventory Adjustment</MenuItem>
                <MenuItem value={STOCK_MOVEMENT_TYPES.DAMAGED}>Damaged Goods</MenuItem>
                <MenuItem value={STOCK_MOVEMENT_TYPES.RETURN}>Customer Return</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              id="quantity"
              label="Quantity *"
              type="text"
              fullWidth
              value={quantity}
              onChange={handleQuantityChange}
              error={!!quantityError}
              helperText={quantityError || (selectedProduct ? 
                `Current stock: ${selectedProduct.currentStock} units` : 
                "Select a product to see current stock")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {adjustmentType === STOCK_MOVEMENT_TYPES.RETURN ? <AddIcon /> : <RemoveIcon />}
                  </InputAdornment>
                ),
                inputProps: { 
                  inputMode: 'numeric', 
                  pattern: '[0-9]*',
                  min: 1
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="reason-label">Reason *</InputLabel>
              <Select
                labelId="reason-label"
                id="reason"
                value={reason}
                label="Reason *"
                onChange={(e) => setReason(e.target.value)}
              >
                {reasonOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {reason === 'Other (please specify)' && (
            <Grid item xs={12}>
              <TextField
                id="custom-reason"
                label="Specify Reason *"
                fullWidth
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <TextField
              id="notes"
              label="Additional Notes"
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details about this adjustment"
            />
          </Grid>
          
          {selectedProduct && (
            <Grid item xs={12}>
              <Alert severity={adjustmentType === STOCK_MOVEMENT_TYPES.RETURN ? "success" : "warning"}>
                <Typography variant="body2">
                  This will {adjustmentType === STOCK_MOVEMENT_TYPES.RETURN ? 'add' : 'remove'} {quantity || '0'} units 
                  {quantity && 
                    ` (${selectedProduct.currentStock} → ${selectedProduct.currentStock + 
                      (adjustmentType === STOCK_MOVEMENT_TYPES.RETURN ? 
                        parseInt(quantity || 0) : 
                        -parseInt(quantity || 0))
                    } units)`
                  } from inventory.
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          startIcon={<CheckIcon />}
          disabled={!selectedProduct || !quantity || !reason || !!quantityError}
        >
          Submit Adjustment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockAdjustmentTool;
