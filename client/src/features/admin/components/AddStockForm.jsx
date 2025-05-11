import React, { useState } from 'react';
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Grid, Autocomplete, Alert, InputAdornment, FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  CalendarToday as CalendarIcon,
  Store as StoreIcon
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

// Mock suppliers
const mockSuppliers = [
  { id: 'SUP-001', name: 'Kenya Cosmetics Ltd.' },
  { id: 'SUP-002', name: 'Nairobi Fragrances' },
  { id: 'SUP-003', name: 'Skin Protectors Ltd' },
  { id: 'SUP-004', name: 'Hair Care Kenya' },
];

const AddStockForm = ({ open, onClose, onSave }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState(null);
  const [date, setDate] = useState(new Date());
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    if (!selectedProduct) newErrors.product = 'Product is required';
    if (!quantity) newErrors.quantity = 'Quantity is required';
    else if (!/^[0-9]\d*$/.test(quantity) || parseInt(quantity) === 0) {
      newErrors.quantity = 'Please enter a valid positive number';
    }
    if (!supplier) newErrors.supplier = 'Supplier is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validate()) return;
    
    // Create stock movement record
    const newStockMovement = {
      id: `SM-${Date.now().toString().slice(-6)}`,
      date: format(date, 'yyyy-MM-dd'),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: STOCK_MOVEMENT_TYPES.PURCHASE,
      quantity: parseInt(quantity),
      supplier: supplier.name,
      invoiceNumber,
      notes,
      user: 'Current User'
    };
    
    // Call parent save handler
    onSave(newStockMovement);
    
    // Show success message
    toast.success(`Added ${quantity} units of ${selectedProduct.name} to inventory`);
    
    // Reset form
    resetForm();
  };
  
  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity('');
    setSupplier(null);
    setDate(new Date());
    setInvoiceNumber('');
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
          <AddIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Add Stock</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Use this form to record new inventory received from suppliers and add it to your stock.
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
              helperText={errors.quantity || 'Number of units being added to inventory'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AddIcon />
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
            <Autocomplete
              id="supplier-select"
              options={mockSuppliers}
              getOptionLabel={(option) => option.name}
              value={supplier}
              onChange={(event, newValue) => {
                setSupplier(newValue);
                if (errors.supplier) setErrors({...errors, supplier: ''});
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Supplier *" 
                  fullWidth 
                  error={!!errors.supplier}
                  helperText={errors.supplier}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Receive Date"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              id="invoice-number"
              label="Invoice Number"
              fullWidth
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Optional"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              id="notes"
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional: Enter any additional details about this stock receipt"
            />
          </Grid>
          
          {selectedProduct && (
            <Grid item xs={12}>
              <Alert severity="success">
                <Typography variant="body2">
                  This will add {quantity || '0'} units of {selectedProduct.name} to inventory
                  {quantity && ` (${selectedProduct.currentStock} → ${selectedProduct.currentStock + parseInt(quantity)} units)`}
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
          disabled={!selectedProduct || !quantity || !supplier}
        >
          Add to Inventory
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStockForm;
