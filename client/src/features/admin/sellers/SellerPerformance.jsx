import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Grid, Paper, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, FormControl, 
  Select, MenuItem, Button, Tabs, Tab, LinearProgress, Card, CardContent,
  CardHeader, Divider
} from '@mui/material';
import { FaStar, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

const SellerPerformance = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Mock data - in a real app, fetch from API
    const mockSellers = [
      { 
        id: 1, 
        name: 'Beauty Essentials Co', 
        rating: 4.7, 
        totalSales: 45800, 
        ordersCompleted: 342, 
        returnRate: 2.1,
        responseTime: 1.3,
        reviewCount: 189,
        trend: 'up'
      },
      { 
        id: 2, 
        name: 'Luxury Cosmetics', 
        rating: 4.2, 
        totalSales: 32400, 
        ordersCompleted: 215, 
        returnRate: 3.4,
        responseTime: 2.1,
        reviewCount: 142,
        trend: 'stable'
      },
      { 
        id: 3, 
        name: 'Natural Beauty Products', 
        rating: 4.9, 
        totalSales: 52300, 
        ordersCompleted: 428, 
        returnRate: 1.2,
        responseTime: 0.8,
        reviewCount: 257,
        trend: 'up'
      },
      { 
        id: 4, 
        name: 'Skincare Specialists', 
        rating: 3.8, 
        totalSales: 18700, 
        ordersCompleted: 145, 
        returnRate: 5.3,
        responseTime: 3.2,
        reviewCount: 87,
        trend: 'down'
      },
    ];

    setTimeout(() => {
      setSellers(mockSellers);
      setLoading(false);
    }, 500);
  }, []);

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} color={i <= rating ? '#ffc107' : '#e4e5e9'} style={{ marginRight: 2 }} />
      );
    }
    return stars;
  };

  const getTrendChip = (trend) => {
    switch(trend) {
      case 'up':
        return <Chip label="Improving" color="success" size="small" />;
      case 'down':
        return <Chip label="Declining" color="error" size="small" />;
      default:
        return <Chip label="Stable" color="default" size="small" />;
    }
  };

  const handleSellerSelect = (seller) => {
    setSelectedSeller(seller);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Seller Performance Metrics</Typography>
      
      <Paper sx={{ mb: 4, p: 0 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Performance Overview</Typography>
          <FormControl sx={{ width: 200 }}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              size="small"
            >
              <MenuItem value="week">Last 7 days</MenuItem>
              <MenuItem value="month">Last 30 days</MenuItem>
              <MenuItem value="quarter">Last 90 days</MenuItem>
              <MenuItem value="year">Last 12 months</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Typography>Loading seller data...</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Seller Name</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Sales</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Return Rate</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Trend</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sellers.map(seller => (
                  <TableRow key={seller.id}>
                    <TableCell>{seller.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {renderRatingStars(seller.rating)}
                        <Box sx={{ ml: 1 }}>({seller.rating})</Box>
                      </Box>
                    </TableCell>
                    <TableCell>${seller.totalSales.toLocaleString()}</TableCell>
                    <TableCell>{seller.ordersCompleted}</TableCell>
                    <TableCell>{seller.returnRate}%</TableCell>
                    <TableCell>{seller.responseTime} hrs</TableCell>
                    <TableCell>{getTrendChip(seller.trend)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleSellerSelect(seller)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {selectedSeller && (
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Detailed Performance: {selectedSeller.name}</Typography>
          </Box>
          <Divider />
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Key Metrics" />
                <Tab label="Customer Reviews" />
                <Tab label="Top Products" />
                <Tab label="Issues" />
              </Tabs>
            </Box>
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5">${selectedSeller.totalSales.toLocaleString()}</Typography>
                        <Typography color="textSecondary">Total Sales</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5">{selectedSeller.reviewCount}</Typography>
                        <Typography color="textSecondary">Reviews</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5">{selectedSeller.returnRate}%</Typography>
                        <Typography color="textSecondary">Return Rate</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5">{selectedSeller.responseTime} hrs</Typography>
                        <Typography color="textSecondary">Response Time</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 3 }}>
                      <Typography>Performance chart would be displayed here...</Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
              {tabValue === 1 && (
                <Typography>Customer reviews would be displayed here...</Typography>
              )}
              {tabValue === 2 && (
                <Typography>Top selling products would be displayed here...</Typography>
              )}
              {tabValue === 3 && (
                <Typography>Any reported issues would be displayed here...</Typography>
              )}
            </Box>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default SellerPerformance;
