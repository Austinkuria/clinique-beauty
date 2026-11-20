import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
    Grid,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
    Tabs,
    Tab,
    Alert,
    Divider,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Block as BlockIcon,
    PersonAdd as PersonAddIcon,
    Mail as MailIcon,
    Clear as ClearIcon,
    Check as CheckIcon,
    VerifiedUser as VerifiedIcon,
    FilterList as FilterListIcon,
    History as HistoryIcon,
    Assignment as AssignmentIcon,
    Campaign as CampaignIcon,
    Insights as InsightsIcon,
    LocationOn as LocationIcon,
    DateRange as DateRangeIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient';
import { formatCurrency } from '../../../utils/helpers';
import { toast } from 'react-hot-toast';
import StatCard from '../components/charts/StatCard';
import { mockDashboardData } from '../../../data/mockDashboardData';
import { mockUsers } from '../../../data/mockUserData';
import { 
    People as AllUsersIcon, 
    Person as CustomerIcon,
    Store as SellerIcon,
    AdminPanelSettings as AdminIcon 
} from '@mui/icons-material';
import UserEditDialog from '../components/users/UserEditDialog';
import UserActivityLog from '../components/users/UserActivityLog';
import UserSegmentation from '../components/users/UserSegmentation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function getUserInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function AdminUsers() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterDateRange, setFilterDateRange] = useState([null, null]);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [userStats, setUserStats] = useState(null);
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    
    // Define roles and statuses arrays for filters
    const roles = ['', 'Admin', 'Seller', 'Customer'];
    const statuses = ['', 'Active', 'Pending', 'Inactive'];
    
    // New state variables for enhanced features
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [activityLogOpen, setActivityLogOpen] = useState(false);
    const [segmentationOpen, setSegmentationOpen] = useState(false);
    const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
    const [showInactiveUsers, setShowInactiveUsers] = useState(false);
    const [locations, setLocations] = useState([]);
    
    // Add dialog content state
    const [dialogContent, setDialogContent] = useState({
        title: '',
        content: '',
        confirmText: '',
        confirmColor: 'primary'
    });
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch dynamic users from backend API
                let data;
                try {
                    data = await api.getUsers();
                } catch (apiError) {
                    console.error('Error fetching users from API:', apiError);
                    data = mockUsers;
                }
                
                const userList = Array.isArray(data) ? data : [];
                setUsers(userList);
                
                // Extract unique locations for filtering
                const uniqueLocations = [...new Set(userList.map(user => user.location || 'Nairobi'))];
                setLocations(['', ...uniqueLocations]);
            } catch (err) {
                console.error('Error in user data handling:', err);
                setUsers([]);
                setLocations(['']);
            }
        };
        
        fetchUsers();
    }, [api]);

    // Recalculate live user stats dynamically whenever users list changes
    useEffect(() => {
        const totalCount = users.length;
        const customersCount = users.filter(u => (u.role || '').toLowerCase() === 'customer').length;
        const sellersCount = users.filter(u => (u.role || '').toLowerCase() === 'seller').length;
        const adminsCount = users.filter(u => (u.role || '').toLowerCase() === 'admin').length;

        setUserStats({
            total: totalCount,
            growth: 5.1,
            customers: customersCount,
            sellers: sellersCount,
            admins: adminsCount
        });
    }, [users]);

    // Real-time Socket.IO synchronization
    useEffect(() => {
        let socket;
        try {
            const socketBase = import.meta.env.VITE_API_URL 
                ? new URL(import.meta.env.VITE_API_URL).origin 
                : 'http://localhost:5001';

            import('socket.io-client').then(({ io }) => {
                socket = io(socketBase, { withCredentials: true });
                socket.emit('join_admin');

                socket.on('admin:user_created', (newUser) => {
                    setUsers(prev => {
                        if (prev.some(u => u.id === newUser.id || (u.email && u.email === newUser.email))) return prev;
                        return [newUser, ...prev];
                    });
                });

                socket.on('admin:user_updated', (updatedUser) => {
                    setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
                });

                socket.on('admin:user_status_changed', ({ id, status }) => {
                    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
                });

                socket.on('admin:user_role_changed', ({ id, role }) => {
                    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: role.charAt(0).toUpperCase() + role.slice(1) } : u));
                });

                socket.on('admin:user_deleted', ({ id }) => {
                    setUsers(prev => prev.filter(u => u.id !== id));
                });
            }).catch(err => {
                console.warn('Socket connection skipped in client:', err);
            });
        } catch (e) {
            console.warn('Socket init exception:', e);
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);
    
    // Action dialog handlers
    const handleOpenActionDialog = (user, action) => {
        setSelectedUser(user);
        setActionType(action);
        
        // Set dialog content based on action
        if (action === 'suspend') {
            setDialogContent({
                title: 'Suspend User',
                content: `Are you sure you want to suspend ${user.name}? They will not be able to access their account.`,
                confirmText: 'Suspend User',
                confirmColor: 'error'
            });
        } else if (action === 'activate') {
            setDialogContent({
                title: 'Activate User',
                content: `Are you sure you want to activate ${user.name}? They will regain access to their account.`,
                confirmText: 'Activate User',
                confirmColor: 'success'
            });
        } else if (action === 'delete') {
            setDialogContent({
                title: 'Delete User Account',
                content: `Are you sure you want to permanently delete ${user.name}? This will remove their user record from the database.`,
                confirmText: 'Delete User',
                confirmColor: 'error'
            });
        }
        
        setActionDialogOpen(true);
    };
    
    const handleCloseActionDialog = () => {
        setActionDialogOpen(false);
        setSelectedUser(null);
        setActionType('');
    };
    
    const handlePerformAction = async () => {
        if (!selectedUser) return;
        try {
            if (actionType === 'delete') {
                await api.deleteUser(selectedUser.id);
                setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
                toast.success(`User ${selectedUser.name} has been deleted.`);
            } else {
                const targetStatus = actionType === 'suspend' ? 'Inactive' : 'Active';
                await api.updateUserStatus(selectedUser.id, targetStatus);
                const updatedUsers = users.map(user => {
                    if (user.id === selectedUser.id) {
                        return {
                            ...user,
                            status: targetStatus
                        };
                    }
                    return user;
                });
                setUsers(updatedUsers);
                const actionText = actionType === 'suspend' ? 'suspended' : 'activated';
                toast.success(`User ${selectedUser.name} has been ${actionText}.`);
            }
        } catch (error) {
            toast.error(`Action failed: ${error.message}`);
        } finally {
            handleCloseActionDialog();
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };
    
    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedUser(null);
    };
    
    const handleViewActivity = (user) => {
        setSelectedUser(user);
        setActivityLogOpen(true);
    };
    
    const handleCloseActivityLog = () => {
        setActivityLogOpen(false);
        setSelectedUser(null);
    };
    
    const handleOpenVerification = (user) => {
        setSelectedUser(user);
        setVerificationDialogOpen(true);
    };
    
    const handleCloseVerification = () => {
        setVerificationDialogOpen(false);
        setSelectedUser(null);
    };
    
    const handleVerifyUser = async () => {
        try {
            await api.verifyUser(selectedUser.id);
            // Update the user in the local state
            const updatedUsers = users.map(user => 
                user.id === selectedUser.id 
                    ? { ...user, verified: true } 
                    : user
            );
            setUsers(updatedUsers);
            toast.success(`${selectedUser.name} has been verified.`);
        } catch (error) {
            toast.error(`Failed to verify user: ${error.message}`);
        } finally {
            handleCloseVerification();
        }
    };
    
    const handleOpenSegmentation = () => {
        setSegmentationOpen(true);
    };
    
    const handleCloseSegmentation = () => {
        setSegmentationOpen(false);
    };
    
    const handleToggleAdvancedFilters = () => {
        setAdvancedFiltersOpen(!advancedFiltersOpen);
    };
    
    const handleToggleInactiveUsers = () => {
        setShowInactiveUsers(!showInactiveUsers);
    };
    
    const handleLocationFilterChange = (event) => {
        setFilterLocation(event.target.value);
        setPage(0);
    };
    
    const handleDateRangeChange = (newRange) => {
        setFilterDateRange(newRange);
        setPage(0);
    };
    
    // Enhanced filter function
    const filteredUsers = users.filter(user => {
        // Basic search
        const matchesSearch = search === '' || 
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            (user.id && user.id.toString().includes(search));
            
        // Basic filters
        const matchesRole = filterRole === '' || user.role === filterRole;
        const matchesStatus = filterStatus === '' || user.status === filterStatus;
        
        // Advanced filters
        const matchesLocation = filterLocation === '' || user.location === filterLocation;
        
        // Date range filter
        const [startDate, endDate] = filterDateRange;
        let matchesDateRange = true;
        if (startDate && endDate && user.joinDate) {
            const joinDate = new Date(user.joinDate);
            matchesDateRange = joinDate >= startDate && joinDate <= endDate;
        }
        
        // Inactive users filter
        const matchesActive = showInactiveUsers || user.status !== 'Inactive';
        
        // Tab filtering
        const matchesTab = 
            (tabValue === 0) || // All users
            (tabValue === 1 && user.role === 'Customer') || // Customers
            (tabValue === 2 && user.role === 'Seller') || // Sellers
            (tabValue === 3 && user.role === 'Admin'); // Admins
        
        return matchesSearch && matchesRole && matchesStatus && matchesTab && 
               matchesLocation && matchesDateRange && matchesActive;
    });
    
    const handleClearFilters = () => {
        setSearch('');
        setFilterRole('');
        setFilterStatus('');
        setFilterLocation('');
        setFilterDateRange([null, null]);
        setShowInactiveUsers(false);
    };
    
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(0); // Reset to first page when changing tabs
    };
    
    const handleChangePage = (event, newValue) => {
        setPage(newValue);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(0);
    };
    
    const handleRoleFilterChange = (event) => {
        setFilterRole(event.target.value);
        setPage(0);
    };
    
    const handleStatusFilterChange = (event) => {
        setFilterStatus(event.target.value);
        setPage(0);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>User Management</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<CampaignIcon />}
                        sx={{ mr: 2 }}
                        onClick={handleOpenSegmentation}
                    >
                        Segmentation
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PersonAddIcon />}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            px: 3
                        }}
                        onClick={() => handleEditUser({ role: 'Customer', status: 'Active' })} // Default values for new user
                    >
                        Add New User
                    </Button>
                </Box>
            </Box>
            
            {/* User Stats */}
            {userStats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard 
                            title="Total Users" 
                            value={userStats.total} 
                            icon={<AllUsersIcon />} 
                            color="primary"
                            percentChange={userStats.growth}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard 
                            title="Customers" 
                            value={userStats.customers} 
                            icon={<CustomerIcon />} 
                            color="info"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard 
                            title="Sellers" 
                            value={userStats.sellers} 
                            icon={<SellerIcon />} 
                            color="warning"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard 
                            title="Admins" 
                            value={userStats.admins} 
                            icon={<AdminIcon />} 
                            color="success"
                        />
                    </Grid>
                </Grid>
            )}
            
            {/* Tabs */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    mb: 4,
                    bgcolor: colorValues.bgPaper,
                    borderRadius: 2
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="All Users" />
                    <Tab label="Customers" />
                    <Tab label="Sellers" />
                    <Tab label="Admins" />
                </Tabs>
            </Paper>
            
            {/* Basic Filters */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    p: 3,
                    mb: 2,
                    bgcolor: colorValues.bgPaper,
                    borderRadius: 2
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search users by name, email, or ID..."
                            value={search}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="role-filter-label">Role</InputLabel>
                            <Select
                                labelId="role-filter-label"
                                value={filterRole}
                                onChange={handleRoleFilterChange}
                                label="Role"
                            >
                                {roles.map((role, index) => (
                                    <MenuItem key={index} value={role}>
                                        {role || 'All Roles'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="status-filter-label">Status</InputLabel>
                            <Select
                                labelId="status-filter-label"
                                value={filterStatus}
                                onChange={handleStatusFilterChange}
                                label="Status"
                            >
                                {statuses.map((status, index) => (
                                    <MenuItem key={index} value={status}>
                                        {status || 'All Statuses'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                onClick={handleToggleAdvancedFilters}
                                sx={{ width: '48%' }}
                            >
                                {advancedFiltersOpen ? 'Less' : 'More'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={handleClearFilters}
                                sx={{ width: '48%' }}
                            >
                                Clear
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
                
                {/* Advanced Filters */}
                {advancedFiltersOpen && (
                    <Box sx={{ mt: 3 }}>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel id="location-filter-label">Location</InputLabel>
                                    <Select
                                        labelId="location-filter-label"
                                        value={filterLocation}
                                        onChange={handleLocationFilterChange}
                                        label="Location"
                                    >
                                        {locations.map((location, index) => (
                                            <MenuItem key={index} value={location}>
                                                {location || 'All Locations'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <DatePicker
                                        label="Join Date From"
                                        value={filterDateRange[0]}
                                        onChange={(date) => setFilterDateRange([date, filterDateRange[1]])}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                    <Box sx={{ mx: 1, display: 'flex', alignItems: 'center' }}> to </Box>
                                    <DatePicker
                                        label="Join Date To"
                                        value={filterDateRange[1]}
                                        onChange={(date) => setFilterDateRange([filterDateRange[0], date])}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showInactiveUsers}
                                            onChange={handleToggleInactiveUsers}
                                            color="primary"
                                        />
                                    }
                                    label="Show Inactive Users"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>
            
            {/* Enhanced Users Table */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    width: '100%',
                    overflow: 'hidden',
                    bgcolor: colorValues.bgPaper,
                    borderRadius: 2
                }}
            >
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Verification</TableCell>
                                <TableCell align="right">Orders</TableCell>
                                <TableCell align="right">Total Spent</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar 
                                                    src={user.avatar || user.avatar_url || undefined} 
                                                    alt={user.name}
                                                    sx={{ 
                                                        width: 40, 
                                                        height: 40, 
                                                        mr: 2,
                                                        bgcolor: colorValues?.primary || 'primary.main',
                                                        color: '#ffffff',
                                                        fontWeight: 700,
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {getUserInitials(user.name)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={user.role} 
                                                size="small"
                                                sx={{
                                                    bgcolor: 
                                                        user.role === 'Admin' ? 'primary.main' :
                                                        user.role === 'Seller' ? 'info.main' :
                                                        'default',
                                                    color: 
                                                        user.role === 'Admin' || user.role === 'Seller' ? 'white' : 'inherit'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{user.joinDate}</TableCell>
                                        <TableCell>{user.location || 'Unknown'}</TableCell>
                                        <TableCell>
                                            {user.verified ? (
                                                <Chip 
                                                    icon={<VerifiedIcon />} 
                                                    label="Verified" 
                                                    size="small" 
                                                    color="success" 
                                                />
                                            ) : (
                                                <Chip 
                                                    label="Unverified" 
                                                    size="small" 
                                                    color="default" 
                                                    variant="outlined"
                                                    onClick={() => handleOpenVerification(user)}
                                                    sx={{ cursor: 'pointer' }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">{user.ordersCount || 0}</TableCell>
                                        <TableCell align="right">{formatCurrency(user.totalSpent || 0)}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={user.status} 
                                                size="small"
                                                sx={{
                                                    bgcolor: 
                                                        user.status === 'Active' ? 'success.main' :
                                                        user.status === 'Pending' ? 'warning.main' :
                                                        'error.main',
                                                    color: 'white'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit User">
                                                <IconButton 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="View Activity">
                                                <IconButton 
                                                    size="small" 
                                                    color="info"
                                                    onClick={() => handleViewActivity(user)}
                                                >
                                                    <HistoryIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Send Email">
                                                <IconButton 
                                                    size="small" 
                                                    color="default"
                                                    onClick={() => {
                                                        if (user.email) {
                                                            window.open(`mailto:${user.email}?subject=Clinique Beauty Customer Support`, '_blank');
                                                        }
                                                    }}
                                                >
                                                    <MailIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {user.status === 'Active' ? (
                                                <Tooltip title="Suspend User">
                                                    <IconButton 
                                                        size="small" 
                                                        color="warning"
                                                        onClick={() => handleOpenActionDialog(user, 'suspend')}
                                                    >
                                                        <BlockIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="Activate User">
                                                    <IconButton 
                                                        size="small" 
                                                        color="success"
                                                        onClick={() => handleOpenActionDialog(user, 'activate')}
                                                    >
                                                        <CheckIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Delete User">
                                                <IconButton 
                                                    size="small" 
                                                    color="error"
                                                    onClick={() => handleOpenActionDialog(user, 'delete')}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography variant="body1" sx={{ py: 2 }}>
                                            No users found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            
            {/* Action Confirmation Dialog */}
            <Dialog
                open={actionDialogOpen}
                onClose={handleCloseActionDialog}
            >
                <DialogTitle>
                    {dialogContent.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogContent.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseActionDialog}>Cancel</Button>
                    <Button 
                        onClick={handlePerformAction} 
                        color={dialogContent.confirmColor}
                        variant="contained"
                    >
                        {dialogContent.confirmText}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* User Verification Dialog */}
            <Dialog
                open={verificationDialogOpen}
                onClose={handleCloseVerification}
            >
                <DialogTitle>
                    Verify User
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to verify {selectedUser?.name}? 
                        This will grant them full access to their account.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseVerification}>Cancel</Button>
                    <Button 
                        onClick={handleVerifyUser} 
                        color="success"
                        variant="contained"
                        startIcon={<VerifiedIcon />}
                    >
                        Verify User
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* User Edit Dialog */}
            <UserEditDialog 
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                user={selectedUser}
                onSave={async (updatedUser) => {
                    try {
                        const isNewUser = !updatedUser.id;
                        if (isNewUser) {
                            const res = await api.createUser(updatedUser);
                            const created = res?.user || {
                                ...updatedUser,
                                id: `usr_${Date.now()}`,
                                joinDate: new Date().toISOString().split('T')[0]
                            };
                            setUsers(prev => [created, ...prev]);
                            toast.success('User created in database successfully!');
                        } else {
                            await api.updateUser(updatedUser.id, updatedUser);
                            setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
                            toast.success('User profile updated successfully in database!');
                        }
                    } catch (err) {
                        toast.error(`Save failed: ${err.message}`);
                    } finally {
                        handleCloseEditDialog();
                    }
                }}
            />
            
            {/* User Activity Log Dialog */}
            <UserActivityLog
                open={activityLogOpen}
                onClose={handleCloseActivityLog}
                userId={selectedUser?.id}
                userName={selectedUser?.name}
            />
            
            {/* User Segmentation Dialog */}
            <UserSegmentation
                open={segmentationOpen}
                onClose={handleCloseSegmentation}
                users={users}
            />
        </Box>
    );
}

export default AdminUsers;
