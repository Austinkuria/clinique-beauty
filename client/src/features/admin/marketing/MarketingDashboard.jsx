import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Button
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  LocalOffer as DiscountIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { marketingApi } from '../../../data/marketingApi';

// Import Recharts components for visualizations
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const MarketingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await marketingApi.getMarketingAnalytics(timeRange);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching marketing analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  if (loading || !analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare pie chart data for campaign statuses
  const campaignStatusData = [
    { name: 'Active', value: analytics.campaigns.active },
    { name: 'Scheduled', value: analytics.campaigns.scheduled },
    { name: 'Ended', value: analytics.campaigns.ended }
  ];

  // Prepare pie chart data for discount code statuses
  const discountStatusData = [
    { name: 'Active', value: analytics.discountCodes.active },
    { name: 'Scheduled', value: analytics.discountCodes.scheduled },
    { name: 'Expired', value: analytics.discountCodes.expired }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Marketing Dashboard</Typography>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="time-range-select-label">Time Range</InputLabel>
          <Select
            labelId="time-range-select-label"
            id="time-range-select"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="week">Weekly</MenuItem>
            <MenuItem value="month">Monthly</MenuItem>
            <MenuItem value="quarter">Quarterly</MenuItem>
            <MenuItem value="year">Yearly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Quick Links */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Button
            component={RouterLink}
            to="/admin/marketing/campaigns"
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<CampaignIcon />}
            sx={{ py: 2 }}
          >
            Manage Marketing Campaigns
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            component={RouterLink}
            to="/admin/marketing/discounts"
            variant="contained"
            color="secondary"
            fullWidth
            startIcon={<DiscountIcon />}
            sx={{ py: 2 }}
          >
            Manage Discount Codes
          </Button>
        </Grid>
      </Grid>

      {/* Overview Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CampaignIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
              <Typography variant="h6">Campaigns Overview</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Active Campaigns</Typography>
                  <Typography variant="h4">{analytics.campaigns.active}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Conversions</Typography>
                  <Typography variant="h4">{analytics.campaigns.totalConversions.toLocaleString()}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Revenue</Typography>
                  <Typography variant="h4">${analytics.campaigns.totalRevenue.toLocaleString()}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Conversion Rate</Typography>
                  <Typography variant="h4">{analytics.campaigns.conversionRate}%</Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>Campaigns by Status</Typography>
            <Box sx={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campaignStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {campaignStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} campaigns`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DiscountIcon color="secondary" sx={{ fontSize: 28, mr: 1 }} />
              <Typography variant="h6">Discount Codes Overview</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Active Codes</Typography>
                  <Typography variant="h4">{analytics.discountCodes.active}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Usage</Typography>
                  <Typography variant="h4">{analytics.discountCodes.totalUsage.toLocaleString()}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Revenue Generated</Typography>
                  <Typography variant="h4">${analytics.discountCodes.revenueGenerated.toLocaleString()}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Average Discount</Typography>
                  <Typography variant="h4">{analytics.discountCodes.averageDiscount}%</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>Discount Codes by Status</Typography>
            <Box sx={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={discountStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {discountStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} codes`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Performance Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Marketing Performance Trend</Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analytics.monthly}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                name="Revenue ($)" 
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="conversions" 
                name="Conversions" 
                stroke="#82ca9d" 
                strokeWidth={2}
                dot={{ stroke: '#82ca9d', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Best Performing Campaigns & Codes */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Top Performing Campaign</Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              {analytics.campaigns.topPerforming}
            </Typography>
            <Typography variant="body2" paragraph>
              This campaign has generated the highest revenue and conversion rate during the selected period.
            </Typography>
            <Button 
              component={RouterLink}
              to="/admin/marketing/campaigns"
              variant="outlined" 
              size="small"
            >
              View All Campaigns
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Most Used Discount Code</Typography>
            <Typography variant="subtitle1" color="secondary" gutterBottom>
              {analytics.discountCodes.mostUsed}
            </Typography>
            <Typography variant="body2" paragraph>
              This discount code has been used the most times during the selected period.
            </Typography>
            <Button 
              component={RouterLink}
              to="/admin/marketing/discounts"
              variant="outlined" 
              size="small"
            >
              View All Discount Codes
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketingDashboard;
