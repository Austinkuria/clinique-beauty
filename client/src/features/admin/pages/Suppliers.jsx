import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, IconButton, 
  Card, CardHeader, CardContent, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, Fab, Tooltip, Divider, FormControl, 
  FormControlLabel, Checkbox, InputLabel, Select, MenuItem, Tab, Tabs,
  Alert, Snackbar, TablePagination
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as ShippingIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Star as StarIcon,
  StarOutline as StarOutlineIcon,
  FilterList as FilterIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { suppliers } from '../../../data/mockInventoryData';
import { format } from 'date-fns';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`supplier-tabpanel-${index}`}
      aria-labelledby={`supplier-tab-${index}`}
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

// Generate purchase history for suppliers
const generatePurchaseHistory = (supplierId) => {
  const history = [];
  const today = new Date();
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Last 6 months
    
    history.push({
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      date: format(date, 'yyyy-MM-dd'),
      items: Math.floor(Math.random() * 8) + 1,
      total: Math.floor(5000 + Math.random() * 50000),
      status: ['delivered', 'pending', 'shipped', 'processing'][Math.floor(Math.random() * 4)]
    });
  }
  
  // Sort by date (most recent first)
  return history.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Mock products with categories
const mockProducts = [
  { id: 1, name: 'Moisturizing Cream', category: 'Skincare' },
  { id: 2, name: 'Anti-Aging Serum', category: 'Skincare' },
  { id: 3, name: 'Citrus Perfume', category: 'Fragrance' },
  { id: 4, name: 'Hair Repair Mask', category: 'Hair Care' },
  { id: 5, name: 'Shower Gel', category: 'Body Care' },
  { id: 6, name: 'Day Cream SPF 30', category: 'Skincare' },
  { id: 7, name: 'Body Butter', category: 'Body Care' },
  { id: 8, name: 'Face Mask', category: 'Skincare' },
  { id: 9, name: 'Night Repair Serum', category: 'Skincare' },
  { id: 10, name: 'Lip Balm', category: 'Skincare' }
];

