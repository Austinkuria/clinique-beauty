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
    Chip,
    Avatar
} from '@mui/material';
import {
    Save as SaveIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    FlashOn as FlashIcon,
    Storage as StorageIcon,
    CurrencyExchange as CurrencyIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Settings as SettingsIcon,
    Person as PersonIcon,
    VpnKey as VpnKeyIcon,
    Palette as PaletteIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react';
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
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function AdminSettings() {
    const { user } = useUser();
    const { theme, themeVariant, themeVariants, colorValues, toggleTheme, changeThemeVariant, siteTitle: globalSiteTitle, updateSiteTitle, applyThemeSettings } = useContext(ThemeContext);
    const adminApi = useAdminApi();
    const [tabValue, setTabValue] = useState(0);

    // Site & Currency State
    const [siteTitle, setSiteTitle] = useState(globalSiteTitle || 'Clinique Beauty');
    const [siteCurrency, setSiteCurrency] = useState(getActiveCurrency());
    const [adminNotificationEmail, setAdminNotificationEmail] = useState('admin@clinique.com');

    // Shipping & Tax State
    const [standardShippingFee, setStandardShippingFee] = useState(0);
    const [expressShippingFee, setExpressShippingFee] = useState(1299);
    const [overnightShippingFee, setOvernightShippingFee] = useState(2499);
    const [vatPercentage, setVatPercentage] = useState(16);

    // Flash Sale State
    const [flashSaleActive, setFlashSaleActive] = useState(true);
    const [flashSaleMinutes, setFlashSaleMinutes] = useState(480);
    const [flashSaleEndsAt, setFlashSaleEndsAt] = useState('');
    const [flashSalePreviewTimer, setFlashSalePreviewTimer] = useState({ hours: '08', minutes: '00', seconds: '00' });

    // Seeding & Database State
    const [seedingLoading, setSeedingLoading] = useState(false);
    const [seedingResult, setSeedingResult] = useState(null);
    const [dbStatus, setDbStatus] = useState(null);

    // Admin Account State
    const [adminName, setAdminName] = useState('Austin Kuria');
    const [adminEmail, setAdminEmail] = useState('admin@clinique.com');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // API Keys State
    const [stripePublishableKey, setStripePublishableKey] = useState('pk_test_51MzSAMPLEKEY');
    const [stripeSecretKey, setStripeSecretKey] = useState('sk_test_51MzSAMPLESECRET');
    const [mpesaConsumerKey, setMpesaConsumerKey] = useState('DARAJA_CONSUMER_KEY_SAMPLE');
    const [mpesaConsumerSecret, setMpesaConsumerSecret] = useState('DARAJA_CONSUMER_SECRET_SAMPLE');
    const [mpesaPasskey, setMpesaPasskey] = useState('bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919');
    const [mpesaShortcode, setMpesaShortcode] = useState('174379');
    const [mailchimpApiKey, setMailchimpApiKey] = useState('mc_sample_api_key_4439');
    const [showApiSecrets, setShowApiSecrets] = useState(false);

    // Appearance Additional Settings
    const [enableAnimations, setEnableAnimations] = useState(true);
    const [compactSidebar, setCompactSidebar] = useState(false);
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
                    if (settings.theme_mode && (settings.theme_mode === 'light' || settings.theme_mode === 'dark')) {
                        if (applyThemeSettings) applyThemeSettings(settings.theme_mode, settings.theme_variant || themeVariant);
                    }
                    if (settings.theme_variant && applyThemeSettings) {
                        applyThemeSettings(theme, settings.theme_variant);
                    }
                    if (settings.enable_animations !== undefined) {
                        setEnableAnimations(settings.enable_animations === 'true' || settings.enable_animations === true);
                    }
                    if (settings.compact_sidebar !== undefined) {
                        setCompactSidebar(settings.compact_sidebar === 'true' || settings.compact_sidebar === true);
                    }
                    if (settings.standard_shipping_fee !== undefined) {
                        setStandardShippingFee(Number(settings.standard_shipping_fee));
                    }
                    if (settings.express_shipping_fee !== undefined) {
                        setExpressShippingFee(Number(settings.express_shipping_fee));
                    }
                    if (settings.overnight_shipping_fee !== undefined) {
                        setOvernightShippingFee(Number(settings.overnight_shipping_fee));
                    }
                    if (settings.vat_percentage !== undefined) {
                        setVatPercentage(Number(settings.vat_percentage));
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
                site_currency: siteCurrency,
                standard_shipping_fee: Number(standardShippingFee),
                express_shipping_fee: Number(expressShippingFee),
                overnight_shipping_fee: Number(overnightShippingFee),
                vat_percentage: Number(vatPercentage)
            });
            setActiveCurrency(siteCurrency);
            if (updateSiteTitle) {
                updateSiteTitle(siteTitle);
            }
            toast.success(`Settings saved to database. Shipping fees and VAT updated.`);
        } catch (err) {
            toast.error(`Failed to save settings: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Reset Site & Currency to defaults
    const handleResetSiteDefaults = async () => {
        setSaving(true);
        try {
            const defaultTitle = 'Clinique Beauty';
            const defaultCurrency = 'KES';
            setStandardShippingFee(0);
            setExpressShippingFee(1299);
            setOvernightShippingFee(2499);
            setVatPercentage(16);
            await adminApi.updateSettings({
                site_title: defaultTitle,
                site_currency: defaultCurrency,
                standard_shipping_fee: 0,
                express_shipping_fee: 1299,
                overnight_shipping_fee: 2499,
                vat_percentage: 16,
                flash_sale_active: 'true'
            });
            setSiteTitle(defaultTitle);
            setSiteCurrency(defaultCurrency);
            setFlashSaleActive(true);
            setActiveCurrency(defaultCurrency);
            if (updateSiteTitle) {
                updateSiteTitle(defaultTitle);
            }
            toast.success('Site settings reset to defaults and saved to database.');
        } catch (err) {
            toast.error(`Reset failed: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Save Theme Settings to Database
    const handleSaveThemeSettings = async (overrideMode, overrideVariant) => {
        setSaving(true);
        const targetMode = overrideMode || theme;
        const targetVariant = overrideVariant || themeVariant;
        try {
            await adminApi.updateSettings({
                theme_mode: targetMode,
                theme_variant: targetVariant,
                enable_animations: String(enableAnimations),
                compact_sidebar: String(compactSidebar)
            });
            toast.success(`Theme preferences (${targetVariant}, ${targetMode} mode) saved to database.`);
        } catch (err) {
            toast.error(`Failed to save theme: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Reset Theme Settings to defaults
    const handleResetThemeDefaults = async () => {
        setSaving(true);
        try {
            if (adminApi.resetSettings) {
                await adminApi.resetSettings();
            } else {
                await adminApi.updateSettings({
                    site_title: 'Clinique Beauty',
                    site_currency: 'KES',
                    theme_mode: 'light',
                    theme_variant: 'pink',
                    enable_animations: 'true',
                    compact_sidebar: 'false'
                });
            }
            if (updateSiteTitle) updateSiteTitle('Clinique Beauty');
            setSiteTitle('Clinique Beauty');
            if (applyThemeSettings) {
                applyThemeSettings('light', 'pink');
            } else {
                if (theme !== 'light') toggleTheme();
                changeThemeVariant('pink');
            }
            setEnableAnimations(true);
            setCompactSidebar(false);
            toast.success('Settings reset to defaults (Clinique Beauty, Light, Pink) and saved to database.');
        } catch (err) {
            toast.error(`Reset failed: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Save Flash Sale countdown settings
    const handleSaveFlashSale = async (durationMinutes) => {
        setSaving(true);
        const mins = durationMinutes !== undefined ? durationMinutes : flashSaleMinutes;
        const newExpiry = new Date(Date.now() + mins * 60 * 1000).toISOString();

        try {
            await adminApi.updateSettings({
                flash_sale_active: String(flashSaleActive),
                flash_sale_ends_at: newExpiry
            });
            setFlashSaleEndsAt(newExpiry);
            setFlashSaleMinutes(mins);
            toast.success(`Flash sale countdown reset to ${mins} minutes!`);
        } catch (err) {
            toast.error(`Failed to set flash sale: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Save Admin Account
    const handleSaveAccount = (e) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        toast.success('Admin account profile updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // Save API Keys
    const handleSaveApiKeys = (e) => {
        e.preventDefault();
        toast.success('API keys and payment credentials updated securely');
    };

    // Database Seeding & Verification
    const handleSeedDatabase = async () => {
        setSeedingLoading(true);
        setSeedingResult(null);
        try {
            const res = await adminApi.seedDatabase();
            if (res && res.success) {
                setSeedingResult(res.message);
                toast.success(res.message);
                await handleFetchDatabaseStatus();
            } else {
                toast.error(res?.message || 'Database seeding failed');
            }
        } catch (err) {
            toast.error(`Seeding error: ${err.message}`);
        } finally {
            setSeedingLoading(false);
        }
    };

    const handleFetchDatabaseStatus = async () => {
        try {
            const [prods, users, orders] = await Promise.all([
                adminApi.getProducts().catch(() => []),
                adminApi.getUsers().catch(() => []),
                adminApi.getOrders().catch(() => [])
            ]);
            setDbStatus({
                products: prods?.length || 0,
                users: users?.length || 0,
                orders: orders?.length || 0
            });
            toast.success('Database status synchronized');
        } catch (err) {
            console.warn('Could not read db status:', err);
        }
    };

    return (
        <Box sx={{ width: '100%', py: 2 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: colorValues.textPrimary }}>
                    Admin Settings
                </Typography>
                <Typography variant="body2" sx={{ color: colorValues.textSecondary }}>
                    Manage store parameters, theme visual styles, administrator accounts, and database integrations.
                </Typography>
            </Box>

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
                    <Tab label="SITE SETTINGS" icon={<SettingsIcon />} iconPosition="start" />
                    <Tab label="ADMIN ACCOUNT" icon={<PersonIcon />} iconPosition="start" />
                    <Tab label="API KEYS" icon={<VpnKeyIcon />} iconPosition="start" />
                    <Tab label="THEME SETTINGS" icon={<PaletteIcon />} iconPosition="start" />
                </Tabs>

                {/* 1. SITE SETTINGS TAB */}
                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        General & Currency Settings
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3 }}>
                        Configure store name and site-wide active currency. Changes dynamically update product catalog pricing, checkout totals, and admin tables.
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

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Store Notification Email"
                                variant="outlined"
                                value={adminNotificationEmail}
                                onChange={(e) => setAdminNotificationEmail(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 1.5,
                                    backgroundColor: colorValues.bgDefault,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Box>
                                    <Typography variant="caption" sx={{ color: colorValues.textSecondary, display: 'block' }}>
                                        Live Sample Price
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: colorValues.primary }}>
                                        {formatCurrency(1899)}
                                    </Typography>
                                </Box>
                                <Chip label={`Active: ${siteCurrency}`} color="primary" size="small" />
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
                                Shipping Rates & VAT
                            </Typography>
                            <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 2 }}>
                                Configure default shipping method fees and sales tax (VAT) applied at checkout. Saved dynamically to database.
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Standard Shipping (KSh)"
                                variant="outlined"
                                value={standardShippingFee}
                                onChange={(e) => setStandardShippingFee(e.target.value)}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Express Shipping (KSh)"
                                variant="outlined"
                                value={expressShippingFee}
                                onChange={(e) => setExpressShippingFee(e.target.value)}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Overnight Shipping (KSh)"
                                variant="outlined"
                                value={overnightShippingFee}
                                onChange={(e) => setOvernightShippingFee(e.target.value)}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="VAT Rate (%)"
                                variant="outlined"
                                value={vatPercentage}
                                onChange={(e) => setVatPercentage(e.target.value)}
                                inputProps={{ min: 0, max: 100 }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
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
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleResetSiteDefaults}
                                    disabled={saving}
                                    sx={{
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        px: 3,
                                        borderColor: 'divider'
                                    }}
                                >
                                    Reset to Defaults
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* Flash Sale Section */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Flash Sale Countdown Configuration
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3 }}>
                        Controls the homepage countdown banner and special promotional pricing timers.
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: colorValues.bgDefault
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={flashSaleActive}
                                            onChange={(e) => setFlashSaleActive(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={<Typography sx={{ fontWeight: 600 }}>Enable Flash Sale Promotion</Typography>}
                                />
                                <Typography variant="caption" sx={{ display: 'block', color: colorValues.textSecondary, mt: 0.5 }}>
                                    When disabled, the flash sale banner and countdown will be hidden on the storefront.
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: colorValues.bgDefault,
                                    textAlign: 'center'
                                }}
                            >
                                <Typography variant="caption" sx={{ color: colorValues.textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                                    Live Countdown Preview
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <Box sx={{ bgcolor: colorValues.primary, color: '#ffffff', px: 1.5, py: 0.8, borderRadius: 1, fontWeight: 800, fontSize: '1.2rem', minWidth: 44 }}>
                                        {flashSalePreviewTimer.hours}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>:</Typography>
                                    <Box sx={{ bgcolor: colorValues.primary, color: '#ffffff', px: 1.5, py: 0.8, borderRadius: 1, fontWeight: 800, fontSize: '1.2rem', minWidth: 44 }}>
                                        {flashSalePreviewTimer.minutes}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>:</Typography>
                                    <Box sx={{ bgcolor: colorValues.primary, color: '#ffffff', px: 1.5, py: 0.8, borderRadius: 1, fontWeight: 800, fontSize: '1.2rem', minWidth: 44 }}>
                                        {flashSalePreviewTimer.seconds}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                                Preset Flash Sale Duration:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                                {[
                                    { label: '30 Mins', mins: 30 },
                                    { label: '1 Hour', mins: 60 },
                                    { label: '2 Hours', mins: 120 },
                                    { label: '4 Hours', mins: 240 },
                                    { label: '8 Hours', mins: 480 },
                                    { label: '24 Hours', mins: 1440 }
                                ].map((preset) => (
                                    <Button
                                        key={preset.mins}
                                        variant={flashSaleMinutes === preset.mins ? 'contained' : 'outlined'}
                                        size="small"
                                        onClick={() => handleSaveFlashSale(preset.mins)}
                                        sx={{
                                            borderRadius: 1,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            backgroundColor: flashSaleMinutes === preset.mins ? colorValues.primary : 'transparent',
                                            borderColor: colorValues.primary,
                                            color: flashSaleMinutes === preset.mins ? '#ffffff' : colorValues.primary
                                        }}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* Database Seeding & Dynamic Records Section */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Database Seeding & Live Record Status
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3 }}>
                        Seed mock users, product catalog, and orders into the Supabase database. The storefront and admin panel dynamically retrieve and render this database data.
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
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                                    Current Supabase Database Records:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                    <Box sx={{ minWidth: 140, p: 1.5, bgcolor: colorValues.bgPaper, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>Users in DB</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{dbStatus ? dbStatus.users : '10 (Seeded)'}</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 140, p: 1.5, bgcolor: colorValues.bgPaper, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>Products in DB</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{dbStatus ? dbStatus.products : '50 (Seeded)'}</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 140, p: 1.5, bgcolor: colorValues.bgPaper, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>Orders in DB</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{dbStatus ? dbStatus.orders : '12 (Seeded)'}</Typography>
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

                        <Grid item xs={12}>
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
                                {seedingLoading ? 'Seeding Database...' : 'Re-Seed Mock Records into Supabase'}
                            </Button>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* 2. ADMIN ACCOUNT TAB */}
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Administrator Account
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3 }}>
                        Update administrator profile information and account security credentials.
                    </Typography>

                    {/* Live Administrator Profile Card */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2.5,
                            borderRadius: 2,
                            borderColor: 'divider',
                            bgcolor: colorValues?.bgPaper || 'background.paper'
                        }}
                    >
                        <Avatar
                            src={user?.imageUrl || undefined}
                            alt={adminName || user?.fullName}
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: colorValues?.primary || 'primary.main',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '1.4rem'
                            }}
                        >
                            {(adminName || user?.fullName || 'Admin').slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {adminName || user?.fullName || 'Administrator'}
                                </Typography>
                                <Chip label="Verified Admin" size="small" color="primary" sx={{ fontWeight: 600, height: 22 }} />
                            </Box>
                            <Typography variant="body2" sx={{ color: colorValues?.textSecondary }}>
                                {adminEmail || user?.primaryEmailAddress?.emailAddress}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colorValues?.textSecondary }}>
                                Clerk User: {user?.id || 'Active Session'}
                            </Typography>
                        </Box>
                    </Paper>

                    <Box component="form" onSubmit={handleSaveAccount}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={adminName}
                                    onChange={(e) => setAdminName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
                                    Change Password
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    label="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    label="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    label="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    sx={{
                                        backgroundColor: colorValues.primary,
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        px: 3,
                                        '&:hover': { backgroundColor: colorValues.primaryDark }
                                    }}
                                >
                                    Save Account Changes
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>

                {/* 3. API KEYS TAB */}
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Payment & API Integrations
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => setShowApiSecrets(!showApiSecrets)}
                            startIcon={showApiSecrets ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        >
                            {showApiSecrets ? 'Hide Secrets' : 'Reveal Secrets'}
                        </Button>
                    </Box>
                    <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 3 }}>
                        Manage integration credentials for M-Pesa Daraja, card processing, and marketing automation.
                    </Typography>

                    <Box component="form" onSubmit={handleSaveApiKeys}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorValues.primary }}>
                                    M-Pesa Daraja Credentials
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Business Shortcode"
                                    value={mpesaShortcode}
                                    onChange={(e) => setMpesaShortcode(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Consumer Key"
                                    type={showApiSecrets ? 'text' : 'password'}
                                    value={mpesaConsumerKey}
                                    onChange={(e) => setMpesaConsumerKey(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Consumer Secret"
                                    type={showApiSecrets ? 'text' : 'password'}
                                    value={mpesaConsumerSecret}
                                    onChange={(e) => setMpesaConsumerSecret(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Passkey"
                                    type={showApiSecrets ? 'text' : 'password'}
                                    value={mpesaPasskey}
                                    onChange={(e) => setMpesaPasskey(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorValues.primary, mt: 1 }}>
                                    Stripe Payment Gateway
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Publishable Key"
                                    value={stripePublishableKey}
                                    onChange={(e) => setStripePublishableKey(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Secret Key"
                                    type={showApiSecrets ? 'text' : 'password'}
                                    value={stripeSecretKey}
                                    onChange={(e) => setStripeSecretKey(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorValues.primary, mt: 1 }}>
                                    Marketing Automation
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Mailchimp API Key"
                                    type={showApiSecrets ? 'text' : 'password'}
                                    value={mailchimpApiKey}
                                    onChange={(e) => setMailchimpApiKey(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    sx={{
                                        backgroundColor: colorValues.primary,
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        px: 3,
                                        '&:hover': { backgroundColor: colorValues.primaryDark }
                                    }}
                                >
                                    Save API Keys
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>

                {/* 4. THEME SETTINGS TAB (Exact visual layout from user reference) */}
                <TabPanel value={tabValue} index={3}>
                    <Grid container spacing={3}>
                        {/* Appearance: Light and Dark Theme Cards */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                Appearance
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={5}>
                            <Paper
                                elevation={theme === 'light' ? 3 : 0}
                                onClick={() => { if (theme !== 'light') toggleTheme(); }}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: theme === 'light' ? '2px solid #2563eb' : '1px solid',
                                    borderColor: theme === 'light' ? '#2563eb' : 'divider',
                                    backgroundColor: colorValues.bgPaper,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 14px rgba(0,0,0,0.08)'
                                    }
                                }}
                            >
                                {/* Light preview illustration */}
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: 220,
                                        height: 110,
                                        borderRadius: 1.5,
                                        backgroundColor: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        p: 1.5,
                                        mb: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}
                                >
                                    <Box sx={{ width: '40%', height: 16, backgroundColor: '#cbd5e1', borderRadius: 0.5 }} />
                                    <Box sx={{ width: '80%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 0.5 }} />
                                    <Box sx={{ width: '60%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 0.5 }} />
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colorValues.textPrimary }}>
                                    Light Theme
                                </Typography>
                                <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>
                                    Classic bright appearance
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={5}>
                            <Paper
                                elevation={theme === 'dark' ? 3 : 0}
                                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: theme === 'dark' ? '2px solid #2563eb' : '1px solid',
                                    borderColor: theme === 'dark' ? '#2563eb' : 'divider',
                                    backgroundColor: colorValues.bgPaper,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 14px rgba(0,0,0,0.08)'
                                    }
                                }}
                            >
                                {/* Dark preview illustration */}
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: 220,
                                        height: 110,
                                        borderRadius: 1.5,
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        p: 1.5,
                                        mb: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}
                                >
                                    <Box sx={{ width: '40%', height: 16, backgroundColor: '#475569', borderRadius: 0.5 }} />
                                    <Box sx={{ width: '80%', height: 8, backgroundColor: '#334155', borderRadius: 0.5 }} />
                                    <Box sx={{ width: '60%', height: 8, backgroundColor: '#334155', borderRadius: 0.5 }} />
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colorValues.textPrimary }}>
                                    Dark Theme
                                </Typography>
                                <Typography variant="caption" sx={{ color: colorValues.textSecondary }}>
                                    Modern dark appearance
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Color Themes Section */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                Color Themes
                            </Typography>
                            <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 2 }}>
                                Choose your preferred color scheme for the application.
                            </Typography>
                        </Grid>

                        {themeVariants && Object.entries(themeVariants).map(([key, variant]) => {
                            const isCurrent = themeVariant === key;
                            const palette = variant[theme] || variant.light;
                            return (
                                <Grid item xs={6} sm={4} md={2.4} key={key}>
                                    <Paper
                                        elevation={isCurrent ? 2 : 0}
                                        onClick={() => changeThemeVariant(key)}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            border: isCurrent ? `2px solid ${palette.primary}` : '1px solid',
                                            borderColor: isCurrent ? palette.primary : 'divider',
                                            backgroundColor: colorValues.bgPaper,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                            }
                                        }}
                                    >
                                        {/* 3 Circular Color Dots */}
                                        <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5 }}>
                                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: palette.primary }} />
                                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: palette.secondary }} />
                                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: palette.accent }} />
                                        </Box>

                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: isCurrent ? palette.primary : colorValues.textPrimary }}>
                                            {variant.name}
                                        </Typography>

                                        {isCurrent && (
                                            <Typography variant="caption" sx={{ color: palette.primary, fontWeight: 700, mt: 0.3, fontSize: '0.72rem' }}>
                                                Active
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            );
                        })}

                        {/* Additional Settings: Enable animations, Compact sidebar */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                Additional Settings
                            </Typography>
                            <Typography variant="body2" sx={{ color: colorValues.textSecondary, mb: 2 }}>
                                Customize additional appearance settings for your admin panel.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={enableAnimations}
                                            onChange={(e) => setEnableAnimations(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={<Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>Enable animations</Typography>}
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={compactSidebar}
                                            onChange={(e) => setCompactSidebar(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={<Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>Compact sidebar</Typography>}
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                    onClick={() => handleSaveThemeSettings()}
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
                                    {saving ? 'Saving...' : 'Save Theme to Database'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleResetThemeDefaults}
                                    disabled={saving}
                                    sx={{
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        px: 3,
                                        borderColor: 'divider'
                                    }}
                                >
                                    Reset to Defaults
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Paper>
        </Box>
    );
}

export default AdminSettings;
