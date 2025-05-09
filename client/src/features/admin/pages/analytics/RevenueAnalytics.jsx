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
import { ThemeContext } from '../../../../context/ThemeContext';
import { useApi } from '../../../../api/apiClient';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Area,
    AreaChart
} from 'recharts';
import StatCard from '../../components/charts/StatCard';
import { AttachMoney as RevenueIcon, TrendingUp as GrowthIcon } from '@mui/icons-material';

function RevenueAnalytics() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [timeRange, setTimeRange] = useState('monthly');
    
    const fetchAnalyticsData = useCallback(async () => {
        setLoading(true);
        try {
            // In a real app, we would fetch only the revenue data
            const response = await api.getDashboardData(timeRange);
            
            if (response && response.data) {
                setAnalyticsData({
                    stats: response.data.stats,
                    revenueCharts: response.data.revenueCharts,
                    revenueProjections: response.data.revenueProjections
                });
            }
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [api, timeRange]);
    
    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);
    
    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };
    
    if (loading || !analyticsData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    const { stats, revenueCharts, revenueProjections } = analyticsData;
    const revenueData = revenueCharts[timeRange] || revenueCharts.monthly;
    
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Revenue Analytics</Typography>
                
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
            
            {/* Revenue Overview Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Total Revenue" 
                        value={stats.revenue.total} 
                        icon={<RevenueIcon />} 
                        color="primary"
                        percentChange={stats.revenue.growth}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Average Order Value" 
                        value={`$${(stats.revenue.total / stats.orders.total).toFixed(2)}`} 
                        icon={<AttachMoney />} 
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Revenue Growth" 
                        value={`${stats.revenue.growth}%`} 
                        icon={<GrowthIcon />} 
                        color="success"
                    />
                </Grid>
            </Grid>
            
            {/* Detailed Revenue Charts */}
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
                        <Typography variant="h6" sx={{ mb: 2 }}>Revenue Trends</Typography>
                        <Box sx={{ height: 400 }}>
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
                                    {timeRange !== 'daily' && (
                                        <Line 
                                            type="monotone" 
                                            dataKey="transactions" 
                                            stroke={colorValues.secondary} 
                                            strokeWidth={2}
                                            name="Transactions"
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Revenue Projections */}
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
                        <Typography variant="h6" sx={{ mb: 2 }}>Revenue Projections</Typography>
                        <Box sx={{ height: 400 }}>
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
                                    <Area
                                        dataKey="upperBound"
                                        fill={`${colorValues.success}20`}
                                        stroke="none"
                                        name="Upper Bound"
                                    />
                                    <Area
                                        dataKey="lowerBound"
                                        fill={`${colorValues.error}20`}
                                        stroke="none"
                                        name="Lower Bound"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default RevenueAnalytics;
