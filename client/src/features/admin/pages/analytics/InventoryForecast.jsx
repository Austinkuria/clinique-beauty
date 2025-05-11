import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Card, CardContent, CardHeader,
  FormControl, InputLabel, Select, MenuItem, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Divider, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Timeline, TrendingUp, TrendingDown, WarningAmber,
  Inventory as InventoryIcon, CalendarMonth, ShowChart
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { toast } from 'react-hot-toast';
import { stockMovements, inventoryTrends } from '../../../../data/mockInventoryData';

// Generate mock forecast data based on historical movements
const generateForecastData = (productId = null) => {
  // Current date for reference
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Filter movements for selected product if specified
  const relevantMovements = productId
    ? stockMovements.filter(m => m.productId === productId)
    : stockMovements;
  
  // Use inventory trends data to calculate more realistic forecasts
  const trendData = inventoryTrends.stockLevels;
  const trendLabels = inventoryTrends.labels;
  
  // Calculate trend direction and average change
  const trendDirection = trendData[trendData.length - 1] > trendData[trendData.length - 2] ? 'up' : 'down';
  
  // Calculate average month-over-month change (percentage)
  let totalChange = 0;
  for (let i = 1; i < trendData.length; i++) {
    totalChange += (trendData[i] - trendData[i-1]) / trendData[i-1];
  }
  const avgMonthlyChange = totalChange / (trendData.length - 1);
  
  // Calculate seasonality by comparing each month to the yearly average
  const yearlyAvg = trendData.reduce((sum, val) => sum + val, 0) / trendData.length;
  const seasonalityFactors = trendData.map(val => val / yearlyAvg);
  
  // Calculate past sales based on historical trends (using both stock movements and inventory trends)
  const pastSales = {
    '3months': Math.round(relevantMovements.filter(m => m.type === 'sale').slice(0, 3).reduce((sum, m) => sum + Math.abs(m.quantity), 0)),
    '6months': Math.round(relevantMovements.filter(m => m.type === 'sale').slice(0, 6).reduce((sum, m) => sum + Math.abs(m.quantity), 0)),
    '12months': Math.round(relevantMovements.filter(m => m.type === 'sale').reduce((sum, m) => sum + Math.abs(m.quantity), 0))
  };
  
  // If past sales data is too sparse, fill with reasonable estimates based on inventory trends
  if (pastSales['3months'] < 10) pastSales['3months'] = Math.floor(trendData[trendData.length - 1] * 0.15) + 20;
  if (pastSales['6months'] < 20) pastSales['6months'] = Math.floor(trendData[trendData.length - 1] * 0.3) + 50;
  if (pastSales['12months'] < 40) pastSales['12months'] = Math.floor(trendData[trendData.length - 1] * 0.6) + 100;
  
  // Generate 6 months of forecast
  const forecast = [];
  for (let i = 0; i < 6; i++) {
    const forecastMonth = (currentMonth + i) % 12;
    const forecastYear = currentYear + Math.floor((currentMonth + i) / 12);
    
    // Use seasonality from inventory trends
    const seasonalFactor = seasonalityFactors[forecastMonth];
    
    // Apply trend adjustment
    const trendAdjustment = Math.pow(1 + avgMonthlyChange, i);
    
    // Basic forecasting model incorporating trends and seasonality
    const baseForecast = Math.round((pastSales['3months'] / 3) * seasonalFactor * trendAdjustment);
    const optimisticForecast = Math.round(baseForecast * 1.15);
    const pessimisticForecast = Math.round(baseForecast * 0.85);
    
    // Add random variation (smaller and more realistic)
    const variance = Math.round(baseForecast * 0.05 * (Math.random() - 0.5));
    
    forecast.push({
      month: new Date(forecastYear, forecastMonth, 1).toLocaleString('default', { month: 'short', year: 'numeric' }),
      expected: baseForecast + variance,
      optimistic: optimisticForecast + variance,
      pessimistic: pessimisticForecast + variance,
      stockNeeded: Math.round((baseForecast + variance) * 1.2), // 20% buffer
      confidence: Math.round(85 - (i * 5)), // Confidence decreases over time
      trend: trendDirection
    });
  }
  
  return forecast;
};

