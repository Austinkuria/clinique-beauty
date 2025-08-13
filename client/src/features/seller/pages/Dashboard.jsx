import React, { useState, useEffect, useContext } from 'react';
import { formatCurrency } from '../../../utils/helpers';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  useTheme,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  AttachMoney as RevenueIcon,
  Visibility as ViewsIcon,
  Star as StarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ThemeContext } from '../../../context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const SellerDashboard = () => {
  const theme = useTheme();
  const { colorValues } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData({
        metrics: {
          totalRevenue: 15420.50,
          revenueChange: 12.5,
          totalOrders: 89,
          ordersChange: 8.2,
          totalProducts: 24,
          productsChange: 2.1,
          storeViews: 1247,
          viewsChange: 15.3,
          avgRating: 4.7,
          ratingChange: 0.2
        },
        recentOrders: [
          { id: 'ORD-001', customer: 'Sarah Johnson', amount: 89.99, status: 'Processing', date: '2025-01-15' },
          { id: 'ORD-002', customer: 'Mike Chen', amount: 156.50, status: 'Shipped', date: '2025-01-15' },
          { id: 'ORD-003', customer: 'Emma Wilson', amount: 45.00, status: 'Delivered', date: '2025-01-14' },
          { id: 'ORD-004', customer: 'David Brown', amount: 78.25, status: 'Processing', date: '2025-01-14' },
        ],
        topProducts: [
          { name: 'Vitamin C Serum', sales: 45, revenue: 1350.00, image: '/api/placeholder/50/50' },
          { name: 'Hydrating Face Cream', sales: 38, revenue: 1140.00, image: '/api/placeholder/50/50' },
          { name: 'Cleansing Oil', sales: 32, revenue: 960.00, image: '/api/placeholder/50/50' },
          { name: 'Sunscreen SPF 50', sales: 28, revenue: 840.00, image: '/api/placeholder/50/50' },
        ],
        notifications: [
          { type: 'warning', message: 'Low stock alert: Vitamin C Serum (5 units left)', date: '2 hours ago' },
          { type: 'success', message: 'New customer review: 5 stars for Hydrating Face Cream', date: '4 hours ago' },
          { type: 'info', message: 'Weekly analytics report is ready', date: '1 day ago' },
          { type: 'pending', message: '3 products pending approval from admin', date: '2 days ago' },
        ]
      });
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  // Chart configurations
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (Ksh)',
        data: [2400, 2800, 3200, 2900, 3500, 4200],
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        fill: true,
      },
    ],
  };

  const ordersChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: [12, 15, 8, 20, 18, 25, 22],
        backgroundColor: theme.palette.secondary.main,
      },
    ],
  };

  const productStatusData = {
    labels: ['Active', 'Pending Approval', 'Draft', 'Out of Stock'],
    datasets: [
      {
        data: [15, 3, 4, 2],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.error.main,
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return <WarningIcon color="warning" />;
      case 'success': return <CheckCircleIcon color="success" />;
      case 'pending': return <PendingIcon color="warning" />;
      default: return <NotificationsIcon color="info" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Loading Dashboard...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.firstName || 'Seller'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your store today.
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: colorValues.bgSecondary }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(dashboardData.metrics.totalRevenue)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{dashboardData.metrics.revenueChange}%
                    </Typography>
                  </Box>
                </Box>
                <RevenueIcon sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: colorValues.bgSecondary }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Orders
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {dashboardData.metrics.totalOrders}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{dashboardData.metrics.ordersChange}%
                    </Typography>
                  </Box>
                </Box>
                <OrdersIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: colorValues.bgSecondary }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Products
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {dashboardData.metrics.totalProducts}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{dashboardData.metrics.productsChange}%
                    </Typography>
                  </Box>
                </Box>
                <ProductsIcon sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: colorValues.bgSecondary }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Store Views
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {dashboardData.metrics.storeViews.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{dashboardData.metrics.viewsChange}%
                    </Typography>
                  </Box>
                </Box>
                <ViewsIcon sx={{ fontSize: 40, color: theme.palette.info.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: colorValues.bgSecondary }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Avg Rating
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {dashboardData.metrics.avgRating}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <StarIcon color="warning" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="warning.main">
                      +{dashboardData.metrics.ratingChange}
                    </Typography>
                  </Box>
                </Box>
                <StarIcon sx={{ fontSize: 40, color: theme.palette.warning.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Data */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={revenueChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Product Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={productStatusData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Orders and Top Products */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Orders</Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/seller/orders')}
              >
                View All
              </Button>
            </Box>
            <List>
              {dashboardData.recentOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{order.id}</Typography>
                          <Chip 
                            label={order.status} 
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {order.customer}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(order.amount)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.recentOrders.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Top Products</Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/seller/products')}
              >
                Manage
              </Button>
            </Box>
            <List>
              {dashboardData.topProducts.map((product, index) => (
                <React.Fragment key={product.name}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar src={product.image} variant="rounded" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" noWrap>
                          {product.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {product.sales} sales
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(product.revenue)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.topProducts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Notifications and Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <List>
              {dashboardData.notifications.map((notification, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.message}
                      secondary={notification.date}
                    />
                  </ListItem>
                  {index < dashboardData.notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/seller/products/new')}
                  sx={{ py: 1.5 }}
                >
                  Add Product
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/seller/products')}
                  sx={{ py: 1.5 }}
                >
                  Manage Products
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<OrdersIcon />}
                  onClick={() => navigate('/seller/orders')}
                  sx={{ py: 1.5 }}
                >
                  Process Orders
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AnalyticsIcon />}
                  onClick={() => navigate('/seller/analytics')}
                  sx={{ py: 1.5 }}
                >
                  View Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerDashboard;
