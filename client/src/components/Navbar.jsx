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
    const { theme, toggleTheme, colors, colorValues } = useContext(ThemeContext);
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

    // Custom styles for Clerk's UserButton with improved visibility using ThemeContext values
    const clerkButtonAppearance = {
        baseTheme: theme,
        elements: {
            userButtonAvatarBox: {
                width: '2.2rem',
                height: '2.2rem',
                border: theme === 'dark' ? `2px solid ${colorValues.primary}` : 'none'
            },
            userButtonBox: {
                boxShadow: 'none',
                borderRadius: '50px',
                backgroundColor: theme === 'dark' ? '#333333' : '#f5f5f5',
            },
            userButtonOuterIdentifier: {
                color: colorValues.textPrimary,
                fontWeight: 500
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
            elevation={4}
            sx={{
                bgcolor: colorValues.navbarBg,
                color: colorValues.textPrimary,
                borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #eaeaea'
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
                        color: colorValues.primary,
                        fontSize: '28px'
                    }} />
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
                                    color: colorValues.textPrimary,
                                    fontWeight: 500,
                                    '&:hover': {
                                        color: colorValues.primary,
                                        backgroundColor: colorValues.buttonHover
                                    }
                                }}
                            >
                                {item.name}
                            </Button>
                        ))}

                        {/* Theme toggle button */}
                        <IconButton
                            onClick={toggleTheme}
                            sx={{
                                color: colorValues.textPrimary,
                                ml: 1,
                                '&:hover': {
                                    color: colorValues.primary,
                                    backgroundColor: colorValues.buttonHover
                                }
                            }}
                        >
                            {theme === 'dark' ?
                                <LightModeIcon sx={{ color: colorValues.primaryLight }} /> :
                                <DarkModeIcon />
                            }
                        </IconButton>

                        {/* Cart icon */}
                        <IconButton
                            component={RouterLink}
                            to="/cart"
                            sx={{
                                mr: 2,
                                ml: 1,
                                color: colorValues.textPrimary,
                                '&:hover': {
                                    color: colorValues.primary,
                                    backgroundColor: colorValues.buttonHover
                                }
                            }}
                        >
                            <Badge
                                badgeContent={0}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: colorValues.primary,
                                        color: 'white'
                                    }
                                }}
                            >
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
                                    variant="outlined"
                                    sx={{
                                        mr: 1,
                                        color: colorValues.primary,
                                        borderColor: colorValues.primary,
                                        '&:hover': {
                                            borderColor: colorValues.primaryDark,
                                            backgroundColor: colorValues.buttonHover
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
                                        backgroundColor: colorValues.primary,
                                        color: 'white',
                                        fontWeight: 500,
                                        '&:hover': {
                                            backgroundColor: colorValues.primaryDark
                                        }
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Mobile menu */}
                {isMobile && (
                    <>
                        <IconButton
                            aria-label="cart"
                            component={RouterLink}
                            to="/cart"
                            sx={{
                                mr: 2,
                                color: colorValues.textPrimary
                            }}
                        >
                            <Badge
                                badgeContent={0}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: colorValues.primary,
                                        color: 'white'
                                    }
                                }}
                            >
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
                                color: colorValues.textPrimary
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