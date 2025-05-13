import React, { useState } from 'react';
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
import { Search as SearchIcon, GetApp as ExportIcon } from '@mui/icons-material';

const SellerList = ({ sellers, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
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
  
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = 
      seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || seller.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </Select>
        </FormControl>
      </Box>
      
      {filteredSellers.length === 0 ? (
        <Typography sx={{ textAlign: 'center', py: 4 }}>
          No sellers found matching your criteria.
        </Typography>
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
