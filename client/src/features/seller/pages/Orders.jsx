import React from 'react';
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
  Avatar
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';

const SellerOrders = () => {
  // Mock orders data
  const orders = [
    {
      id: 'ORD-001',
      customer: 'Sarah Johnson',
      customerAvatar: '/api/placeholder/40/40',
      items: 2,
      total: 89.99,
      status: 'Processing',
      date: '2025-01-15',
      shippingAddress: '123 Main St, City, State 12345'
    },
    {
      id: 'ORD-002',
      customer: 'Mike Chen',
      customerAvatar: '/api/placeholder/40/40',
      items: 1,
      total: 156.50,
      status: 'Shipped',
      date: '2025-01-15',
      shippingAddress: '456 Oak Ave, City, State 67890'
    },
    {
      id: 'ORD-003',
      customer: 'Emma Wilson',
      customerAvatar: '/api/placeholder/40/40',
      items: 3,
      total: 45.00,
      status: 'Delivered',
      date: '2025-01-14',
      shippingAddress: '789 Pine St, City, State 11111'
    },
    {
      id: 'ORD-004',
      customer: 'David Brown',
      customerAvatar: '/api/placeholder/40/40',
      items: 1,
      total: 78.25,
      status: 'Cancelled',
      date: '2025-01-14',
      shippingAddress: '321 Elm St, City, State 22222'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'warning';
      case 'Shipped': return 'info';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing': return <OrderIcon />;
      case 'Shipped': return <ShippingIcon />;
      case 'Delivered': return <DeliveredIcon />;
      case 'Cancelled': return <CancelledIcon />;
      default: return <OrderIcon />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Orders Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage your store orders
      </Typography>

      {/* Order Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Orders
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
                Processing
              </Typography>
              <Typography variant="h4" color="warning.main">
                {orders.filter(o => o.status === 'Processing').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Shipped
              </Typography>
              <Typography variant="h4" color="info.main">
                {orders.filter(o => o.status === 'Shipped').length}
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
                {orders.filter(o => o.status === 'Delivered').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
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
                      {order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={order.customerAvatar} sx={{ width: 32, height: 32 }} />
                      <Typography variant="body2">{order.customer}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>${order.total}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      View Details
                    </Button>
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

export default SellerOrders;
