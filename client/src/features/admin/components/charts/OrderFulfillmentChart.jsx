import React, { useContext } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { ThemeContext } from '../../../../context/ThemeContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer
} from 'recharts';

const OrderFulfillmentChart = ({ fulfillmentData }) => {
    const { colorValues } = useContext(ThemeContext);
    
    return (
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
    );
};

export default OrderFulfillmentChart;
