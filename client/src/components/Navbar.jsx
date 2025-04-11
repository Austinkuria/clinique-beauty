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
            sx={{ 
                bgcolor: theme === 'dark' ? '#1e1e1e' : 'white',  // Explicit background colors
                color: theme === 'dark' ? 'white' : '#212121'      // Explicit text colors
            }}
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
                        color: theme === 'dark' ? '#f48fb1' : '#e91e63',  // Pink color that works in both themes
                        fontSize: '28px'  // Slightly larger icon
                    }} />
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 600,
                            color: theme === 'dark' ? '#ffffff' : '#212121',  // Pure white in dark mode
                            fontSize: '1.25rem',
                            letterSpacing: '0.5px',
                            textShadow: theme === 'dark' ? '0px 0px 5px rgba(255,255,255,0.3)' : 'none'  // Add subtle glow in dark mode
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
                                    color: theme === 'dark' ? '#ffffff' : '#212121',  // Pure white in dark mode
                                    fontWeight: 500,  // Medium weight for better visibility
                                    '&:hover': {
                                        color: theme === 'dark' ? '#f48fb1' : '#e91e63',
                                        backgroundColor: theme === 'dark' ? 'rgba(244,143,177,0.08)' : 'rgba(233,30,99,0.04)'
                                    }
                                }}
                            >
                                {item.name}
                            </Button>
                        ))}
                        
                        {/* Theme toggle button with improved contrast */}
                        <IconButton 
                            onClick={toggleTheme} 
                            sx={{ 
                                color: theme === 'dark' ? '#ffffff' : '#212121',  // Pure white in dark mode
                                ml: 1,
                                '&:hover': {
                                    color: theme === 'dark' ? '#f48fb1' : '#e91e63',
                                    backgroundColor: theme === 'dark' ? 'rgba(244,143,177,0.08)' : 'rgba(233,30,99,0.04)'
                                }
                            }}
                        >
                            {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>

                        {/* Cart icon with improved contrast */}
                        <IconButton 
                            component={RouterLink} 
                            to="/cart" 
                            sx={{ 
                                mr: 2,
                                ml: 1,
                                color: theme === 'dark' ? '#ffffff' : '#212121',  // Pure white in dark mode
                                '&:hover': {
                                    color: theme === 'dark' ? '#f48fb1' : '#e91e63',
                                    backgroundColor: theme === 'dark' ? 'rgba(244,143,177,0.08)' : 'rgba(233,30,99,0.04)'
                                }
                            }}
                        >
                            <Badge badgeContent={0} color="secondary">
                                <CartIcon />
                            </Badge>
                        </IconButton>

                        {/* Authentication UI with improved contrast */}
                        {isSignedIn ? (
                            <UserButton 
                                afterSignOutUrl="/" 
                                appearance={{
                                    baseTheme: theme === 'dark' ? 'dark' : 'light',
                                    elements: {
                                        userButtonAvatarBox: {
                                            width: '2.2rem',
                                            height: '2.2rem',
                                        },
                                        userButtonBox: {
                                            boxShadow: 'none',
                                            borderRadius: '50px',
                                            backgroundColor: theme === 'dark' ? '#333333' : '#f5f5f5',
                                        },
                                        userButtonOuterIdentifier: {
                                            color: theme === 'dark' ? '#ffffff' : '#212121',
                                            fontWeight: 500
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <Box>
                                <Button
                                    component={RouterLink}
                                    to="/auth/login"
                                    variant="outlined"  // Outlined for better visibility
                                    sx={{ 
                                        mr: 1,
                                        color: theme === 'dark' ? '#ffffff' : '#212121',
                                        borderColor: theme === 'dark' ? '#f48fb1' : '#e91e63',
                                        '&:hover': {
                                            color: theme === 'dark' ? '#f48fb1' : '#e91e63',
                                            borderColor: theme === 'dark' ? '#f06292' : '#d81b60',
                                            backgroundColor: theme === 'dark' ? 'rgba(244,143,177,0.08)' : 'rgba(233,30,99,0.04)'
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
                                        color: '#ffffff',  // Always white text for best contrast
                                        fontWeight: 500,
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