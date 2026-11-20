import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
    Paper,
    ClickAwayListener,
    Avatar,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ShoppingCart as CartIcon,
    Home as HomeIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Security as SecurityIcon,
    FavoriteBorder as WishlistIcon,
} from '@mui/icons-material';
import { UserButton, useAuth, useUser } from '@clerk/clerk-react';
import { CartContext } from '../context/CartContext';
import { useCategories } from '../context/CategoryContext';
import { useWishlist } from '../context/WishlistContext';
import { useApi } from '../api/apiClient';
import mockProducts from '../data/mockProducts';
import { formatCurrency } from '../utils/helpers';
import defaultProductImage from '../assets/images/placeholder.webp';

function Navbar() {
    const { theme, toggleTheme, colors, colorValues, siteTitle } = useContext(ThemeContext);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin';
    const api = useApi();
    
    // Use cart context directly to avoid hook rule violations
    const cartContext = useContext(CartContext);
    const itemCount = cartContext?.itemCount || 0;
    const cartLoading = cartContext?.loading || false;
    const { wishlist = [] } = useWishlist() || {};
    const navigate = useNavigate();

    // Live catalog state including API products and mock fallbacks
    const [catalogProducts, setCatalogProducts] = useState(mockProducts || []);

    useEffect(() => {
        let isMounted = true;
        api.getProducts().then((res) => {
            const list = Array.isArray(res) ? res : (res?.products || []);
            if (isMounted && list.length > 0) {
                const map = new Map();
                (mockProducts || []).forEach(p => map.set(p.slug || p.id, p));
                list.forEach(p => map.set(p.slug || p.id, p));
                setCatalogProducts(Array.from(map.values()));
            }
        }).catch((err) => {
            console.warn('Live catalog search fallback active:', err.message);
        });
        return () => { isMounted = false; };
    }, [api]);

    // E-commerce Live Autocomplete Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (!val.trim()) {
            setSearchResults([]);
            setSearchOpen(false);
            return;
        }

        const terms = val.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const matches = (catalogProducts || []).filter((p) => {
            const targetStr = [
                p.name || '',
                p.category || '',
                p.subcategory || '',
                p.description || '',
                p.brand || '',
                ...(Array.isArray(p.tags) ? p.tags : [])
            ].join(' ').toLowerCase();

            return terms.every(t => targetStr.includes(t));
        }).slice(0, 8);

        setSearchResults(matches);
        setSearchOpen(true);
    };

    const handleSearchSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchOpen(false);
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    };

    const handleSelectProduct = (product) => {
        setSearchOpen(false);
        setSearchQuery('');
        navigate(`/product/${product.slug || product.id}`);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSearchOpen(false);
    };

    // Dynamic navigation items driven directly by admin-configured categories
    const { categories } = useCategories();
    const navItems = (categories || []).map((cat) => ({
        name: cat.name,
        path: `/products/${cat.slug || cat.name.toLowerCase()}`
    }));

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
        <Box sx={{ width: 280 }} role="presentation" className={`${colors.sectionBg}`}>
            {/* Mobile Search */}
            <Box sx={{ p: 2, pb: 1 }}>
                <TextField
                    placeholder="Search products..."
                    size="small"
                    fullWidth
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setDrawerOpen(false);
                            handleSearchSubmit(e);
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: colorValues.textSecondary, fontSize: '1.1rem' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            backgroundColor: theme === 'dark' ? '#333333' : '#f5f5f5',
                            fontSize: '0.85rem'
                        }
                    }}
                />
            </Box>
            {searchQuery.trim() && searchResults.length > 0 && (
                <Box sx={{ px: 1.5, pb: 1 }}>
                    <Typography variant="caption" sx={{ px: 1, fontWeight: 700, color: colorValues.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Search Suggestions
                    </Typography>
                    <List dense disablePadding sx={{ mt: 0.5 }}>
                        {searchResults.slice(0, 4).map((p) => (
                            <ListItem key={p.id || p.slug} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => {
                                        setDrawerOpen(false);
                                        handleSelectProduct(p);
                                    }}
                                    sx={{ borderRadius: 1.5, py: 0.8, px: 1 }}
                                >
                                    <Avatar
                                        src={p.image || defaultProductImage}
                                        variant="rounded"
                                        sx={{ width: 34, height: 34, mr: 1.5 }}
                                        imgProps={{ onError: (e) => { e.currentTarget.src = defaultProductImage; } }}
                                    />
                                    <ListItemText
                                        primary={p.name}
                                        secondary={formatCurrency(p.price)}
                                        primaryTypographyProps={{ noWrap: true, fontSize: '0.82rem', fontWeight: 600 }}
                                        secondaryTypographyProps={{ fontSize: '0.75rem', color: colorValues.primary, fontWeight: 700 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 1 }} />
                </Box>
            )}
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
            elevation={1}
            sx={{
                bgcolor: colorValues.navbarBg,
                color: colorValues.textPrimary,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Toolbar sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
                {/* Branding */}
                <RouterLink
                    to="/"
                    title={`${siteTitle || 'Clinique Beauty'} Home`}
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
                        {siteTitle || 'Clinique Beauty'}
                    </Typography>
                </RouterLink>

                <Box sx={{ flexGrow: 1 }} />

                {/* Desktop View */}
                {!isMobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Live Search Bar with Instant Autocomplete Dropdown */}
                        <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
                            <Box sx={{ position: 'relative', width: { sm: 260, md: 320, lg: 380 }, mr: 2 }}>
                                <Box component="form" onSubmit={handleSearchSubmit}>
                                    <TextField
                                        variant="outlined"
                                        placeholder="Search products, categories..."
                                        size="small"
                                        fullWidth
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => {
                                            if (searchQuery.trim() && searchResults.length > 0) {
                                                setSearchOpen(true);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchSubmit(e);
                                            } else if (e.key === 'Escape') {
                                                setSearchOpen(false);
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '24px',
                                                backgroundColor: theme === 'dark' ? '#333333' : '#f5f5f5',
                                                pr: 0.5,
                                                fontSize: '0.875rem',
                                                '&:hover': {
                                                    backgroundColor: theme === 'dark' ? '#3d3d3d' : '#eeeeee',
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: theme === 'dark' ? '#333333' : '#ffffff',
                                                    boxShadow: `0 0 0 2px ${colorValues.primary}33`,
                                                }
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: colorValues.textSecondary, fontSize: '1.2rem', ml: 0.5 }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {searchQuery && (
                                                        <IconButton size="small" onClick={handleClearSearch} sx={{ p: 0.5, mr: 0.5 }}>
                                                            <CloseIcon sx={{ fontSize: '1rem', color: colorValues.textSecondary }} />
                                                        </IconButton>
                                                    )}
                                                    <Button
                                                        size="small"
                                                        onClick={handleSearchSubmit}
                                                        sx={{
                                                            minWidth: 32,
                                                            px: 1.5,
                                                            py: 0.4,
                                                            borderRadius: '16px',
                                                            backgroundColor: colorValues.primary,
                                                            color: '#ffffff',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            textTransform: 'none',
                                                            '&:hover': {
                                                                backgroundColor: colorValues.primaryDark,
                                                            }
                                                        }}
                                                    >
                                                        Search
                                                    </Button>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                {/* Live Search Instant Dropdown Preview */}
                                {searchOpen && (
                                    <Paper
                                        elevation={8}
                                        sx={{
                                            position: 'absolute',
                                            top: 'calc(100% + 8px)',
                                            left: 0,
                                            right: 0,
                                            maxHeight: 440,
                                            overflowY: 'auto',
                                            zIndex: 1400,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            backgroundColor: colorValues.bgPaper,
                                            boxShadow: theme === 'dark' ? '0 12px 30px rgba(0,0,0,0.6)' : '0 12px 30px rgba(0,0,0,0.12)'
                                        }}
                                    >
                                        {searchResults.length > 0 ? (
                                            <Box>
                                                <Box sx={{ px: 2, py: 1, backgroundColor: colorValues.bgDefault, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: colorValues.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                        Matching Products ({searchResults.length})
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: colorValues.primary, fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                        onClick={handleSearchSubmit}
                                                    >
                                                        View all
                                                    </Typography>
                                                </Box>
                                                <List disablePadding>
                                                    {searchResults.map((product) => (
                                                        <ListItem
                                                            key={product.id || product.slug}
                                                            disablePadding
                                                            divider
                                                        >
                                                            <ListItemButton
                                                                onClick={() => handleSelectProduct(product)}
                                                                sx={{
                                                                    py: 1,
                                                                    px: 1.5,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                                    }
                                                                }}
                                                            >
                                                                <Avatar
                                                                    src={product.image || defaultProductImage}
                                                                    variant="rounded"
                                                                    sx={{ width: 44, height: 44, borderRadius: 1 }}
                                                                    imgProps={{ onError: (e) => { e.currentTarget.src = defaultProductImage; } }}
                                                                />
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Typography
                                                                        variant="body2"
                                                                        noWrap
                                                                        sx={{ fontWeight: 600, color: colorValues.textPrimary, fontSize: '0.85rem' }}
                                                                    >
                                                                        {product.name}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Typography variant="caption" sx={{ color: colorValues.textSecondary, fontSize: '0.72rem' }}>
                                                                            {product.category}
                                                                        </Typography>
                                                                        {product.rating && (
                                                                            <Typography variant="caption" sx={{ color: colorValues.primary, fontSize: '0.72rem', fontWeight: 600 }}>
                                                                                ★ {product.rating}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                                <Typography
                                                                    variant="subtitle2"
                                                                    sx={{ fontWeight: 700, color: colorValues.primary, fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                                                                >
                                                                    {formatCurrency(product.price)}
                                                                </Typography>
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                                <Box
                                                    onClick={handleSearchSubmit}
                                                    sx={{
                                                        p: 1.2,
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        backgroundColor: colorValues.bgDefault,
                                                        color: colorValues.primary,
                                                        fontWeight: 600,
                                                        fontSize: '0.8rem',
                                                        '&:hover': { textDecoration: 'underline' }
                                                    }}
                                                >
                                                    Press Enter to view all results for "{searchQuery}"
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box sx={{ p: 2.5, textAlign: 'center' }}>
                                                <Typography variant="body2" sx={{ color: colorValues.textSecondary, fontSize: '0.85rem' }}>
                                                    No products found matching "{searchQuery}"
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                )}
                            </Box>
                        </ClickAwayListener>

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

                        {/* Wishlist */}
                        <Tooltip title="View Wishlist">
                            <IconButton
                                component={RouterLink}
                                to="/wishlist"
                                sx={{
                                    ml: 1,
                                    color: colorValues.textPrimary,
                                    '&:hover': {
                                        color: colorValues.primary,
                                        backgroundColor: colorValues.buttonHover,
                                    },
                                }}
                                aria-label={`Wishlist with ${wishlist.length} items`}
                            >
                                <Badge
                                    badgeContent={wishlist.length}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: colorValues.primary,
                                            color: 'white',
                                        },
                                    }}
                                >
                                    <WishlistIcon />
                                </Badge>
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