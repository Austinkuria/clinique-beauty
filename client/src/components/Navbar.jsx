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
    Person as UserIcon,
    Home as HomeIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon
} from '@mui/icons-material';
import { UserButton, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function Navbar() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const { isSignedIn } = useAuth();

    const navItems = [
        { name: 'Products', path: '/products' },
        { name: 'Cart', path: '/cart', icon: <CartIcon /> },
        { name: 'Profile', path: '/profile', icon: <UserIcon /> },
        { name: 'Login', path: '/auth/login' }
    ];

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
        >
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton component={RouterLink} to={item.path}>
                            {item.icon && <Box mr={1}>{item.icon}</Box>}
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <LightModeIcon />
                        <Switch checked={theme === 'dark'} onChange={toggleTheme} />
                        <DarkModeIcon />
                    </Box>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <AppBar position="sticky" color="default" elevation={2}>
            <Toolbar>
                <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
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
                                sx={{ mx: 1 }}
                                startIcon={item.icon}
                            >
                                {item.name}
                            </Button>
                        ))}
                        <IconButton onClick={toggleTheme} color="inherit">
                            {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                            <IconButton color="inherit" component={RouterLink} to="/cart" sx={{ mr: 2 }}>
                                <Badge badgeContent={0} color="secondary">
                                    <CartIcon />
                                </Badge>
                            </IconButton>
                            {isSignedIn ? (
                                <UserButton afterSignOutUrl="/" />
                            ) : (
                                <Box>
                                    <Button
                                        color="inherit"
                                        component={RouterLink}
                                        to="/auth/login"
                                        sx={{ mr: 1 }}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        component={RouterLink}
                                        to="/auth/register"
                                    >
                                        Sign Up
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Mobile menu */}
                {isMobile && (
                    <>
                        <IconButton
                            color="inherit"
                            aria-label="cart"
                            component={RouterLink}
                            to="/cart"
                            sx={{ mr: 2 }}
                        >
                            <Badge badgeContent={0} color="primary">
                                <CartIcon />
                            </Badge>
                        </IconButton>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={toggleDrawer(true)}
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