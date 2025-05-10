import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Chip,
    CircularProgress,
    Paper,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import {
    Login as LoginIcon,
    ShoppingCart as CartIcon,
    Visibility as ViewIcon,
    CreditCard as PaymentIcon,
    Settings as SettingsIcon,
    Favorite as WishlistIcon,
    Star as ReviewIcon,
    Email as EmailIcon,
    Event as EventIcon
} from '@mui/icons-material';
import { useApi } from '../../../../api/apiClient';
import { formatDistanceToNow } from 'date-fns';
// Import the mock data generator from the new file
import { generateMockActivityData } from '../../../../data/mockActivityData';

const UserActivityLog = ({ open, onClose, userId, userName }) => {
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [activityFilter, setActivityFilter] = useState('all');
    
    useEffect(() => {
        if (!open || !userId) return;
        
        const fetchUserActivity = async () => {
            setLoading(true);
            try {
                // In a real app, fetch from API
                // const data = await api.getUserActivity(userId);
                
                // For now, use mock data
                const mockData = generateMockActivityData(userId);
                
                setTimeout(() => {
                    setActivities(mockData);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Error fetching user activity:', error);
                setLoading(false);
            }
        };
        
        fetchUserActivity();
    }, [open, userId, api]);
    
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    const handleFilterChange = (event) => {
        setActivityFilter(event.target.value);
    };
    
    const filteredActivities = activities.filter(activity => {
        if (activityFilter === 'all') return true;
        return activity.type === activityFilter;
    });
    
    // Get activity icon by type
    const getActivityIcon = (type) => {
        switch (type) {
            case 'login': return <LoginIcon color="primary" />;
            case 'product_view': return <ViewIcon color="info" />;
            case 'cart_add': return <CartIcon color="secondary" />;
            case 'purchase': return <PaymentIcon color="success" />;
            case 'profile_update': return <SettingsIcon color="warning" />;
            case 'wishlist_add': return <WishlistIcon color="error" />;
            case 'review': return <ReviewIcon color="info" />;
            case 'email_open': return <EmailIcon color="primary" />;
            default: return <EventIcon />;
        }
    };
    
    // Get a human-readable activity description
    const getActivityDescription = (activity) => {
        const { type, details } = activity;
        
        switch (type) {
            case 'login':
                return `Logged in using ${details.device}`;
            case 'product_view':
                return `Viewed product: ${details.productName}`;
            case 'cart_add':
                return `Added ${details.productName} to cart`;
            case 'purchase':
                return `Made a purchase of $${details.total} (Order ${details.orderId})`;
            case 'profile_update':
                return `Updated profile information: ${details.fields.join(', ')}`;
            case 'wishlist_add':
                return `Added ${details.productName} to wishlist`;
            case 'review':
                return `Reviewed ${details.productName} with ${details.rating} stars`;
            case 'email_open':
                return `Opened email: ${details.subject}`;
            default:
                return 'Performed an action';
        }
    };
    
    // Get activity chip based on type
    const getActivityChip = (type) => {
        const typeLabels = {
            'login': 'Login',
            'product_view': 'Viewed Product',
            'cart_add': 'Added to Cart',
            'purchase': 'Purchase',
            'profile_update': 'Profile Update',
            'wishlist_add': 'Wishlist',
            'review': 'Review',
            'email_open': 'Email Opened'
        };
        
        const typeColors = {
            'login': 'primary',
            'product_view': 'info',
            'cart_add': 'secondary',
            'purchase': 'success',
            'profile_update': 'warning',
            'wishlist_add': 'error',
            'review': 'info',
            'email_open': 'primary'
        };
        
        return (
            <Chip 
                label={typeLabels[type] || type} 
                size="small" 
                color={typeColors[type] || 'default'} 
            />
        );
    };
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Activity Log - {userName || `User ${userId}`}
            </DialogTitle>
            <DialogContent dividers>
                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        <Tab label="All Activity" />
                        <Tab label="Purchases" />
                        <Tab label="Logins" />
                        <Tab label="Browsing" />
                    </Tabs>
                </Paper>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="activity-filter-label">Filter by Activity Type</InputLabel>
                            <Select
                                labelId="activity-filter-label"
                                value={activityFilter}
                                onChange={handleFilterChange}
                                label="Filter by Activity Type"
                            >
                                <MenuItem value="all">All Activities</MenuItem>
                                <MenuItem value="login">Logins</MenuItem>
                                <MenuItem value="product_view">Product Views</MenuItem>
                                <MenuItem value="cart_add">Cart Additions</MenuItem>
                                <MenuItem value="purchase">Purchases</MenuItem>
                                <MenuItem value="profile_update">Profile Updates</MenuItem>
                                <MenuItem value="wishlist_add">Wishlist Actions</MenuItem>
                                <MenuItem value="review">Reviews</MenuItem>
                                <MenuItem value="email_open">Email Opens</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List sx={{ 
                        width: '100%', 
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: 400
                    }}>
                        {filteredActivities.length === 0 ? (
                            <ListItem>
                                <ListItemText 
                                    primary="No activities found"
                                    secondary="There are no activities matching the selected filter"
                                />
                            </ListItem>
                        ) : (
                            filteredActivities.map((activity, index) => (
                                <React.Fragment key={activity.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemIcon>
                                            {getActivityIcon(activity.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle2">
                                                        {getActivityDescription(activity)}
                                                    </Typography>
                                                    <Box>
                                                        {getActivityChip(activity.type)}
                                                    </Box>
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                                    </Typography>
                                                    {activity.type === 'login' && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            IP: {activity.details.ipAddress}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < filteredActivities.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))
                        )}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button color="primary" onClick={() => {}}>Export Activity</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserActivityLog;
