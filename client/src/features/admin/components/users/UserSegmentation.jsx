import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Paper,
    Divider,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tabs,
    Tab,
    FormControlLabel,
    Switch,
    Alert
} from '@mui/material';
import {
    Save as SaveIcon,
    Delete as DeleteIcon,
    PlayArrow as RunIcon,
    Mail as MailIcon,
    GetApp as DownloadIcon,
    Add as AddIcon,
    RemoveCircleOutline as RemoveIcon
} from '@mui/icons-material';
import { useApi } from '../../../../api/apiClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { toast } from 'react-hot-toast';
import { mockSegments as initialMockSegments } from '../../../../data/mockSegmentsData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const UserSegmentation = ({ open, onClose, users }) => {
    const api = useApi();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [segmentName, setSegmentName] = useState('');
    const [conditions, setConditions] = useState([
        { field: 'role', operator: 'equals', value: 'Customer' }
    ]);
    const [savedSegments, setSavedSegments] = useState([]);
    const [matchedUsers, setMatchedUsers] = useState([]);
    const [segmentStats, setSegmentStats] = useState(null);
    const [isSendingCampaign, setIsSendingCampaign] = useState(false);
    const [campaignSubject, setCampaignSubject] = useState('');
    const [campaignBody, setCampaignBody] = useState('');
    
    useEffect(() => {
        if (!open) return;
        
        // Load saved segments
        const fetchSavedSegments = async () => {
            setLoading(true);
            try {
                // In a real app, fetch from API
                // const data = await api.getSavedSegments();
                
                // Use the imported mock data
                setTimeout(() => {
                    setSavedSegments(initialMockSegments);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Error fetching saved segments:', error);
                setLoading(false);
            }
        };
        
        fetchSavedSegments();
    }, [open, api]);
    
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    const handleAddCondition = () => {
        setConditions([
            ...conditions,
            { field: 'role', operator: 'equals', value: '' }
        ]);
    };
    
    const handleRemoveCondition = (index) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };
    
    const handleConditionChange = (index, field, value) => {
        const updatedConditions = [...conditions];
        updatedConditions[index] = {
            ...updatedConditions[index],
            [field]: value
        };
        setConditions(updatedConditions);
    };
    
    const handleRunSegment = () => {
        setLoading(true);
        
        // Simple filtering logic based on conditions
        let filtered = [...users];
        
        conditions.forEach(condition => {
            if (condition.field && condition.operator && condition.value) {
                filtered = filtered.filter(user => {
                    switch (condition.operator) {
                        case 'equals':
                            return user[condition.field] === condition.value;
                        case 'notEquals':
                            return user[condition.field] !== condition.value;
                        case 'contains':
                            return user[condition.field] && user[condition.field].toString().toLowerCase().includes(condition.value.toLowerCase());
                        case 'greaterThan':
                            if (condition.field === 'totalSpent') {
                                return (user.totalSpent || 0) > parseFloat(condition.value);
                            } else if (condition.field === 'ordersCount') {
                                return (user.ordersCount || 0) > parseInt(condition.value);
                            }
                            return false;
                        case 'lessThan':
                            if (condition.field === 'totalSpent') {
                                return (user.totalSpent || 0) < parseFloat(condition.value);
                            } else if (condition.field === 'ordersCount') {
                                return (user.ordersCount || 0) < parseInt(condition.value);
                            }
                            return false;
                        default:
                            return true;
                    }
                });
            }
        });
        
        // Generate segment statistics
        const stats = {
            totalUsers: filtered.length,
            byRole: {},
            byLocation: {},
            byStatus: {},
            averageSpent: 0,
            totalSpent: 0
        };
        
        // Count users by role and other metrics
        filtered.forEach(user => {
            // Count by role
            stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
            
            // Count by location
            if (user.location) {
                stats.byLocation[user.location] = (stats.byLocation[user.location] || 0) + 1;
            }
            
            // Count by status
            if (user.status) {
                stats.byStatus[user.status] = (stats.byStatus[user.status] || 0) + 1;
            }
            
            // Sum total spent
            stats.totalSpent += user.totalSpent || 0;
        });
        
        // Calculate average
        if (filtered.length > 0) {
            stats.averageSpent = stats.totalSpent / filtered.length;
        }
        
        // Set results
        setMatchedUsers(filtered);
        setSegmentStats(stats);
        setLoading(false);
        
        // Switch to results tab if we have matches
        if (filtered.length > 0) {
            setActiveTab(2);
        }
    };
    
    const handleSaveSegment = () => {
        if (!segmentName) {
            toast.error('Please enter a segment name');
            return;
        }
        
        // Create new segment
        const newSegment = {
            id: Date.now(),
            name: segmentName,
            conditions: [...conditions],
            userCount: matchedUsers.length || 0
        };
        
        // Add to saved segments
        setSavedSegments([...savedSegments, newSegment]);
        
        // Reset form
        setSegmentName('');
        toast.success('Segment saved successfully');
        
        // Switch to saved segments tab
        setActiveTab(1);
    };
    
    const handleDeleteSegment = (segmentId) => {
        setSavedSegments(savedSegments.filter(segment => segment.id !== segmentId));
        toast.success('Segment deleted');
    };
    
    const handleLoadSegment = (segment) => {
        setSegmentName(segment.name);
        setConditions(segment.conditions);
        setActiveTab(0);
    };
    
    const handleSendCampaign = () => {
        if (!campaignSubject) {
            toast.error('Please enter a campaign subject');
            return;
        }
        
        if (!campaignBody) {
            toast.error('Please enter campaign content');
            return;
        }
        
        setIsSendingCampaign(true);
        
        // Simulate API call to send campaign
        setTimeout(() => {
            setIsSendingCampaign(false);
            toast.success(`Campaign sent to ${matchedUsers.length} users`);
            
            // Reset form
            setCampaignSubject('');
            setCampaignBody('');
        }, 2000);
    };
    
    const handleExportUsers = () => {
        // In a real app, you would generate a CSV or excel file
        // For this example, we'll just show a success message
        toast.success(`Exported ${matchedUsers.length} users to CSV`);
    };
    
    // Transform data for the pie charts
    const getRoleChartData = () => {
        if (!segmentStats) return [];
        
        return Object.entries(segmentStats.byRole).map(([role, count]) => ({
            name: role,
            value: count
        }));
    };
    
    const getLocationChartData = () => {
        if (!segmentStats) return [];
        
        return Object.entries(segmentStats.byLocation)
            .sort((a, b) => b[1] - a[1]) // Sort by count descending
            .slice(0, 5) // Take top 5
            .map(([location, count]) => ({
                name: location || 'Unknown',
                value: count
            }));
    };
    
    const getStatusChartData = () => {
        if (!segmentStats) return [];
        
        return Object.entries(segmentStats.byStatus).map(([status, count]) => ({
            name: status,
            value: count
        }));
    };
    
    // Available fields and operators for segmentation
    const fields = [
        { value: 'role', label: 'Role' },
        { value: 'status', label: 'Account Status' },
        { value: 'location', label: 'Location' },
        { value: 'verified', label: 'Verification Status' },
        { value: 'totalSpent', label: 'Total Spent' },
        { value: 'ordersCount', label: 'Order Count' },
        { value: 'email', label: 'Email' },
        { value: 'name', label: 'Name' }
    ];
    
    const operators = [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Does Not Equal' },
        { value: 'contains', label: 'Contains' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'lessThan', label: 'Less Than' }
    ];
    
    // Field-specific value options
    const getValueOptions = (field) => {
        switch (field) {
            case 'role':
                return [
                    { value: 'Customer', label: 'Customer' },
                    { value: 'Seller', label: 'Seller' },
                    { value: 'Admin', label: 'Admin' }
                ];
            case 'status':
                return [
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Suspended', label: 'Suspended' }
                ];
            case 'verified':
                return [
                    { value: true, label: 'Verified' },
                    { value: false, label: 'Not Verified' }
                ];
            default:
                return null; // No predefined options, use text input
        }
    };
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>
                User Segmentation & Marketing Groups
            </DialogTitle>
            <DialogContent dividers>
                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        <Tab label="Create Segment" />
                        <Tab label="Saved Segments" />
                        {matchedUsers.length > 0 && <Tab label="Results & Marketing" />}
                    </Tabs>
                </Paper>
                
                {activeTab === 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Create New User Segment
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Segment Name"
                                    value={segmentName}
                                    onChange={(e) => setSegmentName(e.target.value)}
                                    placeholder="e.g., High Value Customers"
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Conditions
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    {conditions.map((condition, index) => (
                                        <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                            <FormControl sx={{ minWidth: 150, mr: 2 }}>
                                                <InputLabel>Field</InputLabel>
                                                <Select
                                                    value={condition.field}
                                                    onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                                                    label="Field"
                                                >
                                                    {fields.map(field => (
                                                        <MenuItem key={field.value} value={field.value}>
                                                            {field.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            
                                            <FormControl sx={{ minWidth: 150, mr: 2 }}>
                                                <InputLabel>Operator</InputLabel>
                                                <Select
                                                    value={condition.operator}
                                                    onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                                                    label="Operator"
                                                >
                                                    {operators.map(op => (
                                                        <MenuItem key={op.value} value={op.value}>
                                                            {op.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            
                                            {getValueOptions(condition.field) ? (
                                                <FormControl sx={{ minWidth: 150, flexGrow: 1, mr: 2 }}>
                                                    <InputLabel>Value</InputLabel>
                                                    <Select
                                                        value={condition.value}
                                                        onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                                                        label="Value"
                                                    >
                                                        {getValueOptions(condition.field).map(option => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            ) : (
                                                <TextField
                                                    sx={{ flexGrow: 1, mr: 2 }}
                                                    label="Value"
                                                    value={condition.value}
                                                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                                                    placeholder={
                                                        condition.field === 'totalSpent' ? 'e.g., 100' :
                                                        condition.field === 'ordersCount' ? 'e.g., 5' :
                                                        'Enter value...'
                                                    }
                                                    type={
                                                        condition.field === 'totalSpent' ? 'number' :
                                                        condition.field === 'ordersCount' ? 'number' :
                                                        'text'
                                                    }
                                                />
                                            )}
                                            
                                            <IconButton 
                                                color="error" 
                                                onClick={() => handleRemoveCondition(index)}
                                                disabled={conditions.length === 1}
                                            >
                                                <RemoveIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddCondition}
                                        sx={{ mt: 1 }}
                                    >
                                        Add Condition
                                    </Button>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<RunIcon />}
                                    onClick={handleRunSegment}
                                    sx={{ mr: 2 }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Run Segment'}
                                </Button>
                                
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveSegment}
                                    disabled={!segmentName || loading}
                                >
                                    Save Segment
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}
                
                {activeTab === 1 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Saved User Segments
                        </Typography>
                        
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : savedSegments.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                No saved segments found. Create a new segment to get started.
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Segment Name</TableCell>
                                            <TableCell>Conditions</TableCell>
                                            <TableCell align="right">User Count</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {savedSegments.map((segment) => (
                                            <TableRow key={segment.id} hover>
                                                <TableCell>{segment.name}</TableCell>
                                                <TableCell>
                                                    {segment.conditions.map((condition, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={`${fields.find(f => f.value === condition.field)?.label || condition.field} ${operators.find(o => o.value === condition.operator)?.label || condition.operator} ${condition.value}`}
                                                            size="small"
                                                            sx={{ mr: 1, mb: 1 }}
                                                        />
                                                    ))}
                                                </TableCell>
                                                <TableCell align="right">{segment.userCount}</TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleLoadSegment(segment)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Load
                                                    </Button>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteSegment(segment.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}
                
                {activeTab === 2 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Segment Results: {matchedUsers.length} Users
                        </Typography>
                        
                        {segmentStats && (
                            <>
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Users by Role
                                            </Typography>
                                            <Box sx={{ height: 200 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={getRoleChartData()}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {getRoleChartData().map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => [value, 'Users']} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Users by Status
                                            </Typography>
                                            <Box sx={{ height: 200 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={getStatusChartData()}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {getStatusChartData().map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => [value, 'Users']} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Top Locations
                                            </Typography>
                                            <Box sx={{ height: 200 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={getLocationChartData()}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis type="number" />
                                                        <YAxis type="category" dataKey="name" />
                                                        <Tooltip formatter={(value) => [value, 'Users']} />
                                                        <Bar dataKey="value" fill="#8884d8">
                                                            {getLocationChartData().map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                                
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Segment Summary
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Total Users:</strong> {segmentStats.totalUsers}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Average Spent:</strong> ${segmentStats.averageSpent.toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Total Revenue:</strong> ${segmentStats.totalSpent.toFixed(2)}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={8}>
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Marketing Actions
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<MailIcon />}
                                                    onClick={() => {
                                                        document.getElementById('campaign-section').scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                >
                                                    Create Email Campaign
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={handleExportUsers}
                                                >
                                                    Export Users
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<SaveIcon />}
                                                    onClick={handleSaveSegment}
                                                    disabled={!segmentName}
                                                >
                                                    Save This Segment
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                                
                                <Box id="campaign-section">
                                    <Typography variant="h6" gutterBottom>
                                        Create Email Campaign
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Campaign Subject"
                                                    value={campaignSubject}
                                                    onChange={(e) => setCampaignSubject(e.target.value)}
                                                    placeholder="e.g., Special Offer for Our Valued Customers"
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Campaign Content"
                                                    value={campaignBody}
                                                    onChange={(e) => setCampaignBody(e.target.value)}
                                                    multiline
                                                    rows={6}
                                                    placeholder="Enter the content of your email campaign here..."
                                                />
                                            </Grid>
                                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<MailIcon />}
                                                    onClick={handleSendCampaign}
                                                    disabled={isSendingCampaign || !campaignSubject || !campaignBody}
                                                >
                                                    {isSendingCampaign ? (
                                                        <>Sending <CircularProgress size={20} sx={{ ml: 1 }} /></>
                                                    ) : (
                                                        `Send to ${matchedUsers.length} Users`
                                                    )}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Box>
                                
                                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                                    Matched Users
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Location</TableCell>
                                                <TableCell align="right">Orders</TableCell>
                                                <TableCell align="right">Total Spent</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {matchedUsers.slice(0, 10).map((user) => (
                                                <TableRow key={user.id} hover>
                                                    <TableCell>{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>{user.role}</TableCell>
                                                    <TableCell>{user.status}</TableCell>
                                                    <TableCell>{user.location || 'Unknown'}</TableCell>
                                                    <TableCell align="right">{user.ordersCount || 0}</TableCell>
                                                    <TableCell align="right">${user.totalSpent?.toFixed(2) || '0.00'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                
                                {matchedUsers.length > 10 && (
                                    <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                                        Showing 10 of {matchedUsers.length} users. Export for full list.
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserSegmentation;
