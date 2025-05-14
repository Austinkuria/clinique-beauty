import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, GetApp as ExportIcon, SentimentDissatisfied as EmptyIcon } from '@mui/icons-material';
import { sellerApi } from '../../../data/sellerApi';

const SellerList = ({ sellers = [], loading: propLoading }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [localSellers, setLocalSellers] = useState(sellers);
  const [loading, setLoading] = useState(propLoading || false);
  const [error, setError] = useState(null);
  
  // Load sellers data with filters
  const loadSellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Only apply filters for API requests if they're set
      const filters = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }
      
      const data = await sellerApi.getSellers(filters);
      setLocalSellers(data);
    } catch (err) {
      console.error('Error loading sellers:', err);
      setError('Failed to load sellers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus]);
  
  // Load data on initial render and when props change
  useEffect(() => {
    if (sellers.length > 0) {
      // If sellers are provided as props, use them
      setLocalSellers(sellers);
    } else {
      // Otherwise load from API
      loadSellers();
    }
  }, [sellers, loadSellers]);
  
  // Handle filter changes with debounce
  useEffect(() => {
    // Only fetch if not using prop data
    if (sellers.length === 0) {
      const timer = setTimeout(() => {
        loadSellers();
      }, 500); // Debounce 500ms
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterStatus, sellers.length, loadSellers]);

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };
  
  // Ensure sellers is an array before filtering
  let filteredSellers = [];
  
  // If we're using props data, filter it locally
  if (sellers.length > 0) {
    filteredSellers = sellers.filter(seller => {
      const matchesSearch = !searchTerm.trim() || 
        seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = filterStatus === 'all' || seller.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  } else {
    // Otherwise use the data from the API which is already filtered
    filteredSellers = Array.isArray(localSellers) ? localSellers : [];
  }

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="contained" onClick={loadSellers} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Paper>
    );
  }

  // Handle navigation to seller details page
  const handleViewSeller = (sellerId) => {
    console.log('Navigating to seller details:', sellerId);
    navigate(`/admin/sellers/${sellerId}`);
  };

  // Handle navigation to seller edit page  
  const handleEditSeller = (sellerId) => {
    console.log('Navigating to edit seller:', sellerId);
    navigate(`/admin/sellers/${sellerId}/edit`);
  };

  // Export sellers data as CSV
  const handleExportSellers = () => {
    // Create CSV content
    const headers = ['Business Name', 'Contact Person', 'Email', 'Location', 'Status', 'Registration Date'];
    const csvRows = [headers];
    
    filteredSellers.forEach(seller => {
      const row = [
        seller.businessName,
        seller.contactName,
        seller.email,
        seller.location || '',
        seller.status,
        new Date(seller.registrationDate).toLocaleDateString()
      ];
      csvRows.push(row);
    });
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.map(cell => 
      `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sellers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Sellers</Typography>
        <Button 
          variant="contained" 
          startIcon={<ExportIcon />} 
          onClick={handleExportSellers}
          disabled={filteredSellers.length === 0}
        >
          Export List
        </Button>
      </Box>
      
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField 
          placeholder="Search by name, email, etc."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: '400px' }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ width: '200px' }} size="small">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {filteredSellers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EmptyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || filterStatus !== 'all'
              ? "No sellers found matching your criteria."
              : "No sellers available in the system."}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || filterStatus !== 'all'
              ? "Try adjusting your search or filter settings."
              : "Once sellers register on the platform, they will appear here."}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            sx={{ display: searchTerm || filterStatus !== 'all' ? 'inline-flex' : 'none' }}
          >
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Business Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSellers.map(seller => (
                <TableRow key={seller.id}>
                  <TableCell>{seller.businessName}</TableCell>
                  <TableCell>{seller.contactName}</TableCell>
                  <TableCell>{seller.email}</TableCell>
                  <TableCell>{new Date(seller.registrationDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusChip(seller.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View seller details">
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleViewSeller(seller.id)}
                        >
                          View
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit seller information">
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          size="small"
                          onClick={() => handleEditSeller(seller.id)}
                        >
                          Edit
                        </Button>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SellerList;
