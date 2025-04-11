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
    Badge
} from '@mui/material';
import {
    Menu as MenuIcon,
    ShoppingCart as CartIcon,
    Home as HomeIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon
} from '@mui/icons-material';
import { UserButton, useAuth } from '@clerk/clerk-react';

function Navbar() {
    const { theme, toggleTheme, colors } = useContext(ThemeContext);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const { isSignedIn } = useAuth();

    // Navigation items
    const navItems = [
        { name: 'Products', path: '/products' },
        { name: 'Cart', path: '/cart', icon: <CartIcon /> },
        // Only show Profile when user is signed in
        ...(isSignedIn ? [{ name: 'Profile', path: '/profile' }] : [])
    ];

    // Custom styles for Clerk's UserButton with improved visibility
    const clerkButtonAppearance = {
        baseTheme: theme === 'dark' ? 'dark' : 'light',
        elements: {
            userButtonAvatarBox: {
                width: '2.2rem',
                height: '2.2rem',
            },
            userButtonBox: {
                boxShadow: 'none',
                borderRadius: '50px'
            },
            // Ensure the text is visible
            userButtonOuterIdentifier: {
                color: theme === 'dark' ? 'white' : 'black',
            }
        }
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const drawer = (
        <Box
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
            sx={{ width: 250 }}
            role="presentation"
            className={`${colors.sectionBg}`}
        >
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton 
                            component={RouterLink} 
                            to={item.path}
                            className={`${colors.navbarTextSecondary} ${colors.textHover}`}
                        >
                            {item.icon && <Box mr={1}>{item.icon}</Box>}
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {!isSignedIn && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton 
                                component={RouterLink} 
                                to="/auth/login"
                                className={`${colors.navbarTextSecondary} ${colors.textHover}`}
                            >
                                <ListItemText primary="Sign In" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton 
                                component={RouterLink} 
                                to="/auth/register"
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
                        <Switch checked={theme === 'dark'} onChange={toggleTheme} />
                        <DarkModeIcon className={colors.navbarTextSecondary} />
                    </Box>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <AppBar 
            position="sticky" 
            elevation={2}
            className={colors.navbarBg}
            sx={{ color: theme === 'dark' ? 'white' : 'inherit' }}
        >
            <Toolbar>
                <RouterLink 
                    to="/" 
                    style={{ 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center',
                    }}
                >
                    <HomeIcon sx={{ 
                        mr: 1,
                        color: theme === 'dark' ? '#f48fb1' : '#e91e63'
                    }} />
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 600,
                            color: theme === 'dark' ? 'white' : '#212121',
                            fontSize: '1.25rem',
                            letterSpacing: '0.5px'
                        }}
                    >
                        Clinique Beauty
                    </Typography>
                </RouterLink>

                <Box sx={{ flexGrow: 1 }} />

                {/* Desktop menu */}
                {!isMobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.name}
                                component={RouterLink}
                                to={item.path}
                                startIcon={item.icon}
                                sx={{ 
                                    mx: 1, 
                                    color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)',
                                    '&:hover': {
                                        color: theme === 'dark' ? '#f48fb1' : '#e91e63',
                                    }
                                }}
                            >
                                {item.name}
                            </Button>
                        ))}
                        
                        {/* Theme toggle button with explicit color */}
                        <IconButton 
                            onClick={toggleTheme} 
                            sx={{ 
                                color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)',
                                ml: 1
                            }}
                        >
                            {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>

                        {/* Cart icon with explicit color */}
                        <IconButton 
                            component={RouterLink} 
                            to="/cart" 
                            sx={{ 
                                mr: 2,
                                ml: 1,
                                color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)'
                            }}
                        >
                            <Badge badgeContent={0} color="secondary">
                                <CartIcon />
                            </Badge>
                        </IconButton>

                        {/* Authentication UI */}
                        {isSignedIn ? (
                            <UserButton 
                                afterSignOutUrl="/" 
                                appearance={clerkButtonAppearance} 
                            />
                        ) : (
                            <Box>
                                <Button
                                    component={RouterLink}
                                    to="/auth/login"
                                    sx={{ 
                                        mr: 1,
                                        color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)',
                                        '&:hover': {
                                            color: theme === 'dark' ? '#f48fb1' : '#e91e63',
                                        }
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    variant="contained"
                                    component={RouterLink}
                                    to="/auth/register"
                                    sx={{ 
                                        backgroundColor: theme === 'dark' ? '#f48fb1' : '#e91e63',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: theme === 'dark' ? '#f06292' : '#d81b60'
                                        }
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Mobile menu with improved visibility */}
                {isMobile && (
                    <>
                        <IconButton
                            aria-label="cart"
                            component={RouterLink}
                            to="/cart"
                            sx={{ 
                                mr: 2,
                                color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)'
                            }}
                        >
                            <Badge badgeContent={0} color="primary">
                                <CartIcon />
                            </Badge>
                        </IconButton>
                        
                        {isSignedIn && (
                            <Box sx={{ mr: 2 }}>
                                <UserButton 
                                    afterSignOutUrl="/" 
                                    appearance={clerkButtonAppearance}
                                />
                            </Box>
                        )}
                        
                        <IconButton
                            aria-label="open drawer"
                            edge="end"
                            onClick={toggleDrawer(true)}
                            sx={{ 
                                color: theme === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.87)'
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        
                        <Drawer
                            anchor="right"
                            open={drawerOpen}
                            onClose={toggleDrawer(false)}
                        >
                            {drawer}
                        </Drawer>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;