// Mock product data for the forecasting tool
const mockProducts = [
  { id: 1, name: 'Moisturizing Cream', category: 'Skincare', stockLevel: 45, safetyStock: 20 },
  { id: 2, name: 'Anti-Aging Serum', category: 'Skincare', stockLevel: 32, safetyStock: 15 },
  { id: 3, name: 'Citrus Perfume', category: 'Fragrance', stockLevel: 12, safetyStock: 10 },
  { id: 4, name: 'Hair Repair Mask', category: 'Hair Care', stockLevel: 8, safetyStock: 12 },
  { id: 5, name: 'Shower Gel', category: 'Body Care', stockLevel: 36, safetyStock: 18 },
  { id: 6, name: 'Day Cream SPF 30', category: 'Skincare', stockLevel: 22, safetyStock: 15 },
];

const InventoryForecast = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('6months');
  const [forecastData, setForecastData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [productForecast, setProductForecast] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [historicalTrends, setHistoricalTrends] = useState([]);

  useEffect(() => {
    // Generate global forecast using inventory trends data
    setForecastData(generateForecastData());
    
    // Generate product-specific forecast if a product is selected
    if (selectedProduct !== 'all') {
      setProductForecast(generateForecastData(parseInt(selectedProduct)));
    } else {
      setProductForecast([]);
    }
    
    // Format historical data from inventoryTrends
    const historicalData = inventoryTrends.labels.map((month, index) => ({
      month,
      stockLevel: inventoryTrends.stockLevels[index],
      stockValue: inventoryTrends.stockValue[index],
      lowStockIncidents: inventoryTrends.lowStockIncidents[index]
    }));
    setHistoricalTrends(historicalData);
    
    // Top products by forecast demand (mock data with inventory trends influence)
    setTopProducts([
      { id: 1, name: 'Moisturizing Cream', forecast: 125, trend: 'up', stockLevel: 45 },
      { id: 3, name: 'Citrus Perfume', forecast: 87, trend: 'down', stockLevel: 12 },
      { id: 6, name: 'Day Cream SPF 30', forecast: 72, trend: 'up', stockLevel: 22 },
      { id: 2, name: 'Anti-Aging Serum', forecast: 68, trend: 'stable', stockLevel: 32 },
      { id: 4, name: 'Hair Repair Mask', forecast: 54, trend: 'up', stockLevel: 8 },
    ]);
    
    // Category breakdown using stock levels from inventory trends
    const totalStock = inventoryTrends.stockLevels[inventoryTrends.stockLevels.length - 1];
    setCategoryBreakdown([
      { name: 'Skincare', forecastSales: 265, currentStock: Math.round(totalStock * 0.4) },
      { name: 'Fragrance', forecastSales: 87, currentStock: Math.round(totalStock * 0.12) },
      { name: 'Hair Care', forecastSales: 54, currentStock: Math.round(totalStock * 0.08) },
      { name: 'Body Care', forecastSales: 45, currentStock: Math.round(totalStock * 0.25) },
      { name: 'Makeup', forecastSales: 43, currentStock: Math.round(totalStock * 0.15) },
    ]);
    
  }, [selectedProduct, timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
  };

  // Helper function to generate purchase orders based on forecast
  const generatePurchaseOrders = () => {
    const productsToOrder = mockProducts.filter(p => {
      const forecast = topProducts.find(tp => tp.id === p.id)?.forecast || 0;
      return p.stockLevel < (forecast * 0.5) || p.stockLevel < p.safetyStock;
    });
    
    toast.success(`Generated ${productsToOrder.length} purchase order suggestions`);
  };

  // Determine if stock level is sufficient based on forecast
  const getStockStatus = (stockLevel, forecast) => {
    const ratio = stockLevel / forecast;
    if (ratio < 0.5) return { label: 'Critical', color: 'error' };
    if (ratio < 1) return { label: 'Low', color: 'warning' };
    return { label: 'Adequate', color: 'success' };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Inventory Forecasting
        </Typography>
        <Box>
          <FormControl sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="product-select-label">Product</InputLabel>
            <Select
              labelId="product-select-label"
              value={selectedProduct}
              label="Product"
              onChange={handleProductChange}
            >
              <MenuItem value="all">All Products</MenuItem>
              {mockProducts.map(product => (
                <MenuItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="time-range-label">Forecast Period</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              label="Forecast Period"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="3months">3 Months</MenuItem>
              <MenuItem value="6months">6 Months</MenuItem>
              <MenuItem value="12months">12 Months</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Alert for product with low stock relative to forecast */}
      {selectedProduct !== 'all' && selectedProduct === '3' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Potential stock issue:</strong> Forecasted demand exceeds current stock level for this product.
          Consider placing a purchase order soon.
        </Alert>
      )}

      {/* Main forecast chart */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center">
              <ShowChart sx={{ mr: 1 }} />
              <Typography variant="h6">
                {selectedProduct === 'all' 
                  ? 'Demand Forecast (Next 6 Months)' 
                  : `${mockProducts.find(p => p.id === parseInt(selectedProduct))?.name} - Demand Forecast`}
              </Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              onClick={generatePurchaseOrders}
              startIcon={<InventoryIcon />}
            >
              Generate Purchase Orders
            </Button>
          }
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={selectedProduct === 'all' ? forecastData : productForecast}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="pessimistic" 
                stroke={theme.palette.warning.light} 
                strokeDasharray="5 5"
                name="Conservative Estimate" 
              />
              <Line 
                type="monotone" 
                dataKey="expected" 
                stroke={theme.palette.primary.main} 
                strokeWidth={2}
                name="Expected Demand" 
              />
              <Line 
                type="monotone" 
                dataKey="optimistic" 
                stroke={theme.palette.success.light} 
                strokeDasharray="5 5"
                name="Optimistic Estimate" 
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Confidence indicators */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {forecastData.map((month, index) => (
              <Tooltip 
                key={index}
                title={`${month.confidence}% confidence level for ${month.month}`}
              >
                <Chip 
                  label={`${month.month}: ${month.confidence}% confidence`}
                  color={month.confidence > 80 ? 'success' : month.confidence > 70 ? 'primary' : 'warning'}
                  sx={{ m: 0.5 }}
                  size="small"
                />
              </Tooltip>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Top Products by Forecast Demand and Current Stock Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Top Products by Forecasted Demand" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Forecasted Demand</TableCell>
                      <TableCell align="center">Trend</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((product) => {
                      const status = getStockStatus(product.stockLevel, product.forecast);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">{product.forecast} units</TableCell>
                          <TableCell align="center">
                            {product.trend === 'up' && <TrendingUp color="success" />}
                            {product.trend === 'down' && <TrendingDown color="error" />}
                            {product.trend === 'stable' && <Timeline color="primary" />}
                          </TableCell>
                          <TableCell align="right">{product.stockLevel} units</TableCell>
                          <TableCell>
                            <Chip 
                              label={status.label} 
                              color={status.color} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button 
                              size="small" 
                              variant={product.stockLevel < (product.forecast * 0.7) ? "contained" : "outlined"}
                              color={product.stockLevel < (product.forecast * 0.5) ? "error" : "primary"}
                            >
                              {product.stockLevel < (product.forecast * 0.5) ? "Order Now" : "Plan Order"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Category Stock vs. Forecast" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categoryBreakdown}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="forecastSales" name="Forecasted Demand" fill={theme.palette.primary.main} />
                  <Bar dataKey="currentStock" name="Current Stock" fill={theme.palette.secondary.main} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Historical Trends Section */}
      <Card sx={{ mb: 4, mt: 4 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center">
              <Timeline sx={{ mr: 1 }} />
              <Typography variant="h6">
                Historical Inventory Trends
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={historicalTrends}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="stockLevel" 
                stroke={theme.palette.primary.main} 
                name="Stock Level" 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="lowStockIncidents" 
                stroke={theme.palette.error.main} 
                name="Low Stock Incidents" 
              />
            </LineChart>
          </ResponsiveContainer>
          <Alert severity="info" sx={{ mt: 2 }}>
            This chart shows historical inventory levels and low stock incidents over the past year. 
            Our forecasting model uses this data to predict future demand patterns.
          </Alert>
        </CardContent>
      </Card>

      {/* Forecast Details */}
      <Card>
        <CardHeader title="Detailed Forecast Breakdown" />
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Expected Demand</TableCell>
                  <TableCell align="right">Conservative</TableCell>
                  <TableCell align="right">Optimistic</TableCell>
                  <TableCell align="right">Recommended Stock</TableCell>
                  <TableCell align="right">Confidence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecastData.map((month, index) => (
                  <TableRow key={index}>
                    <TableCell>{month.month}</TableCell>
                    <TableCell align="right">{month.expected} units</TableCell>
                    <TableCell align="right">{month.pessimistic} units</TableCell>
                    <TableCell align="right">{month.optimistic} units</TableCell>
                    <TableCell align="right">{month.stockNeeded} units</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={`${month.confidence}%`}
                        color={month.confidence > 80 ? 'success' : month.confidence > 70 ? 'primary' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Divider sx={{ my: 3 }} />
          
          <Alert severity="info">
            <Typography variant="subtitle2">About the Forecast Model</Typography>
            <Typography variant="body2">
              This forecast is based on historical sales data, seasonality patterns, and growth trends.
              Confidence levels decrease for months further in the future.
              For optimal inventory planning, focus on the next 3 months where confidence is highest.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryForecast;
