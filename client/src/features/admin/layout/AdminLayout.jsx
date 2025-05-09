import React, { useState, useContext, useEffect } from 'react';
import { Outlet, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { 
    Box, 
    Drawer, 
    AppBar, 
    Toolbar, 
    List, 
    Typography, 
    Divider, 
    IconButton, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    ListItemButton,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    Badge,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { 
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as UsersIcon,
    ShoppingBag as ProductsIcon,
    LocalShipping as OrdersIcon,
    Settings as SettingsIcon,
    Store as SellersIcon,
    Storefront as StoreIcon, // Changed to Storefront to avoid duplicate imports
    Notifications as NotificationsIcon,
    ChevronLeft as ChevronLeftIcon,
    Logout as LogoutIcon,
    Insights as InsightsIcon
} from '@mui/icons-material';
import { UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { ThemeContext } from '../../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { useAdmin } from '../../../context/AdminContext';

const drawerWidth = 240;

function AdminLayout() {
    const [open, setOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, colorValues } = useContext(ThemeContext);
    const { user } = useUser();
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const { isAdmin, checkAdminStatus } = useAdmin();
    
    // Verify admin status when component loads
    useEffect(() => {
        // Force check admin status when admin layout is mounted
        checkAdminStatus();
        
        if (!isAdmin) {
            console.log("AdminLayout: User is not an admin, redirecting...");
        } else {
            console.log("AdminLayout: Admin status confirmed");
        }
    }, [checkAdminStatus, isAdmin]);
    
    const toggleDrawer = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setOpen(!open);
        }
    };
    
    const handleSignOut = () => {
        signOut();
        toast.success('Signed out successfully');
        navigate('/');
    };
    
    const menuItems = [
        { name: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        { name: 'Products', icon: <ProductsIcon />, path: '/admin/products' },
        { name: 'Orders', icon: <OrdersIcon />, path: '/admin/orders' },
        { name: 'Users', icon: <UsersIcon />, path: '/admin/users' },
        { name: 'Analytics', icon: <InsightsIcon />, 
          subItems: [
            { name: 'Revenue', path: '/admin/analytics/revenue' },
            { name: 'Products', path: '/admin/analytics/products' },
            { name: 'Customers', path: '/admin/analytics/customers' },
            { name: 'Geographical', path: '/admin/analytics/geographical' },
          ]
        },
        { name: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
    ];
    
    const isCurrentPath = (path) => {
        return location.pathname === path;
    };
    
    const drawer = (
        <>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: [1],
                    backgroundColor: colorValues.primary
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        ml: 1
                    }}>
                        Admin Panel
                    </Typography>
                </Box>
                <IconButton onClick={toggleDrawer} sx={{ color: 'white' }}>
                    <ChevronLeftIcon />
                </IconButton>
            </Toolbar>
            <Divider />
            <Box sx={{ overflow: 'auto', height: '100%' }}>
                <List component="nav">
                    {menuItems.map((item) => (
                        <ListItem key={item.name} disablePadding>
                            <ListItemButton
                                component={RouterLink}
                                to={item.path}
                                selected={isCurrentPath(item.path)}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: `${colorValues.primaryLight}30`,
                                        borderLeft: `4px solid ${colorValues.primary}`,
                                        '& .MuiListItemIcon-root': {
                                            color: colorValues.primary
                                        }
                                    },
                                    '&:hover': {
                                        backgroundColor: `${colorValues.primaryLight}15`,
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: isCurrentPath(item.path) ? colorValues.primary : colorValues.textSecondary }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 1 }} />
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleSignOut}>
                            <ListItemIcon>
                                <LogoutIcon sx={{ color: colorValues.error }} />
                            </ListItemIcon>
                            <ListItemText primary="Sign Out" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </>
    );
    
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: colorValues.bgPaper,
                    color: colorValues.textPrimary,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    transition: open ? 'width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'none',
                    ...(open && {
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        marginLeft: { md: `${drawerWidth}px` },
                    }),
                    boxShadow: theme === 'dark' ? '0 2px 10px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.1)'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={toggleDrawer}
                        sx={{
                            marginRight: 2,
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Clinique Beauty Admin
                    </Typography>
                    
                    {/* Notifications Icon */}
                    <Tooltip title="Notifications">
                        <IconButton 
                            color="inherit"
                            aria-label="notifications"
                            sx={{ mr: 2 }}
                        >
                            <Badge badgeContent={4} color="secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    
                    {/* Store View Icon */}
                    <Tooltip title="View Store">
                        <IconButton 
                            color="inherit" 
                            onClick={() => navigate('/')}
                            sx={{ mr: 2 }}
                        >
                            <Badge color="primary">
                                <StoreIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    
                    {/* User Profile */}
                    <Box sx={{ ml: 2 }}>
                        <UserButton />
                    </Box>
                </Toolbar>
            </AppBar>
            
            {/* Drawer - different behavior for mobile vs desktop */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={toggleDrawer}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: drawerWidth,
                            backgroundColor: colorValues.bgPaper,
                            color: colorValues.textPrimary
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            ) : (
                <Drawer
                    variant="permanent"
                    open={open}
                    sx={{
                        width: open ? drawerWidth : 0,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            backgroundColor: colorValues.bgPaper,
                            color: colorValues.textPrimary,
                            borderRight: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                            ...(!open && {
                                width: '0px',
                                overflowX: 'hidden'
                            })
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            )}
            
            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
                    minHeight: '100vh',
                    backgroundColor: colorValues.bgDefault,
                    marginTop: '64px' // Height of AppBar
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default AdminLayout;
