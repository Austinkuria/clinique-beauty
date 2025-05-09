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
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Block as BlockIcon,
    PersonAdd as PersonAddIcon,
    Mail as MailIcon,
    Clear as ClearIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import StatCard from '../components/charts/StatCard';
import { mockDashboardData } from '../../../data/mockDashboardData';
import { 
    People as AllUsersIcon, 
    Person as CustomerIcon,
    Store as SellerIcon,
    AdminPanelSettings as AdminIcon 
} from '@mui/icons-material';

function AdminUsers() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState(null);
    const [userStats, setUserStats] = useState(null);
    
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use the API client to fetch real users instead of mock data
                const data = await api.getUsers();
                setUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err.message || 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, [api]);
    
    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                // In a real app, fetch these stats from your API
                // For now, use mocked data
                setUserStats({
                    total: mockDashboardData.stats.users.total,
                    growth: mockDashboardData.stats.users.growth,
                    customers: Math.round(mockDashboardData.stats.users.total * 0.85),
                    sellers: Math.round(mockDashboardData.stats.users.total * 0.12),
                    admins: Math.round(mockDashboardData.stats.users.total * 0.03)
                });
            } catch (error) {
                console.error('Error fetching user stats:', error);
            }
        };
        
        fetchUserStats();
    }, []);
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
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
    
    const handleOpenActionDialog = (user, action) => {
        setSelectedUser(user);
        setActionType(action);
        setActionDialogOpen(true);
    };
    
    const handleCloseActionDialog = () => {
        setActionDialogOpen(false);
        setSelectedUser(null);
        setActionType('');
    };
    
    const handlePerformAction = async () => {
        setLoading(true);
        try {
            // Use the real API endpoints based on the action type
            if (actionType === 'suspend') {
                await api.suspendUser(selectedUser.id);
            } else if (actionType === 'activate') {
                await api.activateUser(selectedUser.id);
            }
            
            // Refresh the user list after a successful action
            const updatedUsers = await api.getUsers();
            setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
            toast.success(`User ${actionType === 'suspend' ? 'suspended' : 'activated'} successfully!`);
        } catch (err) {
            console.error(`Error ${actionType}ing user:`, err);
            toast.error(`Failed to ${actionType} user: ${err.message}`);
        } finally {
            setLoading(false);
            handleCloseActionDialog();
        }
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setFilterRole('');
        setFilterStatus('');
    };
    
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    
    // Filter and search users
    const filteredUsers = users.filter(user => {
        const matchesSearch = search === '' || 
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
            
        const matchesRole = filterRole === '' || user.role === filterRole;
        const matchesStatus = filterStatus === '' || user.status === filterStatus;
        
        // Filter by tab
        const matchesTab = 
            (tabValue === 0) || // All users
            (tabValue === 1 && user.role === 'Customer') || // Customers
            (tabValue === 2 && user.role === 'Seller') || // Sellers
            (tabValue === 3 && user.role === 'Admin'); // Admins
        
        return matchesSearch && matchesRole && matchesStatus && matchesTab;
    });
    
    // Get unique roles and statuses for filters
    const roles = ['', ...new Set(users.map(u => u.role))];
    const statuses = ['', ...new Set(users.map(u => u.status))];
    
    // Generate dialog content based on action type
    const getDialogContent = () => {
        if (actionType === 'suspend') {
            return {
                title: 'Suspend User',
                content: `Are you sure you want to suspend "${selectedUser?.name}"? They will no longer be able to log in or make purchases.`,
                confirmText: 'Suspend',
                confirmColor: 'error'
            };
        } else if (actionType === 'activate') {
            return {
                title: 'Activate User',
                content: `Are you sure you want to activate "${selectedUser?.name}"? They will regain full access to their account.`,
                confirmText: 'Activate',
                confirmColor: 'success'
            };
        }
        return {};
    };
    
    const dialogContent = getDialogContent();
    
    // Display loading state
    if (loading && users.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    // Show error if there's an issue loading users
    if (error && users.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button 
                    variant="contained"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </Box>
        );
    }
    
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Users</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        px: 3
                    }}
                >
                    Add New User
                </Button>
            </Box>
            
            {/* Add User Stats */}
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
            
            {/* Filters and Search */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: colorValues.bgPaper,
                    borderRadius: 2
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search users..."
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
                    <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClearFilters}
                            sx={{ width: '100%' }}
                        >
                            Clear Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            
            {/* Users Table */}
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
                                                    src={user.avatar} 
                                                    alt={user.name}
                                                    sx={{ width: 40, height: 40, mr: 2 }}
                                                />
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
                                        <TableCell align="right">{user.ordersCount}</TableCell>
                                        <TableCell align="right">${user.totalSpent.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={user.status} 
                                                size="small"
                                                sx={{
                                                    bgcolor: 
                                                        user.status === 'Active' ? 'success.main' :
                                                        'error.main',
                                                    color: 'white'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit User">
                                                <IconButton size="small" color="primary">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Send Email">
                                                <IconButton size="small" color="info">
                                                    <MailIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {user.status === 'Active' ? (
                                                <Tooltip title="Suspend User">
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
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
                    rowsPerPageOptions={[5, , 25]}
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
        </Box>
    );
}

export default AdminUsers;
