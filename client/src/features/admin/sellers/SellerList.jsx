import React, { useState, useEffect } from 'react';
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
  Paper
} from '@mui/material';
import { Search as SearchIcon, GetApp as ExportIcon, SentimentDissatisfied as EmptyIcon } from '@mui/icons-material';
import { sellerApi } from '../../../data/sellerApi';

const SellerList = ({ sellers = [], loading: propLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [localSellers, setLocalSellers] = useState(sellers);
  const [loading, setLoading] = useState(propLoading || false);
  
  // Load mock data if no sellers are passed as props
  useEffect(() => {
    if (sellers.length === 0 && !propLoading) {
      setLoading(true);
      sellerApi.getSellers()
        .then(data => {
          setLocalSellers(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading sellers:', error);
          setLoading(false);
        });
    } else {
      setLocalSellers(sellers);
    }
  }, [sellers, propLoading]);
  
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
  const filteredSellers = Array.isArray(localSellers) 
    ? localSellers.filter(seller => {
        const matchesSearch = 
          seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seller.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seller.email.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesStatus = filterStatus === 'all' || seller.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Sellers</Typography>
        <Button variant="contained" startIcon={<ExportIcon />}>
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
                      <Button variant="outlined" size="small">View</Button>
                      <Button variant="outlined" color="secondary" size="small">Edit</Button>
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
