import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    
    // Load user data
    useEffect(() => {
        // Fetch user data and set current role
    }, [id]);
    
    const handleRoleChange = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`/api/admin/users/${id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            });
            
            if (response.ok) {
                toast.success('User role updated successfully');
                navigate('/admin/users');
            } else {
                throw new Error('Failed to update user role');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Box>
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Role</InputLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="seller">Seller</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                </Select>
            </FormControl>
            <Button 
                variant="contained" 
                onClick={handleRoleChange}
                disabled={loading}
            >
                Update Role
            </Button>
        </Box>
    );
}

export default UserEdit;
