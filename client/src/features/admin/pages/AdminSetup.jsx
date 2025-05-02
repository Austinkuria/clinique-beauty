import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { ThemeContext } from '../../../context/ThemeContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { useApi } from '../../../api/apiClient';
import { handleApiError } from '../../../components/ErrorHandler';

// In a real application, this would be verified on the server side only
// This is just for demo purposes - in production, never hard-code the admin code in the frontend
const ADMIN_CODES = {
  dev: 'admin123', // Development code
  prod: import.meta.env.VITE_ADMIN_CODE || 'clinique-beauty-admin-2023' // Production code from env variable
};

function AdminSetup() {
  const { colorValues } = useContext(ThemeContext);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const api = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter the admin setup code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Verify admin code - in a real app, this would be a server-side verification
      const isValidCode = code === ADMIN_CODES.dev || code === ADMIN_CODES.prod;
      
      if (!isValidCode) {
        setError('Invalid admin code. Please try again or contact your administrator.');
        setLoading(false);
        return;
      }
      
      // User verification passed, now update the user metadata with admin role
      if (user) {
        // Get the token for API authorization
        const token = await getToken();
        
        // Call your backend API to update the user's role to admin
        await api.updateUserRole(user.id, 'admin', token);
        
        // Update successful
        setSuccess(true);
        toast.success('Admin privileges granted successfully!');
        
        // Wait 2 seconds before redirecting to admin panel
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        throw new Error('User not authenticated');
      }
    } catch (err) {
      console.error('Error setting up admin privileges:', err);
      handleApiError(err, 'Failed to set up admin privileges');
      setError(err.message || 'Failed to set up admin privileges. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          backgroundColor: colorValues.bgPaper,
          boxShadow: theme => theme === 'dark' 
            ? '0 8px 16px rgba(0,0,0,0.4)' 
            : '0 8px 16px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {success ? (
            <AdminPanelSettingsIcon 
              sx={{ 
                fontSize: 60, 
                mb: 2, 
                color: colorValues.primary 
              }} 
            />
          ) : (
            <LockOpenIcon 
              sx={{ 
                fontSize: 60, 
                mb: 2, 
                color: colorValues.primary 
              }} 
            />
          )}
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            {success ? 'Admin Access Granted' : 'Admin Setup'}
          </Typography>
          
          {!success && (
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Enter the admin setup code to gain admin privileges. Contact your system administrator for the code.
            </Typography>
          )}
        </Box>

        {success ? (
          <Fade in={success}>
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Admin privileges successfully granted! Redirecting to admin panel...
              </Alert>
              <CircularProgress size={30} sx={{ mt: 2 }} />
            </Box>
          </Fade>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Admin Setup Code"
              variant="outlined"
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
              autoComplete="off"
              placeholder="Enter your admin code"
              InputProps={{
                sx: {
                  borderRadius: 2,
                }
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ 
                py: 1.5, 
                borderRadius: '50px',
                backgroundColor: colorValues.primary,
                '&:hover': {
                  backgroundColor: colorValues.primaryDark
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Verify Admin Code'
              )}
            </Button>
            
            <Button
              variant="text"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ mt: 2, display: 'block', mx: 'auto' }}
              disabled={loading}
            >
              Back to Home
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
}

export default AdminSetup;
