import React, { useState, useContext, useEffect } from 'react';
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
// Import the clerk helpers
import { setUserRole } from '../../../utils/clerkHelpers';
// Import the mock admin API for development
import { mockAdminApi } from '../../../mocks/adminApi';
import { useAdmin } from '../../../context/AdminContext';

// In a real application, this would be verified on the server side only
// This is just for demo purposes - in production, never hard-code the admin code in the frontend
const ADMIN_CODES = {
  dev: 'admin123', // Development code
  prod: 'clinique-beauty-admin-2023', // Production code - matches database value
  fallback: 'clinique-admin-2023' // Fallback code for backward compatibility
};

function AdminSetup() {
  const { colorValues } = useContext(ThemeContext);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { isAdmin: contextIsAdmin, checkAdminStatus } = useAdmin();
  
  // Check if the user is already an admin
  useEffect(() => {
    if (isLoaded && user) {
      console.log("Checking if user is already admin. User metadata:", {
        publicMetadata: user.publicMetadata,
        unsafeMetadata: user.unsafeMetadata,
        organizations: user.organizations?.length > 0 ? user.organizations[0].publicMetadata : null
      });

      // Check all possible locations for the admin role
      const userRole = 
        (user.unsafeMetadata && user.unsafeMetadata.role) || 
        (user.publicMetadata && user.publicMetadata.role) ||
        (user.organizations && 
          user.organizations.length > 0 && 
          user.organizations[0].publicMetadata && 
          user.organizations[0].publicMetadata.memberRole);
      
      console.log("Detected user role:", userRole);
      
      if (userRole === 'admin') {
        setIsAdmin(true);
        // If already admin, redirect after a short delay
        setTimeout(() => {
          toast.success('You are already an admin');
          navigate('/admin');
        }, 1500);
      }
    }
  }, [user, navigate, isLoaded]);
  
  // Check if user is already an admin using both local state and context
  useEffect(() => {
    if (isLoaded && user) {
      console.log("Checking if user is already admin...");
      
      // Force a fresh check of admin status
      const adminStatus = checkAdminStatus();
      console.log("Admin status from context:", adminStatus);
      
      if (adminStatus || contextIsAdmin) {
        setIsAdmin(true);
        setTimeout(() => {
          toast.success('You are already an admin');
          navigate('/admin');
        }, 1000);
      }
    }
  }, [user, navigate, isLoaded, contextIsAdmin, checkAdminStatus]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter the admin setup code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Verify admin code - check all valid codes
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
      
      // DEVELOPMENT MODE: Use mock APIs and direct Clerk updates
      if (import.meta.env.DEV) {
        console.log("DEV MODE: Verifying admin code and updating role locally");
        
        // Verify code using mock API
        if (!mockAdminApi.verifyAdminCode(code)) {
          setError('Invalid admin code');
          setLoading(false);
          return;
        }
        
        // Try all update methods to ensure the role is set properly
        let roleUpdateSuccess = false;
        
        // Method 1: Try direct unsafeMetadata update
        try {
          console.log("Attempting direct unsafeMetadata update");
          await user.update({
            unsafeMetadata: { role: 'admin' }
          });
          roleUpdateSuccess = true;
          console.log("Successfully updated role using unsafeMetadata");
        } catch (err1) {
          console.error("unsafeMetadata update failed:", err1);
          
          // Method 2: Try session metadata
          try {
            if (user.update) {
              console.log("Attempting privateMetadata update");
              await user.update({
                privateMetadata: { role: 'admin' }
              });
              roleUpdateSuccess = true;
              console.log("Successfully updated role using privateMetadata");
            }
          } catch (err2) {
            console.error("privateMetadata update failed:", err2);
            
            // Method 3: Use our helper function
            try {
              roleUpdateSuccess = await setUserRole(user, 'admin');
            } catch (err3) {
              console.error("Helper method failed:", err3);
            }
          }
        }
        
        // Force reload user data
        try {
          await user.reload();
          console.log("User data reloaded after role update");
        } catch (reloadErr) {
          console.warn("Failed to reload user data:", reloadErr);
        }
        
        // In development, proceed even if role update fails
        setSuccess(true);
        if (roleUpdateSuccess) {
          toast.success('Admin privileges granted successfully!');
        } else {
          toast.success('Admin setup completed (role update may need reload)');
        }
        
        // Store admin status in localStorage as a fallback
        localStorage.setItem('userIsAdmin', 'true');
        
        // Wait 2 seconds before redirecting to admin panel
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
        return;
      }
      
      // PRODUCTION MODE: Use the full API with server verification
      // Use the helper function to set admin role
      const result = await setUserAsAdmin(user, getToken);
      
      if (result) {
        // Success case
        setSuccess(true);
        toast.success('Admin privileges granted successfully!');
        
        // Force reload user data
        try {
          await user.reload();
          console.log("User data reloaded after role update");
        } catch (reloadErr) {
          console.warn("Failed to reload user data:", reloadErr);
        }
        
        // Store admin status in localStorage as a fallback
        localStorage.setItem('userIsAdmin', 'true');
        
        // Wait 2 seconds before redirecting to admin panel
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        throw new Error('Failed to set admin role. Please try again.');
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

  // If already admin, show a message
  if (isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            backgroundColor: colorValues.bgPaper
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <AdminPanelSettingsIcon 
              sx={{ 
                fontSize: 60, 
                mb: 2, 
                color: colorValues.primary 
              }} 
            />
            <Typography variant="h4" gutterBottom>
              Already an Admin
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              You already have administrator privileges.
            </Typography>
            <CircularProgress size={24} sx={{ mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              Redirecting to admin panel...
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

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
