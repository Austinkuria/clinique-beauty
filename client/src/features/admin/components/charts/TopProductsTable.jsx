import React, { useContext } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../../context/ThemeContext';

const TopProductsTable = ({ products, maxItems = 5 }) => {
    const { colorValues } = useContext(ThemeContext);
    
    // Display only a limited number of products
    const displayProducts = products.slice(0, maxItems);
    
    return (
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
                    {displayProducts.map((product) => (
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
    );
};

export default TopProductsTable;
