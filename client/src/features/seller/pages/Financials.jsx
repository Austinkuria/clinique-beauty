// client/src/features/seller/pages/Financials.jsx
import React, { useState, useEffect } from 'react';
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
  Chip,
  CircularProgress
} from '@mui/material';
import {
  AttachMoney as RevenueIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as PayoutIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { useAuth } from '@clerk/clerk-react';
import { formatCurrency } from '../../../utils/helpers';

const SellerFinancials = () => {
  const { getToken } = useAuth();
  const [financials, setFinancials] = useState({
    wallet: { pending_balance: 0, available_balance: 0, total_withdrawn: 0 },
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancials = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const response = await fetch(`${baseUrl}/seller/financials`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const resData = await response.json();
          setFinancials(resData);
        }
      } catch (err) {
        console.error('Error fetching seller financials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancials();
  }, []);

  const getStatusColor = (type) => {
    switch (type) {
      case 'escrow_release': return 'success';
      case 'escrow_credit': return 'warning';
      case 'payout_deduction': return 'info';
      case 'refund_debit': return 'error';
      default: return 'default';
    }
  };

  const { wallet, transactions } = financials;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Financial Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your earnings, platform commissions, and escrow releases
          </Typography>
        </Box>
        <Button variant="contained" disabled={wallet.available_balance <= 0}>
          Request M-Pesa Payout
        </Button>
      </Box>

      {/* Financial Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Available for Payout
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {formatCurrency(wallet.available_balance)}
                  </Typography>
                </Box>
                <RevenueIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Pending Escrow (In Transit / Return Window)
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {formatCurrency(wallet.pending_balance)}
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Withdrawn
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(wallet.total_withdrawn)}
                  </Typography>
                </Box>
                <PayoutIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Recent Wallet Ledger Transactions
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : transactions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No transactions recorded in your seller wallet ledger yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontFamily="monospace">
                        {tx.id.substring(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tx.transaction_type.replace('_', ' ')}
                        color={getStatusColor(tx.transaction_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default SellerFinancials;
