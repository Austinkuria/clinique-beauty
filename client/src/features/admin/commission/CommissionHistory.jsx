import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { commissionApi } from '../../../data/commissionApi';

const CommissionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    sellerId: '',
    status: 'all'
  });

  useEffect(() => {
    const fetchCommissionHistory = async () => {
      try {
        setLoading(true);
        const data = await commissionApi.getCommissionHistory(filters);
        setHistory(data);
        setError(null);
      } catch (err) {
        setError('Failed to load commission history. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionHistory();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      sellerId: '',
      status: 'all'
    });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip label="Paid" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 0 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="h5">Commission Payment History</Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Filter Commission Records</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Seller ID"
                name="sellerId"
                value={filters.sellerId}
                onChange={handleFilterChange}
                placeholder="Enter seller ID"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Payment Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Payment Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={resetFilters}>Reset Filters</Button>
          </Box>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : history.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>No commission records found matching your criteria.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Commission Rate</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{record.sellerName}</Typography>
                      <Typography variant="caption" color="textSecondary">{record.sellerId}</Typography>
                    </TableCell>
                    <TableCell>${record.amount.toFixed(2)}</TableCell>
                    <TableCell>{record.rate}%</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
};

export default CommissionHistory;
