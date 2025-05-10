import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Divider,
    Typography,
    Box,
    Avatar,
    IconButton,
    Chip
} from '@mui/material';
import {
    PhotoCamera as UploadIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useApi } from '../../../../api/apiClient';

const UserEditDialog = ({ open, onClose, user, onSave }) => {
    const api = useApi();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Customer',
        status: 'Active',
        location: '',
        phone: '',
        permissions: [],
        verified: false,
        allowMarketing: true,
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Initialize form data when the user prop changes
    useEffect(() => {
        if (user) {
            setFormData({
                ...formData,
                ...user,
                // Set defaults for any missing fields
                role: user.role || 'Customer',
                status: user.status || 'Active',
                permissions: user.permissions || [],
                verified: user.verified || false,
                allowMarketing: user.allowMarketing !== undefined ? user.allowMarketing : true
            });
        }
    }, [user]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };
    
    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked
        });
    };
    
    const handlePermissionToggle = (permission) => {
        const permissions = formData.permissions || [];
        if (permissions.includes(permission)) {
            setFormData({
                ...formData,
                permissions: permissions.filter(p => p !== permission)
            });
        } else {
            setFormData({
                ...formData,
                permissions: [...permissions, permission]
            });
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        try {
            // In a real app, you would send the data to your API
            // const result = await api.saveUser(formData);
            
            // For now, we'll just simulate a successful save
            setTimeout(() => {
                onSave(formData);
                setIsSubmitting(false);
            }, 800);
        } catch (error) {
            console.error('Error saving user:', error);
            setIsSubmitting(false);
        }
    };
    
    // Available permissions
    const availablePermissions = [
        'view_dashboard',
        'manage_products',
        'manage_orders',
        'manage_users',
        'view_reports',
        'edit_settings'
    ];
    
    // Display friendly permission name
    const getPermissionName = (permission) => {
        const permissionNames = {
            'view_dashboard': 'View Dashboard',
            'manage_products': 'Manage Products',
            'manage_orders': 'Manage Orders',
            'manage_users': 'Manage Users',
            'view_reports': 'View Reports',
            'edit_settings': 'Edit Settings'
        };
        return permissionNames[permission] || permission;
    };
    
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>{formData.id ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Basic Information
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            name="name"
                            label="Full Name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            name="email"
                            label="Email Address"
                            type="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            name="phone"
                            label="Phone Number"
                            value={formData.phone || ''}
                            onChange={handleChange}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            name="location"
                            label="Location"
                            value={formData.location || ''}
                            onChange={handleChange}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                    </Grid>
                    
                    {/* Account Settings */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Account Settings
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                name="role"
                                value={formData.role || 'Customer'}
                                onChange={handleChange}
                                label="Role"
                            >
                                <MenuItem value="Customer">Customer</MenuItem>
                                <MenuItem value="Seller">Seller</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                name="status"
                                value={formData.status || 'Active'}
                                onChange={handleChange}
                                label="Status"
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Suspended">Suspended</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    name="verified"
                                    checked={formData.verified || false}
                                    onChange={handleSwitchChange}
                                    color="success"
                                />
                            }
                            label="Verified Account"
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    name="allowMarketing"
                                    checked={formData.allowMarketing || false}
                                    onChange={handleSwitchChange}
                                    color="primary"
                                />
                            }
                            label="Allow Marketing Emails"
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                    </Grid>
                    
                    {/* Permissions (if role is Admin or Seller) */}
                    {(formData.role === 'Admin' || formData.role === 'Seller') && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    Permissions
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {availablePermissions.map(permission => (
                                        <Chip
                                            key={permission}
                                            label={getPermissionName(permission)}
                                            onClick={() => handlePermissionToggle(permission)}
                                            color={formData.permissions?.includes(permission) ? 'primary' : 'default'}
                                            variant={formData.permissions?.includes(permission) ? 'filled' : 'outlined'}
                                            sx={{ mb: 1 }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                        </>
                    )}
                    
                    {/* Additional Notes */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Additional Notes
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="notes"
                            label="Notes"
                            multiline
                            rows={4}
                            value={formData.notes || ''}
                            onChange={handleChange}
                            placeholder="Add any additional notes about this user..."
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={onClose} 
                    startIcon={<CancelIcon />}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained" 
                    color="primary"
                    disabled={isSubmitting}
                    startIcon={<SaveIcon />}
                >
                    {isSubmitting ? 'Saving...' : 'Save User'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserEditDialog;
