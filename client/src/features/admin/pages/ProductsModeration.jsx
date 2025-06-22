import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Alert,
  Snackbar,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Pending as PendingIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Inventory as StockIcon
} from '@mui/icons-material';

const AdminProductsModeration = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterApproval, setFilterApproval] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load products data
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      // Simulate API call - in real app this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProducts = [
        {
          id: 1,
          name: 'Vitamin C Brightening Serum',
          seller: 'Beauty Essentials Co',
          sellerAvatar: '/api/placeholder/40/40',
          category: 'Skincare',
          price: 45.99,
          stock: 25,
          status: 'Active',
          approvalStatus: 'Pending',
          submittedDate: '2024-01-15',
          image: '/api/placeholder/200/200',
          sku: 'VCS-001',
          featured: false,
          rating: 0,
          sales: 0,
          views: 45
        },
        {
          id: 2,
          name: 'Hydrating Face Cream',
          seller: 'Luxury Cosmetics',
          sellerAvatar: '/api/placeholder/40/40',
          category: 'Skincare',
          price: 35.99,
          stock: 15,
          status: 'Active',
          approvalStatus: 'Approved',
          submittedDate: '2024-01-10',
          approvedDate: '2024-01-12',
          image: '/api/placeholder/200/200',
          sku: 'HFC-002',
          featured: true,
          rating: 4.6,
          sales: 38,
          views: 156
        },
        {
          id: 3,
          name: 'Anti-Aging Night Cream',
          seller: 'Natural Beauty Products',
          sellerAvatar: '/api/placeholder/40/40',
          category: 'Skincare',
          price: 65.99,
          stock: 18,
          status: 'Active',
          approvalStatus: 'Rejected',
          submittedDate: '2024-01-12',
          rejectedDate: '2024-01-14',
          rejectionReason: 'Product description lacks sufficient ingredient information',
          image: '/api/placeholder/200/200',
          sku: 'ANC-003',
          featured: false,
          rating: 0,
          sales: 0,
          views: 23
        },
        {
          id: 4,
          name: 'Gentle Cleansing Oil',
          seller: 'Organic Skincare Ltd',
          sellerAvatar: '/api/placeholder/40/40',
          category: 'Skincare',
          price: 28.99,
          stock: 32,
          status: 'Active',
          approvalStatus: 'Pending',
          submittedDate: '2024-01-16',
          image: '/api/placeholder/200/200',
          sku: 'GCO-004',
          featured: false,
          rating: 0,
          sales: 0,
          views: 12
        },
        {
          id: 5,
          name: 'SPF 50 Sunscreen Lotion',
          seller: 'Sun Protection Co',
          sellerAvatar: '/api/placeholder/40/40',
          category: 'Skincare',
          price: 32.99,
          stock: 0,
          status: 'Out of Stock',
          approvalStatus: 'Approved',
          submittedDate: '2024-01-05',
          approvedDate: '2024-01-08',
          image: '/api/placeholder/200/200',
          sku: 'SPF-005',
          featured: false,
          rating: 4.7,
          sales: 28,
          views: 89
        }
      ];
      
      setProducts(mockProducts);
      setLoading(false);
    };

    loadProducts();
  }, []);

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !search || 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.seller.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || product.status === filterStatus;
    const matchesApproval = !filterApproval || product.approvalStatus === filterApproval;
    
    return matchesSearch && matchesStatus && matchesApproval;
  });

  // Get products based on tab selection
  const getProductsByTab = () => {
    switch (tabValue) {
      case 0: // All Products
        return filteredProducts;
      case 1: // Pending Approval
        return filteredProducts.filter(p => p.approvalStatus === 'Pending');
      case 2: // Approved
        return filteredProducts.filter(p => p.approvalStatus === 'Approved');
      case 3: // Rejected
        return filteredProducts.filter(p => p.approvalStatus === 'Rejected');
      default:
        return filteredProducts;
    }
  };

  const displayProducts = getProductsByTab();

  // Get counts for tabs
  const pendingCount = products.filter(p => p.approvalStatus === 'Pending').length;
  const approvedCount = products.filter(p => p.approvalStatus === 'Approved').length;
  const rejectedCount = products.filter(p => p.approvalStatus === 'Rejected').length;

  // Helper functions
  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Out of Stock': return 'error';
      case 'Draft': return 'default';
      default: return 'default';
    }
  };

  // Event handlers
  const handleApprove = async (product) => {
    try {
      // In real app, make API call to approve product
      setProducts(products.map(p => 
        p.id === product.id 
          ? { ...p, approvalStatus: 'Approved', approvedDate: new Date().toISOString().split('T')[0] }
          : p
      ));
      
      setSnackbar({
        open: true,
        message: `Product "${product.name}" has been approved`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to approve product',
        severity: 'error'
      });
    }
  };

  const handleReject = async (product, reason) => {
    try {
      // In real app, make API call to reject product
      setProducts(products.map(p => 
        p.id === product.id 
          ? { 
              ...p, 
              approvalStatus: 'Rejected', 
              rejectedDate: new Date().toISOString().split('T')[0],
              rejectionReason: reason
            }
          : p
      ));
      
      setSnackbar({
        open: true,
        message: `Product "${product.name}" has been rejected`,
        severity: 'info'
      });
      
      setApprovalDialogOpen(false);
      setRejectionReason('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to reject product',
        severity: 'error'
      });
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      setProducts(products.map(p => 
        p.id === product.id 
          ? { ...p, featured: !p.featured }
          : p
      ));
      
      setSnackbar({
        open: true,
        message: `Product ${product.featured ? 'removed from' : 'added to'} featured listings`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update featured status',
        severity: 'error'
      });
    }
  };

  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const openApprovalDialog = (product) => {
    setSelectedProduct(product);
    setApprovalDialogOpen(true);
    handleMenuClose();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Product Moderation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review, approve, and manage seller products
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {products.length}
                  </Typography>
                </Box>
                <StoreIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Pending Approval
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {pendingCount}
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Approved Products
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {approvedCount}
                  </Typography>
                </Box>
                <ApproveIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Rejected Products
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {rejectedCount}
                  </Typography>
                </Box>
                <RejectIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products, sellers, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Approval Status</InputLabel>
              <Select
                value={filterApproval}
                label="Approval Status"
                onChange={(e) => setFilterApproval(e.target.value)}
              >
                <MenuItem value="">All Approval Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Products" />
          <Tab 
            label={
              <Badge badgeContent={pendingCount} color="warning">
                Pending Approval
              </Badge>
            } 
          />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Paper>

      {/* Products Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Approval</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from(new Array(9)).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 40, height: 40, bgcolor: 'grey.200', borderRadius: 1 }} />
                          <Box>
                            <Box sx={{ width: 100, height: 12, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                            <Box sx={{ width: 60, height: 10, bgcolor: 'grey.100', borderRadius: 1 }} />
                          </Box>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                displayProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={product.image}
                            variant="rounded"
                            sx={{ width: 50, height: 50 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.sku}
                            </Typography>
                            {product.featured && (
                              <Chip label="Featured" color="primary" size="small" sx={{ mt: 0.5 }} />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={product.sellerAvatar} sx={{ width: 24, height: 24 }} />
                          <Typography variant="body2">{product.seller}</Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StockIcon fontSize="small" color="action" />
                          <Typography variant="body2">{product.stock}</Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={product.status}
                          color={getStatusColor(product.status)}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={product.approvalStatus}
                          color={getApprovalStatusColor(product.approvalStatus)}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <TrendingUpIcon fontSize="small" color="action" />
                            {product.sales} sales
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon fontSize="small" color="warning" />
                            {product.rating || 'No rating'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, product)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          component="div"
          count={displayProducts.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => console.log('View product')}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        {selectedProduct?.approvalStatus === 'Pending' && (
          <>
            <MenuItem onClick={() => handleApprove(selectedProduct)}>
              <ListItemIcon>
                <ApproveIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Approve</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => openApprovalDialog(selectedProduct)}>
              <ListItemIcon>
                <RejectIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Reject</ListItemText>
            </MenuItem>
          </>
        )}
        
        {selectedProduct?.approvalStatus === 'Approved' && (
          <MenuItem onClick={() => handleToggleFeatured(selectedProduct)}>
            <ListItemIcon>
              <StarIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>
              {selectedProduct.featured ? 'Remove from Featured' : 'Add to Featured'}
            </ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => console.log('Contact seller')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Contact Seller</ListItemText>
        </MenuItem>
      </Menu>

      {/* Rejection Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Product</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Product: {selectedProduct?.name}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a clear reason for rejection to help the seller improve their product..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleReject(selectedProduct, rejectionReason)}
            color="error"
            variant="contained"
            disabled={!rejectionReason.trim()}
          >
            Reject Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProductsModeration;
