import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Inventory as ProductsIcon,
    Category as CategoryIcon,
    Assessment as SalesIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../../context/ThemeContext';
import { useApi } from '../../../../api/apiClient';
import { formatCurrency } from '../../../../utils/helpers';
import StatCard from '../../components/charts/StatCard';
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function ProductAnalytics() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [productData, setProductData] = useState(null);
    
    const fetchProductData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getDashboardData();
            
            if (response && response.data) {
                setProductData({
                    categoryData: response.data.categoryData,
                    topProducts: response.data.topProducts,
                    stats: response.data.stats
                });
            }
        } catch (error) {
            console.error('Error fetching product analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [api]);
    
    useEffect(() => {
        fetchProductData();
    }, [fetchProductData]);
    
    if (loading || !productData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    const { categoryData, topProducts, stats } = productData;
    
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Product Analytics</Typography>
            
            {/* Product Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Total Products" 
                        value={stats.products.total} 
                        icon={<ProductsIcon />} 
                        color="primary"
                        percentChange={stats.products.growth}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Top Category" 
                        value={categoryData[0].name} 
                        icon={<CategoryIcon />} 
                        color="success"
                        percentChange={categoryData[0].growth}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Best Selling Product" 
                        value={topProducts[0].name} 
                        icon={<SalesIcon />} 
                        color="info"
                        percentChange={topProducts[0].growth}
                    />
                </Grid>
            </Grid>
            
            {/* Category Analysis */}
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
                        <Typography variant="h6" sx={{ mb: 2 }}>Category Distribution</Typography>
                        <Box sx={{ height: 300, display: 'flex', flexDirection: 'column' }}>
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
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>
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
                        <Typography variant="h6" sx={{ mb: 2 }}>Category Growth & Margins</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="right">Growth</TableCell>
                                        <TableCell align="right">Margin</TableCell>
                                        <TableCell align="right">Revenue</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {categoryData.map((category) => (
                                        <TableRow key={category.name} hover>
                                            <TableCell>{category.name}</TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                    {category.growth > 0 ? (
                                                        <TrendingUpIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                                                    ) : (
                                                        <TrendingDownIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                                                    )}
                                                    <Typography 
                                                        variant="body2" 
                                                        color={category.growth > 0 ? 'success.main' : 'error.main'}
                                                    >
                                                        {category.growth > 0 ? '+' : ''}{category.growth}%
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{category.margin}%</TableCell>
                                            <TableCell align="right">${category.value.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Top Products */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    p: 3,
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
                                <TableCell align="right">Avg. Rating</TableCell>
                                <TableCell align="right">Stock</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topProducts.map((product) => (
                                <TableRow key={product.id} hover>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell align="right">{product.sales}</TableCell>
                                    <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
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
                                    <TableCell align="right">{product.avgRating}</TableCell>
                                    <TableCell align="right">{product.stock}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}

export default ProductAnalytics;
