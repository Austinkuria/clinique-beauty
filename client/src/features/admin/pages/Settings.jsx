import React, { useState, useContext } from 'react';
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
    CircularProgress,
    FormControlLabel,
    Switch
} from '@mui/material';
import { Save as SaveIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
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

function AdminSettings() {
    const { theme, themeVariant, themeVariants, toggleTheme, changeThemeVariant } = useContext(ThemeContext);
    const [tabValue, setTabValue] = useState(0);
    const [siteTitle, setSiteTitle] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [stripePublishableKey, setStripePublishableKey] = useState('');
    const [mailchimpApiKey, setMailchimpApiKey] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSaveAPIKeys = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert('API keys saved successfully!');
        }, 1000);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
                Settings
            </Typography>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="Site Settings" />
                    <Tab label="Admin Account" />
                    <Tab label="API Keys" />
                    <Tab label="Theme Settings" />
                </Tabs>

                {/* Site Settings Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Site Title"
                                variant="outlined"
                                value={siteTitle}
                                onChange={(e) => setSiteTitle(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Admin Account Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Admin Email"
                                variant="outlined"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* API Keys Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Stripe
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Stripe Secret Key"
                                variant="outlined"
                                value={stripeSecretKey}
                                onChange={(e) => setStripeSecretKey(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end" size="small">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Stripe Publishable Key"
                                variant="outlined"
                                value={stripePublishableKey}
                                onChange={(e) => setStripePublishableKey(e.target.value)}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Third-Party Services
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Mailchimp API Key"
                                variant="outlined"
                                value={mailchimpApiKey}
                                onChange={(e) => setMailchimpApiKey(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end" size="small">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveAPIKeys}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Save API Keys'}
                            </Button>
                        </Grid>
                    </Grid>
                </TabPanel>
                
                {/* Theme Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Appearance
                            </Typography>
                        </Grid>
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
                                Color Themes
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                Choose your preferred color scheme for the application.
                            </Typography>
                        </Grid>
                        
                        {Object.entries(themeVariants).map(([key, variant]) => (
                            <Grid item xs={12} sm={6} md={4} key={key}>
                                <Paper
                                    elevation={theme === 'dark' ? 3 : 1}
                                    sx={{
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
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Additional Settings
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                Customize additional appearance settings for your admin panel.
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={true}
                                        color="primary"
                                    />
                                }
                                label="Enable animations"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={true}
                                        color="primary"
                                    />
                                }
                                label="Compact sidebar"
                            />
                        </Grid>
                    </Grid>
                </TabPanel>
            </Paper>
        </Box>
    );
}

export default AdminSettings;