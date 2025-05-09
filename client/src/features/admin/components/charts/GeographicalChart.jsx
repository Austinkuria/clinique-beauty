import React, { useState, useContext } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { Public as GlobeIcon } from '@mui/icons-material';
import { ThemeContext } from '../../../../context/ThemeContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const GeographicalChart = ({ geographicalData }) => {
    const { colorValues } = useContext(ThemeContext);
    const [geographyTab, setGeographyTab] = useState(0);
    
    const handleGeographyTabChange = (event, newValue) => {
        setGeographyTab(newValue);
    };
    
    return (
        <Box>
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
        </Box>
    );
};

export default GeographicalChart;
