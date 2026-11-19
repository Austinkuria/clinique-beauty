// client/src/features/seller/pages/Orders.jsx
import React, { useState, useEffect, useContext } from 'react';
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
  Chip,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';
import { useAuth } from '@clerk/clerk-react';
import { ThemeContext } from '../../../context/ThemeContext';
import { formatCurrency } from '../../../utils/helpers';

const SellerOrders = () => {
  const { colorValues } = useContext(ThemeContext);
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const fetchVendorOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${baseUrl}/seller/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load vendor orders');
      }

      const resData = await response.json();
      setOrders(resData.data || []);
    } catch (err) {
      console.error('Error fetching vendor orders:', err);
      setError(err.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${baseUrl}/seller/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setStatusDialogOpen(false);
        fetchVendorOrders();
      }
    } catch (err) {
      console.error('Error updating sub-order status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'packed': return 'primary';
      case 'ready_for_pickup': return 'secondary';
      case 'in_transit':
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <DeliveredIcon />;
      case 'in_transit':
      case 'shipped': return <ShippingIcon />;
      case 'cancelled': return <CancelledIcon />;
      default: return <OrderIcon />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Orders Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage your store consignments and sub-orders
      </Typography>

      {/* Order Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Sub-Orders
              </Typography>
              <Typography variant="h4" color="primary.main">
                {orders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Pending Action
              </Typography>
              <Typography variant="h4" color="warning.main">
                {orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Dispatched
              </Typography>
              <Typography variant="h4" color="info.main">
                {orders.filter(o => o.status === 'in_transit' || o.status === 'shipped').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Delivered
              </Typography>
              <Typography variant="h4" color="success.main">
                {orders.filter(o => o.status === 'delivered').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <Paper sx={{ bgcolor: colorValues.bgSecondary }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No orders assigned to your store yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sub-Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>Payout</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {order.sub_order_number || order.id.substring(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.orders?.customer_email || 'Customer'}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.order_items?.length || 0}</TableCell>
                    <TableCell>{formatCurrency(order.subtotal)}</TableCell>
                    <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      {formatCurrency(order.seller_payout)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setStatusDialogOpen(true);
                        }}
                      >
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Sub-Order Status</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="packed">Packed</MenuItem>
              <MenuItem value="ready_for_pickup">Ready for Pickup</MenuItem>
              <MenuItem value="in_transit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerOrders;
