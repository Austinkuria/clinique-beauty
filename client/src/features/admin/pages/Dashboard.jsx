import React, { useState, useEffect, useContext, useCallback } from 'react';
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
    ListItemAvatar,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    FormControl,
    Select,
    MenuItem,
    InputLabel
} from '@mui/material';
import {
    AttachMoney as RevenueIcon,
    ShoppingCart as OrdersIcon,
    People as UsersIcon,
    Inventory as ProductsIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Public as GlobeIcon,
    LocalShipping as ShippingIcon,
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
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
    ComposedChart
} from 'recharts';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function AdminDashboard() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [timeRange, setTimeRange] = useState('monthly');
    const [geographyTab, setGeographyTab] = useState(0);
    
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
    
    const handleGeographyTabChange = (event, newValue) => {
        setGeographyTab(newValue);
    };
    
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
                        {title.includes('Revenue') ? `$${value.toLocaleString()}` : value.toLocaleString()}
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
            
            {/* Revenue Projections & Category Performance */}
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
                        <Typography variant="h6" sx={{ mb: 2 }}>Revenue Projections</Typography>
                        <Box sx={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={revenueProjections}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <RechartsTooltip formatter={(value) => [`$${value}`, value === null ? 'No Data Yet' : 'Revenue']} />
                                    <Legend />
                                    <Bar 
                                        dataKey="actual" 
                                        fill={colorValues.primary} 
                                        name="Actual Revenue" 
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="projected" 
                                        stroke="#ff7300" 
                                        strokeDasharray="5 5"
                                        name="Projected Revenue"
                                    />
                                </ComposedChart>
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
                        <Typography variant="h6" sx={{ mb: 2 }}>Category Performance</Typography>
                        <Box sx={{ height: 320, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ height: '70%', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value, name) => [`$${value}`, name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Category Growth</Typography>
                                {categoryData.map((category, index) => (
                                    <Box key={category.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                bgcolor: COLORS[index % COLORS.length],
                                                mr: 1
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                            {category.name}:
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color={category.growth > 0 ? 'success.main' : 'error.main'}
                                        >
                                            {category.growth > 0 ? '+' : ''}{category.growth}%
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Top Products & Fulfillment Rate */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
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
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="right">Sales</TableCell>
                                        <TableCell align="right">Revenue</TableCell>
                                        <TableCell align="right">Growth</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topProducts.map((product) => (
                                        <TableRow key={product.id} hover>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell align="right">{product.sales}</TableCell>
                                            <TableCell align="right">${product.revenue.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                    {product.growth > 0 ? (
                                                        <TrendingUpIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                                                    ) : (
                                                        <TrendingDownIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                                                    )}
                                                    <Typography 
                                                        variant="body2" 
                                                        color={product.growth > 0 ? 'success.main' : 'error.main'}
                                                    >
                                                        {product.growth > 0 ? '+' : ''}{product.growth}%
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                
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
                        <Box sx={{ height: 280, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ height: '70%', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={fulfillmentData.rates}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis domain={[85, 100]} />
                                        <RechartsTooltip formatter={(value) => [`${value}%`, 'Fulfillment Rate']} />
                                        <Line 
                                            type="monotone" 
                                            dataKey="rate" 
                                            stroke={colorValues.secondary} 
                                            strokeWidth={2}
                                            name="Fulfillment Rate"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                {fulfillmentData.statuses.map((status) => (
                                    <Box key={status.status} sx={{ textAlign: 'center' }}>
                                        <Chip 
                                            label={status.status} 
                                            size="small"
                                            sx={{
                                                bgcolor: 
                                                    status.status === 'Delivered' ? 'success.main' :
                                                    status.status === 'Shipped' ? 'info.main' :
                                                    status.status === 'Processing' ? 'warning.main' :
                                                    'error.main',
                                                color: 'white',
                                                mb: 1
                                            }}
                                        />
                                        <Typography variant="body2">{status.count} orders</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {status.percentage}%
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <GlobeIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Geographical Sales Analysis</Typography>
                        </Box>
                        
                        <Tabs
                            value={geographyTab}
                            onChange={handleGeographyTabChange}
                            sx={{ mb: 2 }}
                        >
                            <Tab label="Top Countries" />
                            <Tab label="Sales Volume" />
                            <Tab label="Revenue" />
                        </Tabs>
                        
                        <Box sx={{ height: 350 }}>
                            {geographyTab === 0 && (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Country</TableCell>
                                                <TableCell align="right">Sales Volume</TableCell>
                                                <TableCell align="right">Revenue</TableCell>
                                                <TableCell align="right">Avg. Order Value</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {geographicalData.map((country) => (
                                                <TableRow key={country.country} hover>
                                                    <TableCell>{country.country}</TableCell>
                                                    <TableCell align="right">{country.sales}</TableCell>
                                                    <TableCell align="right">${country.revenue.toLocaleString()}</TableCell>
                                                    <TableCell align="right">
                                                        ${(country.revenue / country.sales).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                            
                            {geographyTab === 1 && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={geographicalData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        layout="vertical"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="country" type="category" width={100} />
                                        <RechartsTooltip />
                                        <Legend />
                                        <Bar dataKey="sales" fill={colorValues.info} name="Sales Volume" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                            
                            {geographyTab === 2 && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={geographicalData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        layout="vertical"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="country" type="category" width={100} />
                                        <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                                        <Legend />
                                        <Bar dataKey="revenue" fill={colorValues.primary} name="Revenue" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
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
                            {recentOrders.map((order, index) => (
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
                                    {index < recentOrders.length - 1 && <Divider variant="inset" component="li" />}
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
