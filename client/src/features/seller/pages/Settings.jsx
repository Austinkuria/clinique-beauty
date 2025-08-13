import React, { useState, useContext, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Grid,
    TextField,
    InputAdornment,
    IconButton,
    Divider,
    Button,
    FormControlLabel,
    Switch,
    Alert,
    Snackbar,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { 
    Save as SaveIcon, 
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Palette as PaletteIcon,
    Business as BusinessIcon,
    CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';
import { useUser } from '@clerk/clerk-react';
// import { useSellerApi } from '../../../api/apiClient';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`seller-tabpanel-${index}`}
            aria-labelledby={`seller-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function SellerSettings() {
    const { theme, themeVariant, toggleTheme, changeThemeVariant, themeVariants, colorValues } = useContext(ThemeContext);
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const { user } = useUser();
    // For future implementation
    // const sellerApi = useSellerApi();
    
    const [tabValue, setTabValue] = useState(0);
    const [storeName, setStoreName] = useState('');
    const [storeEmail, setStoreEmail] = useState('');
    const [storePhone, setStorePhone] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    
    // Fetch seller profile data
    useEffect(() => {
        // In a real implementation, we would fetch the seller data
        // For now, we'll just simulate loading with the user's data
        if (user) {
            setStoreName(user.fullName || '');
            setStoreEmail(user.primaryEmailAddress?.emailAddress || '');
        }
    }, [user]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSaveSettings = () => {
        setLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSnackbarMessage('Settings saved successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        }, 1000);
        
        // In a real implementation, we would save the settings to the API
        // sellerApi.updateSettings({ storeName, storeEmail, storePhone, storeDescription })
        //     .then(() => {
        //         setSnackbarMessage('Settings saved successfully!');
        //         setSnackbarSeverity('success');
        //         setSnackbarOpen(true);
        //     })
        //     .catch((error) => {
        //         setSnackbarMessage('Failed to save settings: ' + error.message);
        //         setSnackbarSeverity('error');
        //         setSnackbarOpen(true);
        //     })
        //     .finally(() => {
        //         setLoading(false);
        //     });
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Store Settings
            </Typography>

            <Paper elevation={theme === 'dark' ? 3 : 1} sx={{ mb: 4, bgcolor: colorValues.bgSecondary }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="seller settings tabs"
                    variant={isMobile ? "fullWidth" : "standard"}
                    scrollButtons={isMobile ? "auto" : false}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<BusinessIcon />} iconPosition="start" label="Store Information" />
                    <Tab icon={<CreditCardIcon />} iconPosition="start" label="Payment Settings" />
                    <Tab icon={<PaletteIcon />} iconPosition="start" label="Theme Options" />
                </Tabs>

                {/* Store Information Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Store Name"
                                variant="outlined"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                helperText="This is how your store will appear to customers"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Store Email"
                                variant="outlined"
                                value={storeEmail}
                                onChange={(e) => setStoreEmail(e.target.value)}
                                type="email"
                                helperText="For customer service inquiries"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Store Phone"
                                variant="outlined"
                                value={storePhone}
                                onChange={(e) => setStorePhone(e.target.value)}
                                helperText="Optional contact number"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Store Description"
                                variant="outlined"
                                value={storeDescription}
                                onChange={(e) => setStoreDescription(e.target.value)}
                                multiline
                                rows={4}
                                helperText="Tell customers about your store (300 characters max)"
                                inputProps={{ maxLength: 300 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveSettings}
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Payment Settings Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                These payment details will be used for processing your seller payouts.
                                Make sure to provide accurate information.
                            </Alert>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Bank Name"
                                variant="outlined"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Account Number"
                                variant="outlined"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                type={showAccountNumber ? 'text' : 'password'}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowAccountNumber(!showAccountNumber)}
                                                edge="end"
                                            >
                                                {showAccountNumber ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveSettings}
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? 'Saving...' : 'Save Payment Information'}
                            </Button>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Theme Options Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Appearance
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                Customize the look and feel of your seller dashboard.
                            </Typography>
                        </Grid>
                        
                        {/* Light/Dark Mode Selection */}
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={theme === 'dark' ? 3 : 1}
                                sx={{
                                    bgcolor: theme === 'light' ? '#fff' : '#333',
                                    borderRadius: 2,
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: theme === 'light' ? '2px solid #1976d2' : '2px solid transparent',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    }
                                }}
                                onClick={() => toggleTheme('light')}
                            >
                                <Box 
                                    sx={{ 
                                        width: 200, 
                                        height: 120, 
                                        bgcolor: '#fff', 
                                        mb: 2,
                                        borderRadius: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Box sx={{ bgcolor: '#f0f0f0', height: '30%', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}></Box>
                                    <Box sx={{ p: 1, flexGrow: 1 }}>
                                        <Box sx={{ bgcolor: '#e0e0e0', width: '70%', height: 8, borderRadius: 1, mb: 1 }}></Box>
                                        <Box sx={{ bgcolor: '#e0e0e0', width: '100%', height: 6, borderRadius: 1, mb: 1 }}></Box>
                                        <Box sx={{ bgcolor: '#e0e0e0', width: '80%', height: 6, borderRadius: 1 }}></Box>
                                    </Box>
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    Light Theme
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Classic bright appearance
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={theme === 'dark' ? 3 : 1}
                                sx={{
                                    bgcolor: theme === 'dark' ? '#333' : '#fff',
                                    borderRadius: 2,
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: theme === 'dark' ? '2px solid #90caf9' : '2px solid transparent',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                    }
                                }}
                                onClick={() => toggleTheme('dark')}
                            >
                                <Box 
                                    sx={{ 
                                        width: 200, 
                                        height: 120, 
                                        bgcolor: '#333', 
                                        mb: 2,
                                        borderRadius: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <Box sx={{ bgcolor: '#222', height: '30%', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}></Box>
                                    <Box sx={{ p: 1, flexGrow: 1 }}>
                                        <Box sx={{ bgcolor: '#444', width: '70%', height: 8, borderRadius: 1, mb: 1 }}></Box>
                                        <Box sx={{ bgcolor: '#444', width: '100%', height: 6, borderRadius: 1, mb: 1 }}></Box>
                                        <Box sx={{ bgcolor: '#444', width: '80%', height: 6, borderRadius: 1 }}></Box>
                                    </Box>
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#fff' : 'inherit' }}>
                                    Dark Theme
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Modern dark appearance
                                </Typography>
                            </Paper>
                        </Grid>
                        
                        {/* Color Theme Variants */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Professional Color Themes
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                Choose a professional color scheme for your seller dashboard.
                            </Typography>
                        </Grid>
                        
                        {Object.entries(themeVariants).filter(([key]) => 
                            ['pink', 'purple', 'blue', 'green', 'orange'].includes(key)
                        ).map(([key, variant]) => (
                            <Grid item xs={12} sm={6} md={4} key={key}>
                                <Paper
                                    elevation={theme === 'dark' ? 3 : 1}
                                    sx={{
                                        bgcolor: colorValues.bgSecondary,
                                        borderRadius: 2,
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        border: themeVariant === key ? `2px solid ${variant[theme].primary}` : '2px solid transparent',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: theme === 'dark' ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                    onClick={() => changeThemeVariant(key)}
                                >
                                    {/* Color Preview */}
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Box 
                                            sx={{ 
                                                width: 24, 
                                                height: 24, 
                                                borderRadius: '50%',
                                                bgcolor: variant[theme].primary,
                                                boxShadow: 1
                                            }} 
                                        />
                                        <Box 
                                            sx={{ 
                                                width: 24, 
                                                height: 24, 
                                                borderRadius: '50%',
                                                bgcolor: variant[theme].secondary,
                                                boxShadow: 1
                                            }} 
                                        />
                                        <Box 
                                            sx={{ 
                                                width: 24, 
                                                height: 24, 
                                                borderRadius: '50%',
                                                bgcolor: variant[theme].accent,
                                                boxShadow: 1
                                            }} 
                                        />
                                    </Box>
                                    
                                    <Typography 
                                        variant="subtitle1" 
                                        sx={{ 
                                            fontWeight: themeVariant === key ? 'bold' : 'medium',
                                            color: themeVariant === key ? variant[theme].primary : 'inherit'
                                        }}
                                    >
                                        {variant.name}
                                    </Typography>
                                    
                                    {themeVariant === key && (
                                        <Typography variant="caption" color="primary">
                                            Active
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>
                        ))}
                        
                        <Grid item xs={12} sx={{ mt: 3 }}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="textSecondary" paragraph>
                                Your theme preferences will be automatically saved and applied to your seller dashboard.
                            </Typography>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Paper>
            
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default SellerSettings;
