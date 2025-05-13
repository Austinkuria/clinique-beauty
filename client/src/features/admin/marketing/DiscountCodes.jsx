import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Grid,
  Card,
  CardContent,
  Modal,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { marketingApi } from '../../../data/marketingApi';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
  maxHeight: '90vh',
  overflow: 'auto'
};

const DiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    usageLimit: 100,
    minimumOrderValue: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [codesResponse, analyticsResponse] = await Promise.all([
          marketingApi.getDiscountCodes(),
          marketingApi.getMarketingAnalytics()
        ]);
        
        setDiscountCodes(codesResponse.data);
        setAnalytics(analyticsResponse.data.discountCodes);
      } catch (error) {
        console.error('Error fetching discount codes data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateDiscountCode = async () => {
    try {
      setLoading(true);
      await marketingApi.createDiscountCode(newCode);
      
      // Refresh the list
      const response = await marketingApi.getDiscountCodes();
      setDiscountCodes(response.data);
      
      setCreateModalOpen(false);
      setNewCode({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        usageLimit: 100,
        minimumOrderValue: 0
      });
    } catch (error) {
      console.error('Error creating discount code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await marketingApi.getDiscountCodeById(id);
      setSelectedCode(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching discount code details:', error);
    }
  };

  const handleDeleteCode = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount code?')) {
      try {
        await marketingApi.deleteDiscountCode(id);
        setDiscountCodes(discountCodes.filter(code => code.id !== id));
      } catch (error) {
        console.error('Error deleting discount code:', error);
      }
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'scheduled':
        return <Chip label="Scheduled" color="primary" size="small" />;
      case 'expired':
        return <Chip label="Expired" color="default" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  const copyCodeToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied ${code} to clipboard!`);
  };

  const filteredCodes = discountCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        code.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCode(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && discountCodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Discount Codes</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
        >
          Generate New Code
        </Button>
      </Box>

      {/* Analytics Overview */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>Active Codes</Typography>
                <Typography variant="h4">{analytics.active}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>Total Usage</Typography>
                <Typography variant="h4">{analytics.totalUsage.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>Average Discount</Typography>
                <Typography variant="h4">{analytics.averageDiscount}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>Revenue Generated</Typography>
                <Typography variant="h4">${analytics.revenueGenerated.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search discount codes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Discount Codes Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No discount codes found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {code.code}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => copyCodeToClipboard(code.code)}
                          sx={{ ml: 1 }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{code.description}</TableCell>
                    <TableCell>
                      {code.discountType === 'percentage' 
                        ? `${code.discountValue}%` 
                        : `$${code.discountValue}`}
                    </TableCell>
                    <TableCell>
                      {new Date(code.startDate).toLocaleDateString()} - {new Date(code.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusChip(code.status)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {code.usageCount} / {code.usageLimit}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Min. Order: ${code.minimumOrderValue}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleViewDetails(code.id)}
                      >
                        <BarChartIcon />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => handleDeleteCode(code.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Code Details Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <Box sx={modalStyle}>
          {selectedCode ? (
            <>
              <Typography variant="h6" component="h2" gutterBottom>
                Discount Code Details
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Code:</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {selectedCode.code}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Box>{getStatusChip(selectedCode.status)}</Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description:</Typography>
                  <Typography variant="body1">{selectedCode.description}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Discount Type:</Typography>
                  <Typography variant="body1">
                    {selectedCode.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Discount Value:</Typography>
                  <Typography variant="body1">
                    {selectedCode.discountType === 'percentage' 
                      ? `${selectedCode.discountValue}%` 
                      : `$${selectedCode.discountValue}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Minimum Order Value:</Typography>
                  <Typography variant="body1">${selectedCode.minimumOrderValue}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Usage:</Typography>
                  <Typography variant="body1">
                    {selectedCode.usageCount} out of {selectedCode.usageLimit} ({((selectedCode.usageCount / selectedCode.usageLimit) * 100).toFixed(1)}%)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Valid From:</Typography>
                  <Typography variant="body1">{new Date(selectedCode.startDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Valid Until:</Typography>
                  <Typography variant="body1">{new Date(selectedCode.endDate).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Associated Campaigns:</Typography>
              {selectedCode.campaigns && selectedCode.campaigns.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  {selectedCode.campaigns.map((campaign, index) => (
                    <Chip 
                      key={index} 
                      label={campaign} 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  No campaigns associated with this code.
                </Typography>
              )}
              
              {selectedCode.applicable && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Applicable To:</Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {selectedCode.applicable.productCategories && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Product Categories:</Typography>
                        <Box>
                          {selectedCode.applicable.productCategories.map((category, index) => (
                            <Chip 
                              key={index} 
                              label={category} 
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                    
                    {selectedCode.applicable.customerGroups && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Customer Groups:</Typography>
                        <Box>
                          {selectedCode.applicable.customerGroups.map((group, index) => (
                            <Chip 
                              key={index} 
                              label={group} 
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
              
              {selectedCode.usageHistory && selectedCode.usageHistory.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Recent Usage:</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Order ID</TableCell>
                          <TableCell align="right">Order Amount</TableCell>
                          <TableCell align="right">Discount Applied</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCode.usageHistory.map((usage, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(usage.date).toLocaleDateString()}</TableCell>
                            <TableCell>{usage.orderId}</TableCell>
                            <TableCell align="right">${usage.amount.toFixed(2)}</TableCell>
                            <TableCell align="right">${usage.discount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={() => setModalOpen(false)}>Close</Button>
              </Box>
            </>
          ) : (
            <CircularProgress />
          )}
        </Box>
      </Modal>

      {/* Create Discount Code Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Generate New Discount Code
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                label="Code"
                name="code"
                value={newCode.code}
                onChange={handleInputChange}
                fullWidth
                required
                placeholder="e.g. SUMMER2023"
                helperText="Uppercase letters and numbers recommended"
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField 
                label="Description"
                name="description"
                value={newCode.description}
                onChange={handleInputChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  name="discountType"
                  value={newCode.discountType}
                  onChange={handleInputChange}
                  label="Discount Type"
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField 
                label={newCode.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                name="discountValue"
                type="number"
                value={newCode.discountValue}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">
                    {newCode.discountType === 'percentage' ? '%' : '$'}
                  </InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Start Date"
                name="startDate"
                type="date"
                value={newCode.startDate}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField 
                label="End Date"
                name="endDate"
                type="date"
                value={newCode.endDate}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Usage Limit"
                name="usageLimit"
                type="number"
                value={newCode.usageLimit}
                onChange={handleInputChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Minimum Order Value"
                name="minimumOrderValue"
                type="number"
                value={newCode.minimumOrderValue}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleCreateDiscountCode}
              disabled={!newCode.code || !newCode.description}
            >
              Generate Code
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DiscountCodes;
