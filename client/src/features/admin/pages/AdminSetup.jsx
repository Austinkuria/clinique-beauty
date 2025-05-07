import React, { useState, useContext, useRef } from 'react';
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
import { handleApiError } from '../../../components/ErrorHandler';
// Import the setUserAsAdmin function from userSyncService
import { setUserAsAdmin } from '../../../services/userSyncService';

// In a real application, this would be verified on the server side only
// This is just for demo purposes - in production, never hard-code the admin code in the frontend
const ADMIN_CODES = {
  dev: 'admin123', // Development code
  prod: 'clinique-beauty-admin-2023', // Match exactly with the database value
  fallback: 'clinique-admin-2023' // Also add the old code as fallback
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
  // Create a ref to store the code input element reference
  const codeInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter the admin setup code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Verify admin code - check all possible valid codes
      const isValidCode = code === ADMIN_CODES.dev || 
                          code === ADMIN_CODES.prod || 
                          code === ADMIN_CODES.fallback;
      
      if (!isValidCode) {
        setError('Invalid admin code. Please try again or contact your administrator.');
        setLoading(false);
        return;
      }
      
      // Store the code in a hidden input field for our helper function to access
      if (!document.getElementById('admin-setup-code')) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'admin-setup-code';
        hiddenInput.value = code;
        document.body.appendChild(hiddenInput);
      } else {
        document.getElementById('admin-setup-code').value = code;
      }
      
      // User verification passed, now update the user metadata with admin role
      if (user) {
        try {
          // First update Clerk metadata directly to ensure it works
          await user.update({
            publicMetadata: {
              ...user.publicMetadata,
              role: 'admin'
            }
          });
          
          console.log("Updated Clerk metadata with admin role");
          
          // Then call our helper function to update Supabase
          const result = await setUserAsAdmin(user, getToken);
          
          if (result) {
            // Success case - both Clerk and Supabase updated
            setSuccess(true);
            toast.success('Admin privileges granted successfully!');
          } else {
            // If setUserAsAdmin returns false but didn't throw
            console.warn("Admin role may have been partially set");
            // Still proceed to admin panel - the role is at least set in Clerk
            setSuccess(true);
            toast.success('Admin role set in Clerk. Database sync may be pending.');
          }
          
          // Wait 2 seconds before redirecting to admin panel
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
        } catch (adminError) {
          // Only throw if both methods fail
          console.error("Error setting admin role:", adminError);
          throw new Error('Failed to update admin role. Please try again.');
        }
      } else {
        throw new Error('User not authenticated');
      }
    } catch (err) {
      console.error('Error setting up admin privileges:', err);
      handleApiError(err, 'Failed to set up admin privileges');
      setError(err.message || 'Failed to set up admin privileges. Please try again later.');
    } finally {
      setLoading(false);
      // Clean up the hidden input
      setTimeout(() => {
        const hiddenInput = document.getElementById('admin-setup-code');
        if (hiddenInput) {
          hiddenInput.remove();
        }
      }, 500);
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
