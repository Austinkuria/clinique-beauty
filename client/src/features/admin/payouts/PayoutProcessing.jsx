import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Grid, Paper, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, TextField,
  InputAdornment, Select, MenuItem, Button, Modal, Divider,
  FormControl, InputLabel, Card, CardContent, List, ListItem, ListItemText
} from '@mui/material';
import { 
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  GetApp as GetAppIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
  SaveAlt as SaveIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto'
};

const PayoutProcessing = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);

  useEffect(() => {
    // Mock data - in a real app, fetch from API
    const mockPayouts = [
      {
        id: 'PAY-12345',
        seller: 'Beauty Essentials Co',
        amount: 3845.75,
        period: 'Oct 1 - Oct 15, 2025',
        items: 127,
        status: 'pending',
        paymentMethod: 'Direct Deposit',
        createdAt: '2025-10-17',
        scheduledFor: '2025-10-20'
      },
      {
        id: 'PAY-12346',
        seller: 'Luxury Cosmetics',
        amount: 2758.32,
        period: 'Oct 1 - Oct 15, 2025',
        items: 85,
        status: 'processing',
        paymentMethod: 'PayPal',
        createdAt: '2025-10-17',
        scheduledFor: '2025-10-20'
      },
      {
        id: 'PAY-12320',
        seller: 'Natural Beauty Products',
        amount: 4125.90,
        period: 'Sep 15 - Sep 30, 2025',
        items: 156,
        status: 'completed',
        paymentMethod: 'Bank Transfer',
        createdAt: '2025-10-02',
        paidAt: '2025-10-05'
      },
      {
        id: 'PAY-12311',
        seller: 'Skincare Specialists',
        amount: 1897.45,
        period: 'Sep 15 - Sep 30, 2025',
        items: 72,
        status: 'failed',
        paymentMethod: 'Direct Deposit',
        createdAt: '2025-10-02',
        failureReason: 'Invalid bank account information'
      },
    ];

    setTimeout(() => {
      setPayouts(mockPayouts);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'processing':
        return <Chip label="Processing" color="info" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label="Unknown" color="default" size="small" />;
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = payout.seller.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payout.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || payout.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleOpen = (payout) => {
    setSelectedPayout(payout);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const initiateNewPayout = () => {
    // Logic to initiate a new payout would go here
    alert("This would open the new payout wizard");
  };

  const processPayout = (payoutId) => {
    // Logic to manually process a payout would go here
    alert(`Processing payout ${payoutId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Payout Processing & Tracking</Typography>
      
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Search by seller or payout ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: '250px' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: '200px' }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="contained" color="primary" onClick={initiateNewPayout}>
            New Payout
          </Button>
          <Button variant="outlined" startIcon={<SaveIcon />}>
            Export
          </Button>
        </Box>
      </Box>
      
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Payout Transactions</Typography>
        </Box>
        <TableContainer>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Typography>Loading payout data...</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payout ID</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayouts.map(payout => (
                  <TableRow key={payout.id}>
                    <TableCell>{payout.id}</TableCell>
                    <TableCell>{payout.seller}</TableCell>
                    <TableCell>${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>{payout.period}</TableCell>
                    <TableCell>{getStatusChip(payout.status)}</TableCell>
                    <TableCell>{payout.paymentMethod}</TableCell>
                    <TableCell>{payout.createdAt}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleOpen(payout)}
                        >
                          Details
                        </Button>
                        {payout.status === 'pending' && (
                          <Button 
                            variant="outlined" 
                            color="success"
                            size="small"
                            onClick={() => processPayout(payout.id)}
                          >
                            Process
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {/* Payout Detail Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Payout Details: {selectedPayout?.id}
          </Typography>
          
          {selectedPayout && (
            <>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Seller:</strong> {selectedPayout.seller}</Typography>
                  <Typography><strong>Amount:</strong> ${selectedPayout.amount.toFixed(2)}</Typography>
                  <Typography><strong>Period:</strong> {selectedPayout.period}</Typography>
                  <Typography>
                    <strong>Status:</strong> {getStatusChip(selectedPayout.status)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Payment Method:</strong> {selectedPayout.paymentMethod}</Typography>
                  <Typography><strong>Created Date:</strong> {selectedPayout.createdAt}</Typography>
                  {selectedPayout.status === 'completed' && (
                    <Typography><strong>Paid Date:</strong> {selectedPayout.paidAt}</Typography>
                  )}
                  {selectedPayout.status === 'pending' && (
                    <Typography><strong>Scheduled For:</strong> {selectedPayout.scheduledFor}</Typography>
                  )}
                  {selectedPayout.status === 'failed' && (
                    <Typography color="error">
                      <strong>Failure Reason:</strong> {selectedPayout.failureReason}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom>Items Summary</Typography>
              <Typography paragraph>{selectedPayout.items} items included in this payout</Typography>
              <Typography paragraph>Detailed item list would be displayed here...</Typography>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Transaction History</Typography>
              <Typography paragraph>Transaction history would be displayed here...</Typography>

              {selectedPayout.status === 'failed' && (
                <Paper sx={{ p: 2, bgcolor: '#fdeded', mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon color="error" sx={{ mr: 1 }} />
                    <Typography color="error">
                      This payout requires attention due to issues with payment processing.
                    </Typography>
                  </Box>
                </Paper>
              )}
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={handleClose}>
                  Close
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<GetAppIcon />}
                  disabled={selectedPayout.status !== 'completed'}
                >
                  Download Statement
                </Button>
                {selectedPayout.status === 'failed' && (
                  <Button variant="contained" color="warning">
                    Retry Payment
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default PayoutProcessing;
