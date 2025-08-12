import React, { useContext } from 'react';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Divider,
    Box,
    Chip
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { ThemeContext } from '../../../../context/ThemeContext';
import { formatCurrency } from '../../../../utils/helpers';

const RecentOrdersList = ({ orders, maxItems = 8 }) => {
    const { colorValues } = useContext(ThemeContext);
    const displayOrders = orders.slice(0, maxItems);
    
    return (
        <List>
            {displayOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                    <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: colorValues.primary }}>{order.customer.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {order.id} - {formatCurrency(order.total)}
                                </Typography>
                            }
                            secondary={
                                <>
                                    <Typography component="span" variant="body2" color="textPrimary">
                                        {order.customer}
                                    </Typography>
                                    {` — ${order.date} • `}
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{
                                            color: 
                                                order.status === 'Completed' || order.status === 'Delivered' ? 'success.main' :
                                                order.status === 'Processing' ? 'info.main' : 
                                                order.status === 'Shipped' ? 'primary.main' :
                                                'warning.main'
                                        }}
                                    >
                                        {order.status}
                                    </Typography>
                                    {order.location && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5, fontSize: '0.875rem' }}/>
                                            <Typography variant="caption" color="text.secondary">
                                                {order.location}
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            }
                        />
                    </ListItem>
                    {index < displayOrders.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
            ))}
        </List>
    );
};

export default RecentOrdersList;
