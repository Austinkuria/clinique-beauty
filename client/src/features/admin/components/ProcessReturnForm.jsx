import React, { useState } from 'react';
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Grid, Autocomplete, Alert, InputAdornment, Divider, FormHelperText,
  FormControlLabel, Checkbox, RadioGroup, Radio, FormLabel
} from '@mui/material';
import {
  AssignmentReturn as ReturnIcon,
  Check as CheckIcon,
  CalendarToday as CalendarIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { STOCK_MOVEMENT_TYPES } from '../../../data/mockInventoryData';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

// Mock products for the form
const mockProducts = [
  { id: 1, name: 'Moisturizing Cream', sku: 'SKN-001', currentStock: 45 },
  { id: 2, name: 'Anti-Aging Serum', sku: 'SKN-002', currentStock: 32 },
  { id: 3, name: 'Citrus Perfume', sku: 'FRG-001', currentStock: 12 },
  { id: 4, name: 'Hair Repair Mask', sku: 'HAR-001', currentStock: 8 },
  { id: 5, name: 'Shower Gel', sku: 'BDY-001', currentStock: 36 },
  { id: 6, name: 'Day Cream SPF 30', sku: 'SKN-003', currentStock: 22 },
];

// Return reasons
const returnReasons = [
  'Defective product',
  'Damaged packaging',
  'Wrong product shipped',
  'Customer changed mind',
  'Allergic reaction',
  'Product not as described',
  'Other (please specify)'
];

const ProcessReturnForm = ({ open, onClose, onSave }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [date, setDate] = useState(new Date());
  const [returnCondition, setReturnCondition] = useState('unopened');
  const [restockable, setRestockable] = useState(true);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    if (!selectedProduct) newErrors.product = 'Product is required';
    if (!quantity) newErrors.quantity = 'Quantity is required';
    else if (!/^[0-9]\d*$/.test(quantity) || parseInt(quantity) === 0) {
      newErrors.quantity = 'Please enter a valid positive number';
    }
    if (!reason) newErrors.reason = 'Return reason is required';
    if (reason === 'Other (please specify)' && !customReason) {
      newErrors.customReason = 'Please specify the return reason';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validate()) return;
    
    // If not restockable, create damaged/disposed record instead of return
    const movementType = restockable ? STOCK_MOVEMENT_TYPES.RETURN : STOCK_MOVEMENT_TYPES.DAMAGED;
    
    // Create stock movement record
    const newStockMovement = {
      id: `RTN-${Date.now().toString().slice(-6)}`,
      date: format(date, 'yyyy-MM-dd'),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: movementType,
      quantity: restockable ? parseInt(quantity) : -parseInt(quantity), // negative if not restockable
      orderNumber,
      reason: reason === 'Other (please specify)' ? customReason : reason,
      returnCondition,
      restockable,
      notes,
      user: 'Current User'
    };
    
    // Call parent save handler
    onSave(newStockMovement);
    
    // Show success message
    toast.success(`Processed return of ${quantity} ${selectedProduct.name} units`);
    
    // Reset form
    resetForm();
  };
  
  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity('');
    setOrderNumber('');
    setReason('');
    setCustomReason('');
    setDate(new Date());
    setReturnCondition('unopened');
    setRestockable(true);
    setNotes('');
    setErrors({});
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Handle quantity change with validation
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    
    // Reset error when typing
    if (errors.quantity) {
      setErrors({...errors, quantity: ''});
    }
    
    // Allow only positive numbers
    if (value === '' || /^[0-9]\d*$/.test(value)) {
      setQuantity(value);
    }
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <ReturnIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Process Return</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Use this form to process customer returns and determine if the returned items can be added back to inventory.
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Autocomplete
              id="product-select"
              options={mockProducts}
              getOptionLabel={(option) => `${option.name} (SKU: ${option.sku})`}
              value={selectedProduct}
              onChange={(event, newValue) => {
                setSelectedProduct(newValue);
                if (errors.product) setErrors({...errors, product: ''});
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select Product *" 
                  fullWidth 
                  error={!!errors.product}
                  helperText={errors.product}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              id="quantity"
              label="Quantity *"
              type="text"
              fullWidth
              value={quantity}
              onChange={handleQuantityChange}
              error={!!errors.quantity}
              helperText={errors.quantity || 'Number of units being returned'}
              InputProps={{
                inputProps: { 
                  inputMode: 'numeric', 
                  pattern: '[0-9]*',
                  min: 1
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              id="order-number"
              label="Order Number"
              fullWidth
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Optional"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Return Date"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.reason}>
              <InputLabel id="reason-label">Return Reason *</InputLabel>
              <Select
                labelId="reason-label"
                id="reason"
                value={reason}
                label="Return Reason *"
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) setErrors({...errors, reason: ''});
                }}
              >
                {returnReasons.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
              {errors.reason && <FormHelperText>{errors.reason}</FormHelperText>}
            </FormControl>
          </Grid>
          
          {reason === 'Other (please specify)' && (
            <Grid item xs={12} md={6}>
              <TextField
                id="custom-reason"
                label="Specify Reason *"
                fullWidth
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  if (errors.customReason) setErrors({...errors, customReason: ''});
                }}
                error={!!errors.customReason}
                helperText={errors.customReason}
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Return Details
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Product Condition</FormLabel>
              <RadioGroup
                aria-label="product-condition"
                name="product-condition"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
              >
                <FormControlLabel value="unopened" control={<Radio />} label="Unopened / Like New" />
                <FormControlLabel value="opened" control={<Radio />} label="Opened / Good Condition" />
                <FormControlLabel value="damaged" control={<Radio />} label="Damaged / Not Reusable" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Inventory Action</FormLabel>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restockable}
                    onChange={(e) => setRestockable(e.target.checked)}
                    disabled={returnCondition === 'damaged'}
                  />
                }
                label="Return to inventory (restockable)"
              />
              {!restockable && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Item will be recorded as damaged/disposed and will NOT be added back to inventory
                </Alert>
              )}
              {returnCondition === 'damaged' && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Damaged items cannot be returned to inventory
                </Alert>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              id="notes"
              label="Additional Notes"
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional details about this return"
            />
          </Grid>
          
          {selectedProduct && (
            <Grid item xs={12}>
              <Alert severity={restockable ? "success" : "warning"}>
                <Typography variant="body2">
                  {restockable 
                    ? `This will add ${quantity || '0'} units of ${selectedProduct.name} back to inventory` +
                      (quantity ? ` (${selectedProduct.currentStock} → ${selectedProduct.currentStock + parseInt(quantity)} units)` : '')
                    : `This will record ${quantity || '0'} units of ${selectedProduct.name} as damaged/disposed (no inventory change)`
                  }
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
          color={restockable ? "primary" : "warning"}
          onClick={handleSubmit}
          startIcon={<CheckIcon />}
          disabled={!selectedProduct || !quantity || !reason || (reason === 'Other (please specify)' && !customReason)}
        >
          {restockable ? 'Process & Restock' : 'Process as Damaged'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessReturnForm;
