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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  AttachMoney as RevenueIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as PayoutIcon,
  Schedule as PendingIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../utils/helpers';

const SellerFinancials = () => {
  const { getToken } = useAuth();
  const [financials, setFinancials] = useState({
    wallet: { pending_balance: 0, available_balance: 0, total_withdrawn: 0 },
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('0797561978');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
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

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleRequestPayout = async () => {
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }
    if (amt > financials.wallet.available_balance) {
      toast.error('Requested amount exceeds available balance');
      return;
    }
    setSubmittingPayout(true);
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
      const response = await fetch(`${baseUrl}/seller/financials/payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: amt, phone: payoutPhone })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'M-Pesa payout processed successfully!');
        setPayoutOpen(false);
        setPayoutAmount('');
        await fetchFinancials();
      } else {
        toast.error(data.message || 'Failed to process payout');
      }
    } catch (err) {
      toast.error(err.message || 'Error processing payout request');
    } finally {
      setSubmittingPayout(false);
    }
  };

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
        <Button 
          variant="contained" 
          disabled={wallet.available_balance <= 0}
          onClick={() => {
            setPayoutAmount(String(wallet.available_balance));
            setPayoutOpen(true);
          }}
          sx={{ fontWeight: 600, textTransform: 'none' }}
        >
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
                {transactions.map((tx) => {
                  const txType = tx.transaction_type || tx.type || 'escrow_release';
                  const txDate = tx.created_at || tx.date;
                  return (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontFamily="monospace">
                          {String(tx.id).substring(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={txType.replace('_', ' ')}
                          color={getStatusColor(txType)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: tx.amount < 0 ? 'error.main' : 'inherit' }}>
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        {txDate ? new Date(txDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* M-Pesa Payout Modal */}
      <Dialog open={payoutOpen} onClose={() => setPayoutOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request M-Pesa Payout</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Funds will be sent directly to your registered Safaricom M-Pesa phone number via B2C disbursement.
            </Typography>
            <TextField
              label="M-Pesa Phone Number"
              fullWidth
              value={payoutPhone}
              onChange={(e) => setPayoutPhone(e.target.value)}
              placeholder="e.g. 0712345678"
            />
            <TextField
              label="Amount to Withdraw (KSh)"
              type="number"
              fullWidth
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              helperText={`Available: ${formatCurrency(wallet.available_balance)}`}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPayoutOpen(false)} disabled={submittingPayout}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRequestPayout} 
            disabled={submittingPayout || !payoutAmount || Number(payoutAmount) <= 0}
            startIcon={submittingPayout ? <CircularProgress size={16} /> : <SendIcon />}
            sx={{ fontWeight: 600 }}
          >
            {submittingPayout ? 'Disbursing...' : 'Confirm Payout'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerFinancials;
