import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    CircularProgress
} from '@mui/material';
import {
    AttachMoney as RevenueIcon,
    ShoppingCart as OrdersIcon,
    People as UsersIcon,
    Inventory as ProductsIcon,
    Assignment as FulfillmentIcon
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
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    ComposedChart,
    Bar
} from 'recharts';

// Import our new components
import StatCard from '../components/charts/StatCard';
import OrderFulfillmentChart from '../components/charts/OrderFulfillmentChart';
import GeographicalChart from '../components/charts/GeographicalChart';
import RecentOrdersList from '../components/charts/RecentOrdersList';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function AdminDashboard() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [timeRange, setTimeRange] = useState('monthly');
    
    // Define all fetch-related functions outside of useEffect to avoid hook ordering issues
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch dashboard data from the API
            const response = await api.getDashboardData(timeRange);
            
            // Check if the response contains the expected data structure
            if (response && response.data) {
                setDashboardData(response.data);
                console.log("Dashboard data loaded successfully:", response.data);
            } else {
                console.error('Dashboard data response is invalid:', response);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [api, timeRange]);
    
    // Separate data validation effect to avoid conditional hook calls
    useEffect(() => {
        if (dashboardData) {
            const checkSection = (name, data) => {
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    console.warn(`Dashboard section "${name}" is empty or missing`);
                    return false;
                }
                return true;
            };
            
            // Check each section
            checkSection('Revenue Projections', dashboardData.revenueProjections);
            checkSection('Top Products', dashboardData.topProducts);
            checkSection('Order Fulfillment - Rates', dashboardData.fulfillmentData?.rates);
            checkSection('Order Fulfillment - Statuses', dashboardData.fulfillmentData?.statuses);
            checkSection('Geographical Data', dashboardData.geographicalData);
            checkSection('Recent Orders', dashboardData.recentOrders);
        }
    }, [dashboardData]);
    
    // Main data fetching effect
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]); // This depends on timeRange through fetchDashboardData
    
    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };
    
    // Always render the same way, regardless of loading or error state
    // This ensures consistent hook ordering
    if (loading || !dashboardData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    // Extract data for different charts - Do this after the loading check 
    // to avoid potential errors when accessing properties of null
    const { stats, userGrowth, categoryData, topProducts, geographicalData, fulfillmentData, revenueProjections, recentOrders } = dashboardData;
    const revenueData = dashboardData.revenueCharts[timeRange] || dashboardData.revenueCharts.monthly;
    
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dashboard & Analytics</Typography>
                
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="time-range-select-label">Time Range</InputLabel>
                    <Select
                        labelId="time-range-select-label"
                        id="time-range-select"
                        value={timeRange}
                        label="Time Range"
                        onChange={handleTimeRangeChange}
                    >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            
            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard 
                        title="Total Revenue" 
                        value={stats.revenue.total} 
                        icon={<RevenueIcon />} 
                        color="primary"
                        percentChange={stats.revenue.growth}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard 
                        title="Total Orders" 
                        value={stats.orders.total} 
                        icon={<OrdersIcon />} 
                        color="info"
                        percentChange={stats.orders.growth}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard 
                        title="Total Users" 
                        value={stats.users.total} 
                        icon={<UsersIcon />} 
                        color="warning"
                        percentChange={stats.users.growth}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard 
                        title="Total Products" 
                        value={stats.products.total} 
                        icon={<ProductsIcon />} 
                        color="success"
                        percentChange={stats.products.growth}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard 
                        title="Fulfillment Rate" 
                        value={stats.fulfillmentRate.value + '%'} 
                        icon={<FulfillmentIcon />} 
                        color="secondary"
                        percentChange={stats.fulfillmentRate.growth}
                    />
                </Grid>
            </Grid>
            
            {/* Revenue & User Growth Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Revenue Overview Chart */}
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
                        <Box sx={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={revenueData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey={
                                            timeRange === 'daily' ? 'day' : 
                                            timeRange === 'weekly' ? 'week' : 
                                            timeRange === 'yearly' ? 'year' : 'month'
                                        } 
                                    />
                                    <YAxis />
                                    <RechartsTooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke={colorValues.primary} 
                                        activeDot={{ r: 8 }}
                                        strokeWidth={2}
                                        name="Revenue"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
                
                {/* User Growth Chart */}
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
                        <Typography variant="h6" sx={{ mb: 2 }}>User Growth</Typography>
                        <Box sx={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={userGrowth}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Area 
                                        type="monotone" 
                                        dataKey="users" 
                                        stroke={colorValues.warning} 
                                        fill={`${colorValues.warning}50`}
                                        name="Total Users"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Top Products & Fulfillment Rate */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Top Products Table */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>Top Performing Products</Typography>
                        {/* Product table content remains the same */}
                        {/* ... existing code ... */}
                    </Paper>
                </Grid>
                
                {/* Order Fulfillment Chart - Now using our component */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            height: '100%',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>Order Fulfillment</Typography>
                        <OrderFulfillmentChart fulfillmentData={fulfillmentData} />
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Geographical Sales Analysis */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2
                        }}
                    >
                        <GeographicalChart geographicalData={geographicalData} />
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
                        <RecentOrdersList orders={recentOrders} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default AdminDashboard;
