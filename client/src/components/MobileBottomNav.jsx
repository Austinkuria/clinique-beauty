// client/src/components/MobileBottomNav.jsx
// Mobile and tablet bottom navigation bar for seamless shopping and navigation

import React, { useContext } from 'react';
import {
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    Badge,
    Box
} from '@mui/material';
import {
    Home as HomeIcon,
    Storefront as StoreIcon,
    FavoriteBorder as WishlistIcon,
    ShoppingCart as CartIcon,
    PersonOutline as AccountIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ThemeContext } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function MobileBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const { colorValues } = useContext(ThemeContext);
    const { itemCount = 0 } = useCart() || {};
    const { wishlist = [] } = useWishlist() || {};
    const { isSignedIn } = useAuth();

    // Map active pathname to navigation value
    const currentPath = location.pathname;
    let activeValue = 'home';
    if (currentPath.startsWith('/products') || currentPath.startsWith('/product/')) {
        activeValue = 'store';
    } else if (currentPath.startsWith('/wishlist')) {
        activeValue = 'wishlist';
    } else if (currentPath.startsWith('/cart')) {
        activeValue = 'cart';
    } else if (currentPath.startsWith('/auth') || currentPath.startsWith('/profile') || currentPath.startsWith('/seller')) {
        activeValue = 'account';
    }

    const handleChange = (event, newValue) => {
        if (newValue === 'home') navigate('/');
        else if (newValue === 'store') navigate('/products');
        else if (newValue === 'wishlist') navigate('/wishlist');
        else if (newValue === 'cart') navigate('/cart');
        else if (newValue === 'account') {
            if (isSignedIn) navigate('/seller/apply');
            else navigate('/auth/login');
        }
    };

    return (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Paper
                elevation={6}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1250,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: colorValues.bgPaper,
                    backdropFilter: 'blur(8px)'
                }}
            >
                <BottomNavigation
                    showLabels
                    value={activeValue}
                    onChange={handleChange}
                    sx={{
                        backgroundColor: 'transparent',
                        height: 58,
                        '& .MuiBottomNavigationAction-root': {
                            minWidth: 'auto',
                            color: colorValues.textSecondary,
                            py: 0.5,
                            '&.Mui-selected': {
                                color: colorValues.primary,
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: '0.72rem',
                                    fontWeight: 700
                                }
                            },
                            '& .MuiBottomNavigationAction-label': {
                                fontSize: '0.7rem',
                                fontWeight: 500
                            }
                        }
                    }}
                >
                    <BottomNavigationAction
                        label="Home"
                        value="home"
                        icon={<HomeIcon sx={{ fontSize: '1.3rem' }} />}
                    />
                    <BottomNavigationAction
                        label="Store"
                        value="store"
                        icon={<StoreIcon sx={{ fontSize: '1.3rem' }} />}
                    />
                    <BottomNavigationAction
                        label="Wishlist"
                        value="wishlist"
                        icon={
                            <Badge badgeContent={wishlist.length} color="primary" max={99}>
                                <WishlistIcon sx={{ fontSize: '1.3rem' }} />
                            </Badge>
                        }
                    />
                    <BottomNavigationAction
                        label="Cart"
                        value="cart"
                        icon={
                            <Badge badgeContent={itemCount} color="primary" max={99}>
                                <CartIcon sx={{ fontSize: '1.3rem' }} />
                            </Badge>
                        }
                    />
                    <BottomNavigationAction
                        label="Account"
                        value="account"
                        icon={<AccountIcon sx={{ fontSize: '1.3rem' }} />}
                    />
                </BottomNavigation>
            </Paper>
        </Box>
    );
}