const Suppliers = () => {
  const [suppliersList, setSuppliersList] = useState(suppliers);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [dialogTab, setDialogTab] = useState(0);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [reorderSupplier, setReorderSupplier] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState(suppliersList);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Apply search filter whenever suppliers list or search query changes
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredSuppliers(suppliersList.filter(supplier => 
        supplier.name.toLowerCase().includes(query) ||
        supplier.contact.toLowerCase().includes(query) ||
        supplier.email.toLowerCase().includes(query)
      ));
    } else {
      setFilteredSuppliers(suppliersList);
    }
  }, [suppliersList, searchQuery]);
  
  const handleOpenDialog = (supplier = null, tab = 0) => {
    setCurrentSupplier(supplier);
    setEditMode(!!supplier);
    setDialogTab(tab);
    
    // Load purchase history if viewing a supplier
    if (supplier) {
      setPurchaseHistory(generatePurchaseHistory(supplier.id));
    } else {
      // Initialize with empty supplier if adding new
      setCurrentSupplier({
        id: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        products: [],
        notes: '',
        leadTime: 7, // Default lead time in days
        preferred: false
      });
    }
    
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSupplier(null);
    setEditMode(false);
    setDialogTab(0);
  };
  
  const handleSaveSupplier = () => {
    if (!currentSupplier.name || !currentSupplier.email) {
      toast.error('Name and email are required fields');
      return;
    }
    
    if (editMode) {
      // Update existing supplier
      setSuppliersList(prevList => 
        prevList.map(supplier => 
          supplier.id === currentSupplier.id ? currentSupplier : supplier
        )
      );
      toast.success(`Supplier ${currentSupplier.name} has been updated`);
    } else {
      // Add new supplier
      setSuppliersList(prevList => [...prevList, currentSupplier]);
      toast.success(`Supplier ${currentSupplier.name} has been added`);
    }
    
    handleCloseDialog();
  };
  
  const handleDeleteSupplier = (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliersList(prevList => prevList.filter(supplier => supplier.id !== supplierId));
      toast.success('Supplier has been deleted');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentSupplier(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleProductSelect = (productId) => {
    setCurrentSupplier(prev => {
      const products = prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId];
      
      return { ...prev, products };
    });
  };
  
  const togglePreferredStatus = (supplierId) => {
    setSuppliersList(prevList => 
      prevList.map(supplier => 
        supplier.id === supplierId 
          ? { ...supplier, preferred: !supplier.preferred }
          : supplier
      )
    );
  };
  
  // Reorder workflow
  const openReorderDialog = (supplier) => {
    setReorderSupplier(supplier);
    setSelectedProducts([]);
    setReorderDialogOpen(true);
  };
  
  const closeReorderDialog = () => {
    setReorderDialogOpen(false);
    setReorderSupplier(null);
  };
  
  const handleProductSelectionForOrder = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const submitOrder = () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product to order');
      return;
    }
    
    const orderNumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    
    toast.success(`Purchase Order ${orderNumber} created for ${reorderSupplier.name}`);
    closeReorderDialog();
    
    // In a real app, you would submit this order to your backend
    console.log('Order created:', {
      orderNumber,
      supplier: reorderSupplier,
      products: selectedProducts.map(id => mockProducts.find(p => p.id === id)),
      date: new Date().toISOString(),
      status: 'pending'
    });
  };
  
  // Get product names based on IDs
  const getProductNames = (productIds) => {
    return productIds
      .map(id => mockProducts.find(p => p.id === id)?.name)
      .filter(name => name) // Remove undefined
      .join(', ');
  };
  
  // Get status color for purchase history
  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Supplier Management
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<HistoryIcon />} 
            sx={{ mr: 1 }}
            onClick={() => {/* Open purchase history */}}
          >
            Order History
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()}
          >
            Add Supplier
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Suppliers"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, contact or email"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />} 
              fullWidth
            >
              Filter
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControlLabel
              control={
                <Checkbox 
                  size="small"
                  // onChange handler would filter for preferred suppliers
                />
              }
              label="Preferred Only"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="textSecondary" align="right">
              {filteredSuppliers.length} suppliers found
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Products</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {supplier.preferred && (
                      <Tooltip title="Preferred Supplier">
                        <StarIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                      </Tooltip>
                    )}
                    {supplier.name}
                  </Box>
                </TableCell>
                <TableCell>{supplier.contact}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>
                  {getProductNames(supplier.products || []).substring(0, 30)}
                  {(supplier.products || []).length > 0 && getProductNames(supplier.products).length > 30 && '...'}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label="Active" 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box>
                    <Tooltip title="Create Order">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => openReorderDialog(supplier)}
                      >
                        <ShoppingCartIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View/Edit Details">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(supplier)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Order History">
                      <IconButton 
                        size="small" 
                        color="secondary"
                        onClick={() => handleOpenDialog(supplier, 1)}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={supplier.preferred ? "Remove Preferred Status" : "Mark as Preferred"}>
                      <IconButton 
                        size="small" 
                        color={supplier.preferred ? "warning" : "default"}
                        onClick={() => togglePreferredStatus(supplier.id)}
                      >
                        {supplier.preferred ? 
                          <StarIcon fontSize="small" /> : 
                          <StarOutlineIcon fontSize="small" />
                        }
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredSuppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    No suppliers found. {searchQuery && 'Try adjusting your search.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Supplier Details/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? `Edit Supplier: ${currentSupplier?.name}` : 'Add New Supplier'}
        </DialogTitle>
        <DialogContent dividers>
          {currentSupplier && (
            <>
              <Tabs 
                value={dialogTab} 
                onChange={(e, newValue) => setDialogTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Details" />
                {editMode && <Tab label="Purchase History" />}
                {editMode && <Tab label="Products" />}
              </Tabs>
              
              <TabPanel value={dialogTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Supplier Name"
                      name="name"
                      value={currentSupplier.name}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Person"
                      name="contact"
                      value={currentSupplier.contact}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Email"
                      name="email"
                      type="email"
                      value={currentSupplier.email}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={currentSupplier.phone}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      multiline
                      rows={2}
                      value={currentSupplier.address}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Lead Time (days)"
                      name="leadTime"
                      type="number"
                      InputProps={{ inputProps: { min: 1 } }}
                      value={currentSupplier.leadTime || 7}
                      onChange={handleInputChange}
                      helperText="Average time to receive orders"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={currentSupplier.preferred || false}
                          name="preferred"
                          onChange={handleInputChange}
                        />
                      }
                      label="Mark as Preferred Supplier"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      multiline
                      rows={3}
                      value={currentSupplier.notes || ''}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </TabPanel>
              
              <TabPanel value={dialogTab} index={1}>
                {editMode ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Order #</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Items</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {purchaseHistory.map((order) => (
                          <TableRow key={order.id} hover>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>{order.items}</TableCell>
                            <TableCell align="right">KES {order.total.toLocaleString()}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={order.status} 
                                size="small" 
                                color={getStatusColor(order.status)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1">
                    Purchase history will be available after creating the supplier.
                  </Typography>
                )}
              </TabPanel>
              
              <TabPanel value={dialogTab} index={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Products Supplied by {currentSupplier.name}
                </Typography>
                
                <Grid container spacing={1}>
                  {mockProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={(currentSupplier.products || []).includes(product.id)}
                            onChange={() => handleProductSelect(product.id)}
                          />
                        }
                        label={`${product.name} (${product.category})`}
                      />
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialogTab === 0 && (
            <Button 
              onClick={handleSaveSupplier} 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
            >
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Reorder Dialog */}
      <Dialog
        open={reorderDialogOpen}
        onClose={closeReorderDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create Purchase Order - {reorderSupplier?.name}
        </DialogTitle>
        <DialogContent dividers>
          {reorderSupplier && (
            <>
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Supplier Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Contact:</strong> {reorderSupplier.contact}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {reorderSupplier.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {reorderSupplier.phone}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Lead Time:</strong> {reorderSupplier.leadTime || 7} days
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Select Products to Order
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">Select</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Est. Delivery</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockProducts
                      .filter(product => (reorderSupplier.products || []).includes(product.id))
                      .map((product) => {
                        const deliveryDate = new Date();
                        deliveryDate.setDate(deliveryDate.getDate() + (reorderSupplier.leadTime || 7));
                        
                        return (
                          <TableRow key={product.id} hover>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleProductSelectionForOrder(product.id)}
                              />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell align="right">{format(deliveryDate, 'MMM dd, yyyy')}</TableCell>
                          </TableRow>
                        );
                      })}
                    {(reorderSupplier.products || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                          <Typography variant="body2">
                            No products available for this supplier. Please add products in the supplier details.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box mt={3} display="flex" justifyContent="space-between">
                <Typography variant="body2">
                  {selectedProducts.length} products selected
                </Typography>
                <Typography variant="body2">
                  {selectedProducts.length > 0 && (
                    <>Estimated delivery: {format(new Date(new Date().setDate(new Date().getDate() + (reorderSupplier.leadTime || 7))), 'MMMM dd, yyyy')}</>
                  )}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReorderDialog}>Cancel</Button>
          <Button 
            onClick={submitOrder} 
            variant="contained" 
            color="primary"
            disabled={selectedProducts.length === 0}
            startIcon={<ShoppingCartIcon />}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suppliers;
