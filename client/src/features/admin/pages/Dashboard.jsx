import React, { useState, useEffect, useContext } from 'react';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    Divider,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar
} from '@mui/material';
import {
    AttachMoney as RevenueIcon,
    ShoppingCart as OrdersIcon,
    People as UsersIcon,
    Inventory as ProductsIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Mock data (replace with actual API calls)
const mockRevenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 16000 },
    { month: 'May', revenue: 21000 },
    { month: 'Jun', revenue: 19000 },
    { month: 'Jul', revenue: 22000 },
];

const mockCategoryData = [
    { name: 'Skincare', value: 400 },
    { name: 'Makeup', value: 300 },
    { name: 'Fragrance', value: 200 },
    { name: 'Hair', value: 100 },
];

const mockRecentOrders = [
    { id: 'ORD-1001', customer: 'Emma Watson', total: 89.99, status: 'Completed', date: '2023-09-15' },
    { id: 'ORD-1002', customer: 'John Doe', total: 124.50, status: 'Processing', date: '2023-09-14' },
    { id: 'ORD-1003', customer: 'Alice Smith', total: 76.25, status: 'Shipped', date: '2023-09-14' },
    { id: 'ORD-1004', customer: 'Robert Brown', total: 212.99, status: 'Processing', date: '2023-09-13' },
    { id: 'ORD-1005', customer: 'Jane Cooper', total: 45.00, status: 'Completed', date: '2023-09-12' },
];

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function AdminDashboard() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        revenue: 123456,
        orders: 256,
        users: 1289,
        products: 457
    });
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // In a real app, you would fetch data from your API
                // const data = await api.getAdminDashboardStats();
                // setStats(data);
                
                // For now, we'll just simulate a loading delay
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };
        
        fetchDashboardData();
    }, [api]);
    
    // Stat Card Component
    const StatCard = ({ title, value, icon, color, percentChange }) => (
        <Paper
            elevation={theme === 'dark' ? 3 : 1}
            sx={{
                p: 2,
                height: '100%',
                bgcolor: colorValues.bgPaper,
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme === 'dark' ? '0 8px 16px rgba(0,0,0,0.6)' : '0 8px 16px rgba(0,0,0,0.1)',
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                        {title === 'Total Revenue' ? `$${value.toLocaleString()}` : value.toLocaleString()}
                    </Typography>
                    
                    {percentChange && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {percentChange > 0 ? (
                                <TrendingUpIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                            ) : (
                                <TrendingDownIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                            )}
                            <Typography 
                                variant="body2" 
                                color={percentChange > 0 ? 'success.main' : 'error.main'}
                            >
                                {percentChange > 0 ? '+' : ''}{percentChange}% since last month
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Avatar sx={{ bgcolor: `${color}.lighter`, color: `${color}.main`, p: 1 }}>
                    {icon}
                </Avatar>
            </Box>
        </Paper>
    );
    
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Dashboard</Typography>
            
            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Revenue" 
                        value={stats.revenue} 
                        icon={<RevenueIcon />} 
                        color="primary"
                        percentChange={12.5}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Orders" 
                        value={stats.orders} 
                        icon={<OrdersIcon />} 
                        color="info"
                        percentChange={8.2}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Users" 
                        value={stats.users} 
                        icon={<UsersIcon />} 
                        color="warning"
                        percentChange={5.1}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Products" 
                        value={stats.products} 
                        icon={<ProductsIcon />} 
                        color="success"
                        percentChange={-2.3}
                    />
                </Grid>
            </Grid>
            
            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>Revenue Overview</Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={mockRevenueData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke={colorValues.primary} 
                                        activeDot={{ r: 8 }}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>Sales by Category</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={mockCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {mockCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Recent Orders */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>Recent Orders</Typography>
                        <List>
                            {mockRecentOrders.map((order, index) => (
                                <React.Fragment key={order.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: colorValues.primary }}>{order.customer.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {order.id} - ${order.total}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="textPrimary">
                                                        {order.customer}
                                                    </Typography>
                                                    {` — ${order.date} • `}
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        sx={{
                                                            color: 
                                                                order.status === 'Completed' ? 'success.main' :
                                                                order.status === 'Processing' ? 'info.main' : 
                                                                'warning.main'
                                                        }}
                                                    >
                                                        {order.status}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < mockRecentOrders.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default AdminDashboard;
