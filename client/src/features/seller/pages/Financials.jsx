import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip
} from '@mui/material';
import {
  AttachMoney as RevenueIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as PayoutIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';

const SellerFinancials = () => {
  // Mock financial data
  const financialData = {
    totalEarnings: 15420.50,
    pendingPayouts: 2340.75,
    thisMonthRevenue: 4280.30,
    lastPayout: 12150.00,
    payoutDate: '2024-01-01'
  };

  const transactions = [
    {
      id: 'TXN-001',
      type: 'Sale',
      amount: 89.99,
      commission: 8.99,
      net: 81.00,
      date: '2024-01-15',
      status: 'Pending'
    },
    {
      id: 'TXN-002',
      type: 'Sale',
      amount: 156.50,
      commission: 15.65,
      net: 140.85,
      date: '2024-01-15',
      status: 'Pending'
    },
    {
      id: 'TXN-003',
      type: 'Payout',
      amount: 12150.00,
      commission: 0,
      net: 12150.00,
      date: '2024-01-01',
      status: 'Completed'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Financials & Payouts
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track your earnings, commissions, and payout history
      </Typography>

      {/* Financial Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Earnings
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${financialData.totalEarnings.toLocaleString()}
                  </Typography>
                </Box>
                <RevenueIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
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
                    Pending Payouts
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${financialData.pendingPayouts.toLocaleString()}
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
                    This Month
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${financialData.thisMonthRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
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
                    Last Payout
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${financialData.lastPayout.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {financialData.payoutDate}
                  </Typography>
                </Box>
                <PayoutIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payout Information */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payout Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Payouts are processed on the 1st and 15th of each month for earnings from the previous period.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Next payout: <strong>February 1st, 2024</strong>
            </Typography>
            <Button variant="outlined" size="small">
              View Payout Settings
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Commission Structure
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Platform commission: <strong>10%</strong> per sale
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Payment processing fee: <strong>2.9% + $0.30</strong>
            </Typography>
            <Button variant="outlined" size="small">
              View Commission Details
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Paper>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Transaction History
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Commission</TableCell>
                <TableCell>Net Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {transaction.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>${transaction.amount}</TableCell>
                  <TableCell>
                    {transaction.commission > 0 ? `-$${transaction.commission}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      ${transaction.net}
                    </Typography>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SellerFinancials;
