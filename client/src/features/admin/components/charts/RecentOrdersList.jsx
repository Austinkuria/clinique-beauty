import React, { useContext } from 'react';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Divider
} from '@mui/material';
import { ThemeContext } from '../../../../context/ThemeContext';

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
                                    {order.id} - ${order.total}
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
                                                order.status === 'Completed' ? 'success.main' :
                                                order.status === 'Processing' ? 'info.main' : 
                                                'warning.main'
                                        }}
                                    >
                                        {order.status}
                                    </Typography>
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
