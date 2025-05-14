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
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Card,
    CardContent
} from '@mui/material';
import {
    AttachMoney,
    AttachMoney as RevenueIcon,
    ShoppingCart as OrdersIcon,
    People as UsersIcon,
    Inventory as ProductsIcon,
    Assignment as FulfillmentIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Store as SellersIcon,
    Calculate as CalculateIcon,
    Campaign as CampaignIcon,
    LocalOffer as LocalOfferIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
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
import TopProductsTable from '../components/charts/TopProductsTable';

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

    // Add navigation links or cards for marketing section
    const marketingLinks = [
        {
            title: "Marketing Dashboard",
            description: "Overview of all marketing activities",
            path: "/admin/marketing",
            icon: <CampaignIcon /> // Replace with actual icon component
        },
        {
            title: "Campaigns",
            description: "Manage marketing campaigns",
            path: "/admin/marketing/campaigns",
            icon: <CampaignIcon /> // Replace with actual icon component
        },
        {
            title: "Discount Codes",
            description: "Manage promotional discounts",
            path: "/admin/marketing/discounts",
            icon: <LocalOfferIcon /> // Replace with actual icon component
        }
    ];
    
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
                {/* New Seller Management Card */}
                <Grid item xs={12} sm={6} md={2.4}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 2,
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            minHeight: '140px',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                            }
                        }}
                        component={RouterLink}
                        to="/admin/sellers"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Box sx={{ p: 1, borderRadius: '50%', bgcolor: `${colorValues.info}20`, mb: 1 }}>
                            <SellersIcon sx={{ color: colorValues.info, fontSize: 40 }} />
                        </Box>
                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                            Seller Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                            Manage your marketplace sellers
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Revenue & User Growth Charts */}
            <Grid 
                container 
                spacing={3} 
                sx={{ 
                    mb: 4,
                    alignItems: 'stretch'  // Ensure equal height
                }}
            >
                {/* Revenue Overview Chart */}
                <Grid 
                    item 
                    xs={12} 
                    sm={12} 
                    md={7} 
                    lg={8} 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        width: '100%' // Ensure full width of grid cell
                    }}
                >
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            width: '100%', // Ensure paper takes full width
                            height: '100%',
                            minHeight: '500px',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2,
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 3 }}>Revenue Overview</Typography>
                        
                        {/* Use flex-grow to fill available space */}
                        <Box 
                            sx={{ 
                                flexGrow: 1,
                                width: '100%', // Ensure box takes full width
                                minHeight: '400px',
                                position: 'relative'
                            }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={revenueData}
                                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <XAxis 
                                        dataKey={
                                            timeRange === 'daily' ? 'day' : 
                                            timeRange === 'weekly' ? 'week' : 
                                            timeRange === 'yearly' ? 'year' : 'month'
                                        }
                                        tick={{ fill: colorValues.text }}
                                        height={50}
                                        tickMargin={10}
                                    />
                                    <YAxis 
                                        tick={{ fill: colorValues.text }} 
                                        width={45}
                                        tickFormatter={(value) => `$${value/1000}k`}
                                        domain={['auto', 'auto']}
                                        tickMargin={5}
                                    />
                                    <RechartsTooltip 
                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                                        contentStyle={{
                                            backgroundColor: colorValues.bgPaper,
                                            borderColor: colorValues.border,
                                            borderRadius: '8px',
                                            color: colorValues.text
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke={colorValues.primary} 
                                        activeDot={{ r: 8, fill: colorValues.primary, stroke: colorValues.bgPaper }}
                                        strokeWidth={3}
                                        name="Revenue"
                                        dot={{ stroke: colorValues.primary, strokeWidth: 2, r: 5, fill: colorValues.bgPaper }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
                
                {/* User Growth Chart */}
                <Grid 
                    item 
                    xs={12} 
                    sm={12} 
                    md={5} 
                    lg={4} 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        width: '100%' // Ensure full width of grid cell
                    }}
                >
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 3,
                            width: '100%', // Ensure paper takes full width
                            height: '100%',
                            minHeight: '500px',
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2,
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 3 }}>User Growth</Typography>
                        
                        {/* Use flex-grow to fill available space */}
                        <Box 
                            sx={{ 
                                flexGrow: 1,
                                width: '100%', // Ensure box takes full width
                                minHeight: '400px',
                                position: 'relative'
                            }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={userGrowth}
                                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                                    <XAxis 
                                        dataKey="month" 
                                        tick={{ fill: colorValues.text }}
                                        height={50}
                                        tickMargin={10}
                                    />
                                    <YAxis 
                                        tick={{ fill: colorValues.text }}
                                        width={40}
                                        tickMargin={5}
                                    />
                                    <RechartsTooltip 
                                        formatter={(value) => [value.toLocaleString(), 'Users']}
                                        contentStyle={{
                                            backgroundColor: colorValues.bgPaper,
                                            borderColor: colorValues.border,
                                            borderRadius: '8px',
                                            color: colorValues.text
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="users" 
                                        stroke={colorValues.warning} 
                                        strokeWidth={3}
                                        fill={`${colorValues.warning}50`}
                                        name="Total Users"
                                        activeDot={{ r: 8, fill: colorValues.warning, stroke: colorValues.bgPaper }}
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
                        <TopProductsTable products={topProducts} />
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
            <Grid container spacing={3} sx={{ mb: 6 }}>
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
            
            {/* Seller Management Quick Access */}
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
                        <Typography variant="h6" sx={{ mb: 3 }}>Seller Management</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    component={RouterLink} 
                                    to="/admin/sellers" 
                                    variant="contained" 
                                    color="primary"
                                    startIcon={<SellersIcon />}
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                >
                                    Seller Management
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    component={RouterLink} 
                                    to="/admin/seller-performance" 
                                    variant="contained" 
                                    color="info"
                                    startIcon={<TrendingUpIcon />}
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                >
                                    Performance Metrics
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    component={RouterLink} 
                                    to="/admin/payouts" 
                                    variant="contained" 
                                    color="success"
                                    startIcon={<AttachMoney />}
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                >
                                    Payout Processing
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    component={RouterLink} 
                                    to="/admin/commissions" 
                                    variant="contained" 
                                    color="secondary"
                                    startIcon={<CalculateIcon />}
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                >
                                    Commission Structure
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Recent Orders */}
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
                        <Typography variant="h6" sx={{ mb: 2 }}>Recent Orders</Typography>
                        <RecentOrdersList orders={recentOrders} />
                    </Paper>
                </Grid>
            </Grid>

            {/* Quick Access Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* ...existing grid items... */}
                <Grid item xs={12} sm={6} md={2.4}>
                    <Paper
                        elevation={theme === 'dark' ? 3 : 1}
                        sx={{
                            p: 2,
                            bgcolor: colorValues.bgPaper,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            minHeight: '140px',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                            }
                        }}
                        component={RouterLink}
                        to="/admin/marketing"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Box sx={{ p: 1, borderRadius: '50%', bgcolor: `${colorValues.primary}20`, mb: 1 }}>
                            <CampaignIcon sx={{ color: colorValues.primary, fontSize: 40 }} />
                        </Box>
                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                            Marketing
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                            Campaigns & Promotions
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Additional links section */}
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
                        <Typography variant="h6" sx={{ mb: 3 }}>Marketing & Promotions</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    component={RouterLink} 
                                    to="/admin/marketing" 
                                    variant="contained" 
                                    color="primary"
                                    startIcon={<CampaignIcon />}
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                >
                                    Marketing Dashboard
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    component={RouterLink} 
                                    to="/admin/marketing/campaigns" 
                                    variant="contained" 
                                    color="info"
                                    startIcon={<CampaignIcon />}
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                >
                                    Campaigns
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    component={RouterLink} 
                                    to="/admin/marketing/discounts" 
                                    variant="contained" 
                                    color="secondary"
                                    startIcon={<LocalOfferIcon />}
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                >
                                    Discount Codes
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button 
                                    component={RouterLink} 
                                    to="/admin/users" 
                                    variant="contained" 
                                    color="success"
                                    startIcon={<GroupIcon />}
                                    fullWidth
                                    sx={{ py: 1.5 }}
                                >
                                    User Segmentation
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Marketing Management */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Marketing Management
                </Typography>
                <Grid container spacing={3}>
                    {marketingLinks.map((link) => (
                        <Grid item xs={12} sm={6} md={4} key={link.path}>
                            <Card 
                                component={RouterLink} 
                                to={link.path}
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: (theme) => theme.shadows[10],
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', mb: 2 }}>
                                        {link.icon}
                                    </Box>
                                    <Typography variant="h6" component="h3">
                                        {link.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {link.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}

export default AdminDashboard;
