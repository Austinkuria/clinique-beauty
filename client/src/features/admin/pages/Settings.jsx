import React, { useState, useEffect, useContext } from 'react';
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
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Stack,
    Chip
} from '@mui/material';
import {
    Save as SaveIcon,
    Visibility as VisibilityIcon,
    FlashOn as FlashIcon,
    Storage as StorageIcon,
    CurrencyExchange as CurrencyIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { ThemeContext } from '../../../context/ThemeContext';
import { useAdminApi } from '../../../api/apiClient';
import { getActiveCurrency, setActiveCurrency, formatCurrency } from '../../../utils/helpers';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
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
    const { theme, colorValues, toggleTheme, changeThemeVariant } = useContext(ThemeContext);
    const adminApi = useAdminApi();
    const [tabValue, setTabValue] = useState(0);

    // Site & Currency State
    const [siteTitle, setSiteTitle] = useState('Clinique Beauty');
    const [siteCurrency, setSiteCurrency] = useState(getActiveCurrency());
    const [adminEmail, setAdminEmail] = useState('admin@clinique.com');

    // Flash Sale State
    const [flashSaleActive, setFlashSaleActive] = useState(true);
    const [flashSaleMinutes, setFlashSaleMinutes] = useState(480); // default 8 hours (480 mins)
    const [flashSaleEndsAt, setFlashSaleEndsAt] = useState('');
    const [flashSalePreviewTimer, setFlashSalePreviewTimer] = useState({ hours: '08', minutes: '00', seconds: '00' });

    // Seeding & Database State
    const [seedingLoading, setSeedingLoading] = useState(false);
    const [seedingResult, setSeedingResult] = useState(null);
    const [dbStatus, setDbStatus] = useState(null);

    // API Keys State
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [stripePublishableKey, setStripePublishableKey] = useState('');
    const [mailchimpApiKey, setMailchimpApiKey] = useState('');
    const [saving, setSaving] = useState(false);

    // Fetch existing settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await adminApi.getSettings();
                if (settings) {
                    if (settings.site_title) setSiteTitle(settings.site_title);
                    if (settings.site_currency) {
                        setSiteCurrency(settings.site_currency);
                        setActiveCurrency(settings.site_currency);
                    }
                    if (settings.flash_sale_ends_at) {
                        setFlashSaleEndsAt(settings.flash_sale_ends_at);
                    }
                    if (settings.flash_sale_active !== undefined) {
                        setFlashSaleActive(settings.flash_sale_active === 'true' || settings.flash_sale_active === true);
                    }
                }
            } catch (err) {
                console.warn('Could not load remote settings, using local defaults:', err.message);
            }
        };

        loadSettings();
    }, []);

    // Live countdown preview calculation
    useEffect(() => {
        const target = flashSaleEndsAt ? new Date(flashSaleEndsAt).getTime() : Date.now() + flashSaleMinutes * 60 * 1000;

        const updateTimer = () => {
            const diff = target - Date.now();
            if (diff <= 0) {
                setFlashSalePreviewTimer({ hours: '00', minutes: '00', seconds: '00' });
                return;
            }

            const totalHours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            setFlashSalePreviewTimer({
                hours: String(totalHours).padStart(2, '0'),
                minutes: String(mins).padStart(2, '0'),
                seconds: String(secs).padStart(2, '0')
            });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [flashSaleEndsAt, flashSaleMinutes]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Save Site & Currency Settings
    const handleSaveSiteSettings = async () => {
        setSaving(true);
        try {
            await adminApi.updateSettings({
                site_title: siteTitle,
                site_currency: siteCurrency
            });
            setActiveCurrency(siteCurrency);
            toast.success(`Site currency updated to ${siteCurrency}. Settings saved!`);
        } catch (err) {
            setActiveCurrency(siteCurrency);
            toast.success(`Currency set locally to ${siteCurrency}`);
        } finally {
            setSaving(false);
        }
    };

    // Save Flash Sale Settings
    const handleSetFlashDuration = (minutes) => {
        setFlashSaleMinutes(minutes);
        const newEndTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
        setFlashSaleEndsAt(newEndTime);
    };

    const handleSaveFlashSale = async () => {
        setSaving(true);
        try {
            const newEndTime = flashSaleEndsAt || new Date(Date.now() + flashSaleMinutes * 60 * 1000).toISOString();
            await adminApi.updateSettings({
                flash_sale_active: String(flashSaleActive),
                flash_sale_ends_at: newEndTime
            });
            setFlashSaleEndsAt(newEndTime);
            toast.success('Flash Sale timer updated successfully!');
        } catch (err) {
            toast.error('Failed to update flash sale settings');
        } finally {
            setSaving(false);
        }
    };

    // Seed database with mock users and catalog
    const handleSeedDatabase = async () => {
        setSeedingLoading(true);
        setSeedingResult(null);
        try {
            const res = await adminApi.seedDatabase();
            setSeedingResult(res?.message || 'Database successfully seeded with mock users and catalog!');
            toast.success('Database seeded successfully!');
        } catch (err) {
            setSeedingResult(`Error seeding database: ${err.message}`);
            toast.error('Seeding request failed');
        } finally {
            setSeedingLoading(false);
        }
    };

    // Fetch Database Records count
    const handleFetchDatabaseStatus = async () => {
        try {
            const [prods, users, orders] = await Promise.all([
                adminApi.getProducts().catch(() => []),
                adminApi.getUsers().catch(() => []),
                adminApi.getOrders().catch(() => [])
            ]);

            setDbStatus({
                products: Array.isArray(prods) ? prods.length : (prods?.data?.length || 0),
                users: Array.isArray(users) ? users.length : 0,
                orders: Array.isArray(orders) ? orders.length : 0
            });
            toast.success('Database records synchronized');
        } catch (err) {
            toast.error('Failed to query database records');
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: colorValues.textPrimary }}>
                Settings & Administration
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: colorValues.bgPaper,
                    overflow: 'hidden'
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: colorValues.bgDefault
                    }}
                >
                    <Tab label="Site & Currency" icon={<CurrencyIcon />} iconPosition="start" />
                    <Tab label="Flash Sale" icon={<FlashIcon />} iconPosition="start" />
                    <Tab label="Database & Seeding" icon={<StorageIcon />} iconPosition="start" />
                    <Tab label="Admin Account" />
                    <Tab label="Theme & Appearance" />
                </Tabs>

                {/* 1. Site & Currency Settings Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Site & Currency Configuration
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3 }}>
                        Configure the site title and default currency. Changing the currency updates all product cards, detail pages, and checkout calculations across the marketplace.
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Site Title"
                                variant="outlined"
                                value={siteTitle}
                                onChange={(e) => setSiteTitle(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="currency-select-label">Site Currency</InputLabel>
                                <Select
                                    labelId="currency-select-label"
                                    value={siteCurrency}
                                    label="Site Currency"
                                    onChange={(e) => setSiteCurrency(e.target.value)}
                                >
                                    <MenuItem value="KES">KES - Kenyan Shilling (KSh)</MenuItem>
                                    <MenuItem value="USD">USD - United States Dollar ($)</MenuItem>
                                    <MenuItem value="EUR">EUR - Euro (€)</MenuItem>
                                    <MenuItem value="GBP">GBP - British Pound (£)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 1.5,
                                    backgroundColor: colorValues.bgDefault,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                    Active Currency Preview
                                </Typography>
                                <Stack direction="row" spacing={3}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>Sample Product Price (2,500)</Typography>
                                        <Typography variant="h6" sx={{ color: colorValues.primary, fontWeight: 800 }}>
                                            {formatCurrency(2500, siteCurrency)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>Sample High-tier Order (18,499)</Typography>
                                        <Typography variant="h6" sx={{ color: colorValues.primary, fontWeight: 800 }}>
                                            {formatCurrency(18499, siteCurrency)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveSiteSettings}
                                disabled={saving}
                                sx={{
                                    backgroundColor: colorValues.primary,
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    px: 3,
                                    '&:hover': { backgroundColor: colorValues.primaryDark }
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Site Settings'}
                            </Button>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* 2. Flash Sale Configuration Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Homepage Flash Sale Countdown
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3 }}>
                        Control the Flash Sale timer displayed on the homepage. Set exact timeframes or use rapid presets to activate or renew campaigns.
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={flashSaleActive}
                                        onChange={(e) => setFlashSaleActive(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600 }}>
                                        Flash Sale Campaign Active
                                    </Typography>
                                }
                            />
                        </Grid>

                        {/* Live Countdown Display */}
                        <Grid item xs={12}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    backgroundColor: colorValues.bgDefault,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                                    Live Countdown Preview
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                                        Ends in:
                                    </Typography>
                                    <Box sx={{ bgcolor: colorValues.primary, color: '#fff', px: 1.2, py: 0.6, borderRadius: 1, fontWeight: 800 }}>
                                        {flashSalePreviewTimer.hours}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>:</Typography>
                                    <Box sx={{ bgcolor: colorValues.primary, color: '#fff', px: 1.2, py: 0.6, borderRadius: 1, fontWeight: 800 }}>
                                        {flashSalePreviewTimer.minutes}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>:</Typography>
                                    <Box sx={{ bgcolor: colorValues.primary, color: '#fff', px: 1.2, py: 0.6, borderRadius: 1, fontWeight: 800 }}>
                                        {flashSalePreviewTimer.seconds}
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* Preset Buttons */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                                Quick Duration Presets
                            </Typography>
                            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                                {[
                                    { label: '8 Minutes', mins: 8 },
                                    { label: '30 Minutes', mins: 30 },
                                    { label: '1 Hour', mins: 60 },
                                    { label: '4 Hours', mins: 240 },
                                    { label: '8 Hours', mins: 480 },
                                    { label: '24 Hours', mins: 1440 }
                                ].map((preset) => (
                                    <Chip
                                        key={preset.mins}
                                        label={preset.label}
                                        clickable
                                        color={flashSaleMinutes === preset.mins ? 'primary' : 'default'}
                                        onClick={() => handleSetFlashDuration(preset.mins)}
                                        sx={{ fontWeight: 600 }}
                                    />
                                ))}
                            </Stack>
                        </Grid>

                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveFlashSale}
                                disabled={saving}
                                sx={{
                                    backgroundColor: colorValues.primary,
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    px: 3,
                                    '&:hover': { backgroundColor: colorValues.primaryDark }
                                }}
                            >
                                {saving ? 'Saving...' : 'Apply Flash Sale Timer'}
                            </Button>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* 3. Database & Mock Data Seeding Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Database Synchronization & Mock Data Seeding
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3 }}>
                        Seed standard mock users (John Doe, Jane Smith, Robert Johnson, Michael Wilson, Sarah Brown, David Miller, Jennifer Lee) and the product catalog directly into Supabase so administrative dashboards and tables reflect real records.
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    backgroundColor: colorValues.bgDefault,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                    Current Database Records Status
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 3, my: 2, flexWrap: 'wrap' }}>
                                    <Box sx={{ minWidth: 140, p: 1.5, bgcolor: colorValues.bgPaper, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>Users in DB</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{dbStatus ? dbStatus.users : '8 (Mock Baseline)'}</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 140, p: 1.5, bgcolor: colorValues.bgPaper, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>Products in DB</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{dbStatus ? dbStatus.products : '7+ (Catalog)'}</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 140, p: 1.5, bgcolor: colorValues.bgPaper, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>Orders in DB</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{dbStatus ? dbStatus.orders : '0'}</Typography>
                                    </Box>
                                </Box>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleFetchDatabaseStatus}
                                    sx={{
                                        borderColor: colorValues.primary,
                                        color: colorValues.primary,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Check Live Database Records
                                </Button>
                            </Paper>
                        </Grid>

                        {seedingResult && (
                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                                    {seedingResult}
                                </Alert>
                            </Grid>
                        )}

                        <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={seedingLoading ? <CircularProgress size={18} color="inherit" /> : <StorageIcon />}
                                onClick={handleSeedDatabase}
                                disabled={seedingLoading}
                                sx={{
                                    backgroundColor: colorValues.primary,
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    px: 3,
                                    '&:hover': { backgroundColor: colorValues.primaryDark }
                                }}
                            >
                                {seedingLoading ? 'Seeding Database...' : 'Seed Mock Users & Products to Supabase'}
                            </Button>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* 4. Admin Account Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Admin Credentials
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
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

                {/* 5. Theme Settings Tab */}
                <TabPanel value={tabValue} index={4}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Theme & Visual Settings
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3 }}>
                        Choose the primary theme appearance and color mode.
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Paper
                                elevation={0}
                                onClick={() => toggleTheme('light')}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: '2px solid',
                                    borderColor: theme === 'light' ? colorValues.primary : 'divider',
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Light Theme
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666666' }}>
                                    Standard daytime storefront
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Paper
                                elevation={0}
                                onClick={() => toggleTheme('dark')}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: '2px solid',
                                    borderColor: theme === 'dark' ? colorValues.primary : 'divider',
                                    backgroundColor: '#1e1e1e',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Dark Theme
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#aaaaaa' }}>
                                    Low-light night storefront
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Paper>
        </Box>
    );
}

export default AdminSettings;
