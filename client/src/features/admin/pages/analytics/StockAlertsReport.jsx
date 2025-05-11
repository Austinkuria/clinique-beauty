import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Card, CardHeader, CardContent,
  Chip, Button, Alert, Select, MenuItem, FormControl, InputLabel,
  Divider
} from '@mui/material';
import { 
  Timeline, 
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon 
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { lowStockAlerts, inventoryTrends, stockMovements } from '../../../../data/mockInventoryData';

const StockAlertsReport = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('month');
  const [alertData, setAlertData] = useState([]);
  const [alertsByCategory, setAlertsByCategory] = useState([]);
  const [alertTrends, setAlertTrends] = useState([]);

  useEffect(() => {
    // Process data based on time range
    // This would normally fetch from an API with the timeRange parameter
    
    // Mock stats by product category
    setAlertsByCategory([
      { name: 'Skincare', value: 7 },
      { name: 'Makeup', value: 4 },
      { name: 'Fragrance', value: 2 },
      { name: 'Hair Care', value: 5 },
      { name: 'Body Care', value: 3 },
    ]);
    
    // Mock alert trends over time
    setAlertTrends([
      { name: 'Week 1', alerts: 3, resolved: 2 },
      { name: 'Week 2', alerts: 5, resolved: 4 },
      { name: 'Week 3', alerts: 8, resolved: 6 },
      { name: 'Week 4', alerts: 4, resolved: 5 },
    ]);
    
    setAlertData(lowStockAlerts);
  }, [timeRange]);

  // Calculate summary statistics
  const totalAlerts = alertData.length;
  const activeAlerts = alertData.filter(a => !a.resolved).length;
  const criticalItems = alertData.filter(a => a.status === 'critical' || a.status === 'outOfStock').length;
  const resolvedRate = totalAlerts ? Math.round((totalAlerts - activeAlerts) / totalAlerts * 100) : 0;

  // Colors for pie chart
  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.error.main, theme.palette.warning.main, theme.palette.info.main];

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Stock Alerts Analysis
        </Typography>
        <FormControl sx={{ width: 150 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Alerts
            </Typography>
            <Typography variant="h3" component="div" color="text.primary">
              {totalAlerts}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <Timeline sx={{ mr: 0.5, color: theme.palette.info.main }} />
              <Typography variant="body2" color="text.secondary">
                {timeRange === 'month' ? 'Last 30 days' : 'Selected period'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Active Alerts
            </Typography>
            <Typography variant="h3" component="div" sx={{ color: activeAlerts > 0 ? 'warning.main' : 'success.main' }}>
              {activeAlerts}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <WarningIcon sx={{ mr: 0.5, color: activeAlerts > 0 ? theme.palette.warning.main : theme.palette.success.main }} />
              <Typography variant="body2" color="text.secondary">
                {activeAlerts > 0 ? 'Require attention' : 'All resolved'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Critical Items
            </Typography>
            <Typography variant="h3" component="div" sx={{ color: criticalItems > 0 ? 'error.main' : 'success.main' }}>
              {criticalItems}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <InventoryIcon sx={{ mr: 0.5, color: criticalItems > 0 ? theme.palette.error.main : theme.palette.success.main }} />
              <Typography variant="body2" color="text.secondary">
                {criticalItems > 0 ? 'Needs immediate action' : 'No critical items'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Resolution Rate
            </Typography>
            <Typography variant="h3" component="div" color={resolvedRate > 80 ? 'success.main' : 'warning.main'}>
              {resolvedRate}%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              {resolvedRate > 80 ? (
                <TrendingUpIcon sx={{ mr: 0.5, color: theme.palette.success.main }} />
              ) : (
                <TrendingDownIcon sx={{ mr: 0.5, color: theme.palette.warning.main }} />
              )}
              <Typography variant="body2" color="text.secondary">
                Alert resolution efficiency
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Stock Alert Trends" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={alertTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="alerts" stroke={theme.palette.warning.main} name="New Alerts" />
                  <Line type="monotone" dataKey="resolved" stroke={theme.palette.success.main} name="Resolved Alerts" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Alerts by Category" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={alertsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {alertsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Alert Table */}
      <Card>
        <CardHeader 
          title="Recent Stock Alerts" 
          action={
            <Button 
              variant="outlined" 
              size="small"
            >
              Export Report
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Threshold</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Resolution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alertData.slice(0, 10).map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.productName}</TableCell>
                    <TableCell align="right">{alert.currentStock}</TableCell>
                    <TableCell align="right">{alert.threshold}</TableCell>
                    <TableCell>
                      <Chip 
                        label={alert.status === 'outOfStock' ? 'Out of Stock' : 
                              alert.status === 'critical' ? 'Critical' : 'Low'}
                        color={alert.status === 'outOfStock' || alert.status === 'critical' ? 
                              'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{alert.createdAt}</TableCell>
                    <TableCell>
                      {alert.resolved ? (
                        <Chip label="Resolved" color="success" size="small" />
                      ) : (
                        <Chip label="Pending" color="default" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StockAlertsReport;
