import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    CircularProgress
} from '@mui/material';
import {
    People as UsersIcon,
    TrendingUp as GrowthIcon,
    Person as CustomerIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../../context/ThemeContext';
import { useApi } from '../../../../api/apiClient';
import { formatCurrency } from '../../../../utils/helpers';
import StatCard from '../../components/charts/StatCard';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar
} from 'recharts';

function CustomerAnalytics() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    
    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getDashboardData();
            
            if (response && response.data) {
                setUserData({
                    stats: response.data.stats,
                    userGrowth: response.data.userGrowth
                });
            }
        } catch (error) {
            console.error('Error fetching customer analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [api]);
    
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);
    
    if (loading || !userData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    const { stats, userGrowth } = userData;
    
    // Prepare acquisition channel data
    const acquisitionData = userGrowth.map(month => ({
        month: month.month,
        Organic: month.organic,
        Paid: month.paid
    }));
    
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Customer Analytics</Typography>
            
            {/* User Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Total Users" 
                        value={stats.users.total} 
                        icon={<UsersIcon />} 
                        color="primary"
                        percentChange={stats.users.growth}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Average Order Value" 
                        value={formatCurrency(stats.revenue.total / stats.orders.total)} 
                        icon={<CustomerIcon />} 
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="User Growth Rate" 
                        value={`${stats.users.growth}%`} 
                        icon={<GrowthIcon />} 
                        color="success"
                    />
                </Grid>
            </Grid>
            
            {/* User Growth Chart */}
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
                        <Typography variant="h6" sx={{ mb: 2 }}>User Growth</Typography>
                        <Box sx={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={userGrowth}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Area 
                                        type="monotone" 
                                        dataKey="users" 
                                        stroke={colorValues.primary} 
                                        fill={`${colorValues.primary}30`}
                                        name="Total Users"
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="newUsers" 
                                        stroke={colorValues.secondary} 
                                        fill={`${colorValues.secondary}30`}
                                        name="New Users"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* User Acquisition Channels */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    p: 3,
                    bgcolor: colorValues.bgPaper,
                    borderRadius: 2
                }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>User Acquisition Channels</Typography>
                <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={acquisitionData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="Organic" fill={colorValues.success} />
                            <Bar dataKey="Paid" fill={colorValues.info} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        </Box>
    );
}

export default CustomerAnalytics;
