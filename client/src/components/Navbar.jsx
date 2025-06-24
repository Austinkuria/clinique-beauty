import React, { useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext.jsx';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    useMediaQuery,
    useTheme,
    Switch,
    Badge,
    TextField,
    InputAdornment,
    Tooltip,
    ListItemIcon,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ShoppingCart as CartIcon,
    Home as HomeIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Search as SearchIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { UserButton, useAuth, useUser } from '@clerk/clerk-react';
import { CartContext } from '../context/CartContext';

function Navbar() {
    const { theme, toggleTheme, colors, colorValues } = useContext(ThemeContext);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin';
    
    // Use cart context directly, with fallback if not available
    const cartContext = useContext(CartContext);
    const itemCount = cartContext?.itemCount || 0;
    const cartLoading = cartContext?.loading || false;

    // Navigation items without the cart and without Profile button
    const navItems = [
        { name: 'Skincare', path: '/products/skincare' },
        { name: 'Makeup', path: '/products/makeup' },
        { name: 'Fragrance', path: '/products/fragrance' },
        { name: 'Hair', path: '/products/hair' },
        // Removed the profile button since Clerk's UserButton handles this
    ];

    // Clerk UserButton styling - Updated to include variables with direct color values
    const clerkButtonAppearance = {
        baseTheme: theme === 'dark' ? 'dark' : 'light', // Use Clerk's base themes
        variables: {
            colorPrimary: colorValues.primary, // Use direct color value
            colorText: colorValues.textPrimary, // Use direct color value
            colorBackground: colorValues.bgPaper, // Use direct color value for component backgrounds
            colorInputBackground: theme === 'dark' ? '#333333' : '#f5f5f5', // Example for inputs
            colorInputText: colorValues.textPrimary, // Example for input text
            // Add other variables as needed, ensuring they are direct color values
        },
        elements: {
            userButtonAvatarBox: {
                width: '2.2rem',
                height: '2.2rem',
                border: theme === 'dark' ? `2px solid ${colorValues.primary}` : 'none',
            },
            userButtonBox: {
                boxShadow: 'none',
                borderRadius: '50px',
                // Use a slightly different background for the button itself if needed
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#eeeeee',
            },
            userButtonOuterIdentifier: {
                color: colorValues.textPrimary,
                fontWeight: 500,
            },
            // You might need to style other Clerk elements if you use SignIn/SignUp components
            // card: {
            //     backgroundColor: colorValues.bgPaper,
            // },
            // formButtonPrimary: {
            //     backgroundColor: colorValues.primary,
            //     '&:hover': {
            //         backgroundColor: colorValues.primaryDark,
            //     }
            // },
            // footerActionLink: {
            //     color: colorValues.primary,
            //     '&:hover': {
            //         color: colorValues.primaryLight,
            //     }
            // }
        },
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    // Mobile drawer content
    const drawer = (
        <Box sx={{ width: 250 }} role="presentation" className={`${colors.sectionBg}`}>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to={item.path}
                            onClick={toggleDrawer(false)}
                            className={`${colors.navbarTextSecondary} ${colors.textHover}`}
                        >
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {/* Cart in drawer */}
                <ListItem disablePadding>
                    <ListItemButton
                        component={RouterLink}
                        to="/cart"
                        onClick={toggleDrawer(false)}
                        className={`${colors.navbarTextSecondary} ${colors.textHover}`}
                    >
                        <Badge
                            badgeContent={cartLoading ? '...' : itemCount}
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: colorValues.primary,
                                    color: 'white',
                                },
                            }}
                        >
                            <CartIcon sx={{ mr: 1 }} />
                        </Badge>
                        <ListItemText primary="Cart" />
                    </ListItemButton>
                </ListItem>
                {isSignedIn && isAdmin && (
                    <ListItem disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to="/admin"
                            onClick={toggleDrawer(false)}
                            className={`${colors.navbarTextSecondary} ${colors.textHover}`}
                        >
                            <ListItemIcon>
                                <AdminPanelSettingsIcon className={colors.navbarTextSecondary} />
                            </ListItemIcon>
                            <ListItemText primary="Admin Panel" />
                        </ListItemButton>
                    </ListItem>
                )}
                {isSignedIn && !isAdmin && (
                    <ListItem disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to="/admin-setup"
                            onClick={toggleDrawer(false)}
                            className={`${colors.navbarTextSecondary} ${colors.textHover}`}
                        >
                            <ListItemIcon>
                                <SecurityIcon className={colors.navbarTextSecondary} />
                            </ListItemIcon>
                            <ListItemText primary="Admin Setup" />
                        </ListItemButton>
                    </ListItem>
                )}
                {!isSignedIn && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton
                                component={RouterLink}
                                to="/auth/login"
                                onClick={toggleDrawer(false)}
                                className={`${colors.navbarTextSecondary} ${colors.textHover}`}
                            >
                                <ListItemText primary="Sign In" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                component={RouterLink}
                                to="/auth/register"
                                onClick={toggleDrawer(false)}
                                className={`${colors.navbarTextSecondary} ${colors.textHover}`}
                            >
                                <ListItemText primary="Sign Up" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
                <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <LightModeIcon className={colors.navbarTextSecondary} />
                        <Switch
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <DarkModeIcon className={colors.navbarTextSecondary} />
                    </Box>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <AppBar
            position="sticky"
            elevation={4}
            sx={{
                bgcolor: colorValues.navbarBg,
                color: colorValues.textPrimary,
                borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #eaeaea',
            }}
        >
            <Toolbar>
                {/* Branding */}
                <RouterLink
                    to="/"
                    title="Clinique Beauty Home"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                >
                    <HomeIcon sx={{ mr: 1, color: colorValues.primary, fontSize: '28px' }} />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: theme === 'dark' ? colorValues.primary : colorValues.textPrimary,
                            fontSize: '1.25rem',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Clinique Beauty
                    </Typography>
                </RouterLink>

                <Box sx={{ flexGrow: 1 }} />

                {/* Desktop View */}
                {!isMobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Search Bar */}
                        <TextField
                            variant="outlined"
                            placeholder="Search products..."
                            size="small"
                            sx={{
                                width: '250px',
                                mr: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    backgroundColor: theme === 'dark' ? '#424242' : '#f5f5f5',
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: colorValues.textSecondary }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Navigation */}
                        {navItems.map((item) => (
                            <Button
                                key={item.name}
                                component={RouterLink}
                                to={item.path}
                                sx={{
                                    mx: 1,
                                    color: colorValues.textPrimary,
                                    fontWeight: 500,
                                    '&:hover': {
                                        color: colorValues.primary,
                                        backgroundColor: colorValues.buttonHover,
                                    },
                                }}
                            >
                                {item.name}
                            </Button>
                        ))}

                        {/* Theme Toggle */}
                        <Tooltip title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                            <IconButton
                                onClick={toggleTheme}
                                sx={{
                                    color: colorValues.textPrimary,
                                    ml: 1,
                                    '&:hover': {
                                        color: colorValues.primary,
                                        backgroundColor: colorValues.buttonHover,
                                    },
                                }}
                            >
                                {theme === 'dark' ? (
                                    <LightModeIcon sx={{ color: colorValues.primaryLight }} />
                                ) : (
                                    <DarkModeIcon />
                                )}
                            </IconButton>
                        </Tooltip>

                        {/* Cart */}
                        <IconButton
                            component={RouterLink}
                            to="/cart"
                            sx={{
                                mr: 2,
                                ml: 1,
                                color: colorValues.textPrimary,
                                '&:hover': {
                                    color: colorValues.primary,
                                    backgroundColor: colorValues.buttonHover,
                                },
                            }}
                            aria-label={`Cart with ${itemCount} items`}
                        >
                            <Badge
                                badgeContent={cartLoading ? '...' : itemCount}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: colorValues.primary,
                                        color: 'white',
                                    },
                                }}
                            >
                                <CartIcon />
                            </Badge>
                        </IconButton>

                        {/* Authentication */}
                        {isSignedIn ? (
                            <UserButton afterSignOutUrl="/" appearance={clerkButtonAppearance} />
                        ) : (
                            <Box>
                                <Button
                                    component={RouterLink}
                                    to="/auth/login"
                                    variant="outlined"
                                    sx={{
                                        mr: 1,
                                        color: colorValues.primary,
                                        borderColor: colorValues.primary,
                                        '&:hover': {
                                            borderColor: colorValues.primaryDark,
                                            backgroundColor: colorValues.buttonHover,
                                        },
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    variant="contained"
                                    component={RouterLink}
                                    to="/auth/register"
                                    sx={{
                                        backgroundColor: colorValues.primary,
                                        color: 'white',
                                        fontWeight: 500,
                                        '&:hover': {
                                            backgroundColor: colorValues.primaryDark,
                                        },
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Mobile View */}
                {isMobile && (
                    <>
                        <IconButton
                            component={RouterLink}
                            to="/cart"
                            sx={{ mr: 2, color: colorValues.textPrimary }}
                            aria-label={`Cart with ${itemCount} items`}
                        >
                            <Badge
                                badgeContent={cartLoading ? '...' : itemCount}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: colorValues.primary,
                                        color: 'white',
                                    },
                                }}
                            >
                                <CartIcon />
                            </Badge>
                        </IconButton>

                        {isSignedIn && (
                            <Box sx={{ mr: 2 }}>
                                <UserButton afterSignOutUrl="/" appearance={clerkButtonAppearance} />
                            </Box>
                        )}

                        <IconButton
                            aria-label="open drawer"
                            edge="end"
                            onClick={toggleDrawer(true)}
                            sx={{ color: colorValues.textPrimary }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                            {drawer}
                        </Drawer>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;